package com.genca.qms.controller;

import com.genca.qms.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 健康检查接口：用于验证服务是否正常启动、前端代理是否连通。
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.success(Map.of(
                "service", "qms-backend",
                "status", "UP",
                "time", LocalDateTime.now().toString()
        ));
    }
}
