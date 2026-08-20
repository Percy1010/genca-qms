package com.genca.qms.controller;

import com.genca.qms.common.ApiResponse;
import com.genca.qms.common.CurrentUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 当前登录用户接口：前端验证 SSO 登录态、展示用户信息用。
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public ApiResponse<Map<String, String>> me() {
        return ApiResponse.success(Map.of(
                "uid", CurrentUser.uid(),
                "loginId", CurrentUser.loginId(),
                "sub", CurrentUser.sub(),
                "tenantId", CurrentUser.tenantId()
        ));
    }
}
