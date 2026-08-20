package com.genca.qms.config.sso;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * SSO JWT 认证过滤器（对齐 IPC 的 CacheCustomerAuthorizationMiddleware）：
 *
 * <ol>
 *   <li>从 Authorization: Bearer &lt;token&gt; 提取 access_token；</li>
 *   <li>解码 JWT payload 得到 claims（uid / lid / sub / tid，来自统一认证中心）；</li>
 *   <li>若配置开启 Redis 校验，则检查认证中心写入的缓存 key
 *       {@code sso:sid_{sub}:access_token} 是否存在（存在即登录态有效）；</li>
 *   <li>校验通过后将 claims 注入 SecurityContext，供业务层通过 CurrentUser 读取。</li>
 * </ol>
 *
 * <p>对齐 IPC 的实现：这里只解码 + 缓存校验，不校验签名（签名校验由认证中心/网关负责）。</p>
 */
@Slf4j
public class SsoAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHENTICATION_TYPE = "DefaultAuth";
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final SsoProperties ssoProperties;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SsoAuthenticationFilter(SsoProperties ssoProperties, StringRedisTemplate redisTemplate) {
        this.ssoProperties = ssoProperties;
        this.redisTemplate = redisTemplate;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = extractBearerToken(request);
        if (token == null || token.isBlank()) {
            // 无 token：放行，由 SecurityConfig 的授权规则决定（未认证接口返回 401）
            filterChain.doFilter(request, response);
            return;
        }

        Map<String, Object> claims = decodeJwtPayload(token);
        if (claims == null || !claims.containsKey("sub")) {
            writeUnauthorized(response, "登录已过期，请重新登录！");
            return;
        }

        if (ssoProperties.isVerifyRedis() && !isTokenValidInRedis(String.valueOf(claims.get("sub")))) {
            writeUnauthorized(response, "登录已过期，请重新登录！");
            return;
        }

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_USER")
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(claims, token, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }

    /** 从 Authorization 头提取 Bearer token */
    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader(AUTHORIZATION_HEADER);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            return null;
        }
        return header.substring(BEARER_PREFIX.length()).trim();
    }

    /**
     * 解码 JWT 的 payload 段（base64url → JSON）。
     * 仅解码不验签，与 IPC 的 JwtSecurityTokenHandler.ReadJwtToken 行为一致。
     */
    private Map<String, Object> decodeJwtPayload(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return null;
            }
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            String json = new String(decoded, StandardCharsets.UTF_8);
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("SSO token 解码失败: {}", e.getMessage());
            return null;
        }
    }

    /** 校验认证中心写入 Redis 的 token 缓存是否存在（对齐 IPC: sso:sid_{sub}:access_token） */
    private boolean isTokenValidInRedis(String sub) {
        if (redisTemplate == null) {
            log.error("SSO 校验要求 Redis，但未配置 Redis 连接（spring.data.redis）。");
            return false;
        }
        try {
            String key = ssoProperties.getRedisKeyPrefix().replace("{sub}", sub);
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            log.error("SSO Redis 校验异常: {}", e.getMessage());
            return false;
        }
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"code\":401,\"message\":\"" + message + "\",\"data\":null}");
    }
}
