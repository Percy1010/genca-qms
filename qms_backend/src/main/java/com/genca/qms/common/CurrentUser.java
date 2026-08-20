package com.genca.qms.common;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;

/**
 * 当前登录用户工具类。
 *
 * 认证通过后，SSO 过滤器会将 token 的 claims（uid / lid / sub / tid）放入
 * SecurityContext，业务层通过本类读取当前用户身份。
 */
public final class CurrentUser {

    private CurrentUser() {
    }

    /** 员工/账号 ID（来自统一认证中心 uid claim） */
    public static String uid() {
        return claim("uid");
    }

    /** 登录账号（lid claim） */
    public static String loginId() {
        return claim("lid");
    }

    /** 用户在认证中心的唯一标识（sub claim） */
    public static String sub() {
        return claim("sub");
    }

    /** 租户 ID（tid claim，SaaS 多租户用） */
    public static String tenantId() {
        return claim("tid");
    }

    @SuppressWarnings("unchecked")
    private static String claim(String name) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Map<?, ?> claims)) {
            return "";
        }
        Object value = ((Map<String, Object>) claims).get(name);
        return value == null ? "" : String.valueOf(value);
    }
}
