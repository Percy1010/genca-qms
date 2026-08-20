package com.genca.qms.trace;

import com.genca.qms.config.TraceDataSourceConfig;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 物料/批次业务数据只读查询（生产库 fangxing，只读数据源）。
 *
 * <p>仅执行 SELECT，配合只读连接池 + 只读事务，从机制上保证不对生产库做任何写操作。</p>
 */
@Repository
public class TraceMaterialRepository {

    /**
     * material_category 3 位码 → 中文类别标签。
     * <b>待业务确认</b>：当前按已观测样例归纳，若实际口径不同请在此调整。
     */
    private static final Map<String, String> CATEGORY_LABELS = Map.of(
            "001", "成品",
            "002", "半成品",
            "003", "原料",
            "004", "包材"
    );

    private final NamedParameterJdbcTemplate jdbc;

    public TraceMaterialRepository(
            @Qualifier(TraceDataSourceConfig.TRACE_JDBC_TEMPLATE) NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<TraceMaterial> MATERIAL_ROW_MAPPER = (rs, rowNum) -> {
        String catCode = rs.getString("materialCategory");
        String label = CATEGORY_LABELS.get(catCode);
        return new TraceMaterial(
                rs.getString("code"),
                rs.getString("name"),
                rs.getString("unit"),
                rs.getObject("validityDays", Integer.class),
                rs.getBoolean("salesFlag"),
                rs.getBoolean("purchaseFlag"),
                rs.getBoolean("wip"),
                rs.getString("materialType"),
                catCode,
                label != null ? label : catCode // 无映射时回退为原始码，交由前端展示
        );
    };

    /**
     * 在物料主数据里按关键词搜索：编码（oak_spec_no）或名称（short_name）模糊匹配。
     * 仅返回未停用（action_flag=1）、未删除（deleted=0）的记录。
     */
    @Transactional(TraceDataSourceConfig.TRACE_TX_MANAGER, readOnly = true)
    public List<TraceMaterial> searchMaterials(String keyword, int limit) {
        String sql = """
                SELECT s.oak_spec_no        AS code,
                       s.short_name         AS name,
                       u.unit_name          AS unit,
                       s.validity_days      AS validityDays,
                       s.sales_flag         AS salesFlag,
                       s.purchase_flag      AS purchaseFlag,
                       s.is_wip             AS wip,
                       s.material_type      AS materialType,
                       s.material_category  AS materialCategory
                FROM fangxing.maple_material_sku_tbl s
                LEFT JOIN fangxing.maple_unit_tbl u ON u.id = s.unit_id
                WHERE s.deleted = 0
                  AND s.action_flag = 1
                  AND (s.oak_spec_no LIKE :kw OR s.short_name LIKE :kw)
                ORDER BY s.oak_spec_no
                LIMIT :limit
                """;
        return jdbc.query(sql, new MapSqlParameterSource()
                .addValue("kw", "%" + keyword + "%")
                .addValue("limit", limit), MATERIAL_ROW_MAPPER);
    }
}