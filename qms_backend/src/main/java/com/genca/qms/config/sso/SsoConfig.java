package com.genca.qms.config.sso;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * SSO 认证相关 Bean 装配。
 */
@Configuration
@EnableConfigurationProperties(SsoProperties.class)
public class SsoConfig {

    @Bean
    public SsoAuthenticationFilter ssoAuthenticationFilter(
            SsoProperties ssoProperties,
            StringRedisTemplate redisTemplate) {
        return new SsoAuthenticationFilter(ssoProperties, redisTemplate);
    }
}
