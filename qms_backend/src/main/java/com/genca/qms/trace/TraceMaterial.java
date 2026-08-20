package com.genca.qms.trace;

/**
 * 物料主数据查询结果（对应 fangxing.maple_material_sku_tbl 的检索字段）。
 *
 * @param code              物料编码（oak_spec_no，运营侧物料规格编码）
 * @param name              物料名称（short_name）
 * @param unit              单位名称（关联 maple_unit_tbl.unit_name）
 * @param validityDays      有效期天数
 * @param salesFlag         销售标记（1=可作为销售品）
 * @param purchaseFlag      采购标记（1=需采购）
 * @param wip               是否在制品 WIP
 * @param materialType      物料类型 3 位码
 * @param materialCategory  物料类别 3 位码
 * @param category          中文类别标签（由 materialCategory 映射；未配置映射时回退为原始码，待业务确认）
 */
public record TraceMaterial(
        String code,
        String name,
        String unit,
        Integer validityDays,
        Boolean salesFlag,
        Boolean purchaseFlag,
        Boolean wip,
        String materialType,
        String materialCategory,
        String category) {
}