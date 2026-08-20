package com.genca.qms.config.sso;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * SSO 认证配置。
 *
 * 对齐 IPC 项目（Jinjia.Core.SSO + CacheCustomerAuthorizationMiddleware）：
 * 后端不验签，而是校验认证中心登录时写入 Redis 的 token 缓存
 * （key 形如 sso:sid_{sub}:access_token）是否存在，以此判定登录态。
 */
@Data
@ConfigurationProperties(prefix = "qms.sso")
public class SsoProperties {

    /** 是否启用 SSO 认证过滤器（开发联调可关闭） */
    private boolean enabled = true;

    /** 是否通过 Redis 校验 token 有效性（对齐 IPC）。关闭时仅解析 token 提取用户信息。 */
    private boolean verifyRedis = true;

    /** Redis 缓存 key 模板，{sub} 会被替换为 token 的 sub claim */
    private String redisKeyPrefix = "sso:sid_{sub}:access_token";

    /** Redis 数据库号（对齐 IPC 的 TokenCacheOptions.DbNumber） */
    private int redisDb = 0;
}
