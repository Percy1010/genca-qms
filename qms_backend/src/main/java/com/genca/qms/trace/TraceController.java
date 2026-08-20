package com.genca.qms.trace;

import com.genca.qms.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 产品追溯 REST 接口。
 *
 * <p>接口契约（对齐前端 src/lib/trace-api.ts）：</p>
 * <pre>
 *   GET /api/trace/materials?keyword=&limit=
 *   → ApiResponse { code=200, data: [ {code, name, unit, validityDays, salesFlag, purchaseFlag, wip, materialType, materialCategory, category} ] }
 * </pre>
 */
@RestController
@RequestMapping("/api/trace")
public class TraceController {

    private final TraceMaterialRepository repository;

    public TraceController(TraceMaterialRepository repository) {
        this.repository = repository;
    }

    /**
     * 物料主数据远程搜索（编码 / 名称模糊匹配）。
     */
    @GetMapping("/materials")
    public ApiResponse<List<TraceMaterial>> searchMaterials(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "limit", defaultValue = "20") int limit) {
        if (keyword == null || keyword.isBlank()) {
            return ApiResponse.success(List.of());
        }
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        List<TraceMaterial> data = repository.searchMaterials(keyword.trim(), safeLimit);
        return ApiResponse.success(data);
    }
}