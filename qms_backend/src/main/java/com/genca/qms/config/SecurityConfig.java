package com.genca.qms.config;

import com.genca.qms.config.sso.SsoAuthenticationFilter;
import com.genca.qms.config.sso.SsoProperties;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.nio.charset.StandardCharsets;

/**
 * 安全配置（SSO 版）。
 *
 * <p>认证机制：SsoAuthenticationFilter 从请求头取 Bearer token，
 * 解码 + Redis 缓存校验后写入 SecurityContext（对齐 IPC 的
 * CacheCustomerAuthorizationMiddleware）。</p>
 *
 * <p>授权规则：健康检查、Swagger 放行；其余接口需要登录。
 * 开发联调可用 {@code qms.sso.enabled=false} 关闭校验、放行全部接口。</p>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String[] PUBLIC_PATHS = {
            "/api/health",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
    };

    private final SsoAuthenticationFilter ssoAuthenticationFilter;
    private final SsoProperties ssoProperties;

    public SecurityConfig(SsoAuthenticationFilter ssoAuthenticationFilter, SsoProperties ssoProperties) {
        this.ssoAuthenticationFilter = ssoAuthenticationFilter;
        this.ssoProperties = ssoProperties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.disable()) // CORS 由 CorsConfig 的 CorsFilter 处理
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(PUBLIC_PATHS).permitAll();
                    if (ssoProperties.isEnabled()) {
                        auth.anyRequest().authenticated();
                    } else {
                        // SSO 关闭（开发联调）：放行全部接口
                        auth.anyRequest().permitAll();
                    }
                })
                .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                    response.getWriter().write("{\"code\":401,\"message\":\"未登录或登录已过期\",\"data\":null}");
                }))
                .addFilterBefore(ssoAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
