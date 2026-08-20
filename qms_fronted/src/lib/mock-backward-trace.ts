/**
 * 逆向追溯 - 基于 genca 生产库真实数据的建模。
 *
 * 逆向追溯：从 ddg 成品（裸支）批次出发，逐层向上还原其实际生产投料来源：
 *   燕麦唇油 DD24F0011A  → 燕麦半成品7 DD24F0011N7  → 原料 QRYL01231
 *   白桃唇油 DD25F0261A  → 白桃半成品4 DD25F0261N4  → 原料 QRYL01231
 *   荔枝卸妆膏 DD25F0011A → 荔枝半成品 DD25F0131N    → 原料 QRYL01231
 *
 * 追溯路径依据「实际生产投料」（组装/领用）连接，而非 BOM 配方成分：
 * 仅保证 成品→半成品→原料 的投料链路与批次真实可追溯。
 */

import type {
  BatchStock,
  Category,
  SkuInfo,
  SkuMaster,
  StockInRecord,
} from "./mock-forward-trace"

export interface UpstreamMaterial {
  code: string
  name: string
  category: Category
  batchNo: string
  qty: number
  unit: string
  usageRatio: string
  provider: string
  orderNo: string
  status: "合格" | "待检" | "不合格"
}

export interface ReverseNode {
  sku: SkuInfo
  inventory: BatchStock
  stockInRecords: StockInRecord[]
  upstream: UpstreamMaterial[]
}

/* ==================== 物料常量（真实） ==================== */
const KD_OA = "ddg 舒润护唇精华油（燕麦香）4ml 燕麦唇油"
const KD_N7 = "ddg 舒润护唇精华油（燕麦香）半成品7（内料）"
const KD_PA = "ddg 舒润护唇精华油（白桃香）4ml 白桃唇油"
const KD_N4 = "ddg 舒润护唇精华油（白桃香）半成品4（内料）"
const KD_LA = "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏"
const KD_NLZ = "ddg 舒润特护唇部精华油（荔枝香）荔枝唇油 半成品（内料）"
const KD_RAW = "POLYSYNLANE HV"
const P_XXAE = "上海西西艾尔启东日用化学品有限公司"
const P_JT = "上海瑾亭化妆品有限公司"

/* ==================== 成品查询（远程搜索） ==================== */

/** 逆向追溯的查询起点：ddg 成品（裸支） */
export const reverseSkuMasters: SkuMaster[] = [
  {
    code: "DD24F0011A",
    name: KD_OA,
    category: "成品裸支",
    batches: ["B5A1021/20280109"],
  },
  {
    code: "DD25F0261A",
    name: KD_PA,
    category: "成品裸支",
    batches: ["J6F0521/20290604", "J6F0522"],
  },
  {
    code: "DD25F0011A",
    name: KD_LA,
    category: "成品裸支",
    batches: ["J5F1211/20280611"],
  },
]

export function searchReverseSkus(keyword: string): SkuMaster[] {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return reverseSkuMasters
  return reverseSkuMasters.filter(
    (s) =>
      s.code.toLowerCase().includes(kw) ||
      s.name.toLowerCase().includes(kw) ||
      s.category.toLowerCase().includes(kw)
  )
}

export function getReverseSku(code: string): SkuMaster | undefined {
  return reverseSkuMasters.find((s) => s.code === code)
}

export function searchReverseBatches(code: string, keyword: string): string[] {
  const sku = getReverseSku(code)
  if (!sku) return []
  const kw = keyword.trim().toLowerCase()
  if (!kw) return sku.batches
  return sku.batches.filter((b) => b.toLowerCase().includes(kw))
}

/**
 * 第一层（SPU→SKU 分组列表）展示的真实批次：取自 genca_prod `erp_stockin_order_detail_tbl`
 * （各 SKU 最新一批生产入库批次，batch_no=固化批次号，生产/效期/当前库存均真实）。
 * 半成品 P / 100ml S·T 质保期 179 天，其余成品 1095 天。
 */
export const firstLayerBatches: Record<string, BatchStock[]> = {
  DD25F0011A: [
    { batchNo: "J6H0711", productionDate: "2026-08-07", expiryDate: "2029-08-06", currentQty: 19852, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6E2511/20290524", productionDate: "2026-05-25", expiryDate: "2029-05-24", currentQty: 51602, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6E2311/20290522", productionDate: "2026-05-23", expiryDate: "2029-05-22", currentQty: 90203, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6E0911/202908", productionDate: "2026-05-11", expiryDate: "2029-05-10", currentQty: 20027, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6E0911/20290508", productionDate: "2026-05-09", expiryDate: "2029-05-08", currentQty: 10002, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6D2811/20290427", productionDate: "2026-04-28", expiryDate: "2029-04-27", currentQty: 35514, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6D2811/20290426", productionDate: "2026-04-27", expiryDate: "2029-04-26", currentQty: 23, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6D2711/20290426", productionDate: "2026-04-27", expiryDate: "2029-04-26", currentQty: 114179, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
  ],
  DD25F0011B: [
    { batchNo: "J6E0931/20290508", productionDate: "2026-05-09", expiryDate: "2029-05-08", currentQty: 31175, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6D2511/20290424", productionDate: "2026-04-25", expiryDate: "2029-04-24", currentQty: 98519, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6D2431/20290423", productionDate: "2026-04-24", expiryDate: "2029-04-23", currentQty: 81972, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6D1311/20290412", productionDate: "2026-04-13", expiryDate: "2029-04-12", currentQty: 30155, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6D0741/20290406", productionDate: "2026-04-07", expiryDate: "2029-04-06", currentQty: 30479, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6C2511/20290324", productionDate: "2026-03-25", expiryDate: "2029-03-24", currentQty: 42242, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6C2411/20290323", productionDate: "2026-03-24", expiryDate: "2029-03-23", currentQty: 59963, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6B2611/20290225", productionDate: "2026-02-26", expiryDate: "2029-02-25", currentQty: 47297, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
  ],
  DD25F0011C: [
    { batchNo: "J6D2411/20290423", productionDate: "2026-04-24", expiryDate: "2029-04-23", currentQty: 11039, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6C3111/20290330", productionDate: "2026-03-31", expiryDate: "2029-03-30", currentQty: 90072, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6C0611/20290305", productionDate: "2026-03-06", expiryDate: "2029-03-05", currentQty: 133622, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J9B1011/20290209", productionDate: "2026-02-10", expiryDate: "2029-02-09", currentQty: 4399, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6B1011/20290209", productionDate: "2026-02-10", expiryDate: "2029-02-09", currentQty: 73758, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6A2881/20290127", productionDate: "2026-01-28", expiryDate: "2029-01-27", currentQty: 61556, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6A2611/20290125", productionDate: "2026-01-26", expiryDate: "2029-01-25", currentQty: 76313, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6A2511/20290124", productionDate: "2026-01-25", expiryDate: "2029-01-24", currentQty: 75839, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
  ],
  DD25F0011D: [
    { batchNo: "J6E2361/20290522", productionDate: "2026-05-27", expiryDate: "2029-05-25", currentQty: 410445, unit: "PCS", qualityPeriodDays: 1094, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6D1551/20290414", productionDate: "2026-04-20", expiryDate: "2029-04-18", currentQty: 412029, unit: "PCS", qualityPeriodDays: 1094, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6D1381/20290412", productionDate: "2026-04-17", expiryDate: "2029-04-15", currentQty: 401171, unit: "PCS", qualityPeriodDays: 1094, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6C2871/20290327", productionDate: "2026-04-07", expiryDate: "2029-04-05", currentQty: 390169, unit: "PCS", qualityPeriodDays: 1094, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6C2781/20290326", productionDate: "2026-03-31", expiryDate: "2029-03-29", currentQty: 390320, unit: "PCS", qualityPeriodDays: 1094, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6C0921/20290308", productionDate: "2026-03-19", expiryDate: "2029-03-17", currentQty: 262760, unit: "PCS", qualityPeriodDays: 1094, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6C0911/20290308", productionDate: "2026-03-19", expiryDate: "2029-03-17", currentQty: 275013, unit: "PCS", qualityPeriodDays: 1094, warehouse: "U8-30018", status: "正常" },
    { batchNo: "R6C0211/20290301", productionDate: "2026-03-02", expiryDate: "2029-03-01", currentQty: 569066, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
  ],
  DD25F0011E: [
    { batchNo: "J6D1551/20290414", productionDate: "2026-04-15", expiryDate: "2029-04-14", currentQty: 45253, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6C2871/20290327", productionDate: "2026-03-28", expiryDate: "2029-03-27", currentQty: 46306, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "R6B1211/20290211", productionDate: "2026-02-12", expiryDate: "2029-02-11", currentQty: 50007, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6A3021/20290129", productionDate: "2026-01-30", expiryDate: "2029-01-29", currentQty: 53443, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J5J2221", productionDate: "2025-10-23", expiryDate: "2028-10-21", currentQty: 1, unit: "个", qualityPeriodDays: 1094, warehouse: "留样仓库", status: "正常" },
    { batchNo: "J5J2121", productionDate: "2025-10-22", expiryDate: "2028-10-20", currentQty: 1, unit: "个", qualityPeriodDays: 1094, warehouse: "留样仓库", status: "正常" },
    { batchNo: "J5J2221/20281021", productionDate: "2025-10-22", expiryDate: "2028-10-21", currentQty: 25821, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J5J2121/20281020", productionDate: "2025-10-21", expiryDate: "2028-10-20", currentQty: 83068, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
  ],
  DD25F0011F: [
    { batchNo: "J6E2361/20290522", productionDate: "2026-05-23", expiryDate: "2029-05-22", currentQty: 181671, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6D1551/20290414", productionDate: "2026-04-15", expiryDate: "2029-04-14", currentQty: 124189, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6D1381/20290412", productionDate: "2026-04-13", expiryDate: "2029-04-12", currentQty: 130696, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6C2871/20290327", productionDate: "2026-03-28", expiryDate: "2029-03-27", currentQty: 130696, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6C2781/20290326", productionDate: "2026-03-27", expiryDate: "2029-03-26", currentQty: 547067, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6C0911/20290308", productionDate: "2026-03-09", expiryDate: "2029-03-08", currentQty: 487859, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "R6B1211/20290211", productionDate: "2026-02-12", expiryDate: "2029-02-11", currentQty: 390028, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6B1041/20290209", productionDate: "2026-02-10", expiryDate: "2029-02-09", currentQty: 197943, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
  ],
  DD25F0011G: [
    { batchNo: "J6D1551/20290414", productionDate: "2026-04-15", expiryDate: "2029-04-14", currentQty: 74878, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6D1381/20290412", productionDate: "2026-04-13", expiryDate: "2029-04-12", currentQty: 144444, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6C0921/20290308", productionDate: "2026-03-09", expiryDate: "2029-03-08", currentQty: 62506, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "R6C0211/20290301", productionDate: "2026-03-02", expiryDate: "2029-03-01", currentQty: 141949, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6A0411/20290103", productionDate: "2026-01-04", expiryDate: "2029-01-03", currentQty: 66575, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6A0421/20290103", productionDate: "2026-01-04", expiryDate: "2029-01-03", currentQty: 69322, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "R5J2811/20281027", productionDate: "2025-10-28", expiryDate: "2028-10-27", currentQty: 63743, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J5J2221/20281021", productionDate: "2025-10-22", expiryDate: "2028-10-21", currentQty: 177472, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
  ],
  DD25F0011H: [
    { batchNo: "J6E2361/20290522", productionDate: "2026-05-23", expiryDate: "2029-05-22", currentQty: 90390, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6C2871/20290327", productionDate: "2026-03-28", expiryDate: "2029-03-27", currentQty: 30016, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6C0911/20290308", productionDate: "2026-03-09", expiryDate: "2029-03-08", currentQty: 30286, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "R6B1211/20290211", productionDate: "2026-02-12", expiryDate: "2029-02-11", currentQty: 16902, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6B1041/20290209", productionDate: "2026-02-10", expiryDate: "2029-02-09", currentQty: 63543, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6B0911/20290208", productionDate: "2026-02-09", expiryDate: "2029-02-08", currentQty: 13, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "R6A1211/20290111", productionDate: "2026-01-12", expiryDate: "2029-01-11", currentQty: 20006, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "R5K2811/20281127", productionDate: "2025-11-26", expiryDate: "2028-11-27", currentQty: 37, unit: "PCS", qualityPeriodDays: 1097, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
  ],
  DD25F0011J: [
    { batchNo: "MO059505", productionDate: "2026-05-18", expiryDate: "2029-05-17", currentQty: 13, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6E181/20290414", productionDate: "2026-04-15", expiryDate: "2029-04-14", currentQty: 9288, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "R6D171/20290301", productionDate: "2026-03-02", expiryDate: "2029-03-01", currentQty: 14796, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "R6D062/20290301", productionDate: "2026-03-02", expiryDate: "2029-03-01", currentQty: 8541, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "R6D041/20290211", productionDate: "2026-02-12", expiryDate: "2029-02-11", currentQty: 20013, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "R6D061/20290211", productionDate: "2026-02-12", expiryDate: "2029-02-11", currentQty: 11485, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "R6C092/20290211", productionDate: "2026-02-12", expiryDate: "2029-02-11", currentQty: 18058, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "R6C091/20281201", productionDate: "2025-12-02", expiryDate: "2028-12-01", currentQty: 14890, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
  ],
  DD25F0011K: [
    { batchNo: "J6D0711/20290406", productionDate: "2026-04-07", expiryDate: "2029-04-06", currentQty: 7506, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6C0711/20290306", productionDate: "2026-03-07", expiryDate: "2029-03-06", currentQty: 3366, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(待检)", status: "正常" },
    { batchNo: "J6A2011/20290119", productionDate: "2026-01-20", expiryDate: "2029-01-19", currentQty: 3532, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6A1911/20290118", productionDate: "2026-01-19", expiryDate: "2029-01-18", currentQty: 1535, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
  ],
  DD25F0011P: [
    { batchNo: "J6D0711/20290406", productionDate: "2026-04-07", expiryDate: "2026-10-03", currentQty: 30654, unit: "PCS", qualityPeriodDays: 179, warehouse: "U8-30018", status: "正常" },
    { batchNo: "J6C0711/20290306", productionDate: "2026-03-12", expiryDate: "2026-09-07", currentQty: 20627, unit: "PCS", qualityPeriodDays: 179, warehouse: "U8-30018", status: "正常" },
    { batchNo: "J6A1911/20290118", productionDate: "2026-01-22", expiryDate: "2026-07-20", currentQty: 6130, unit: "PCS", qualityPeriodDays: 179, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
    { batchNo: "J6A2011/20290119", productionDate: "2026-01-22", expiryDate: "2026-07-20", currentQty: 14567, unit: "PCS", qualityPeriodDays: 179, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
  ],
  DD25F0011R: [
    { batchNo: "J6C271/20290324", productionDate: "2026-03-25", expiryDate: "2029-03-24", currentQty: 29998, unit: "PCS", qualityPeriodDays: 1095, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
  ],
  DD25F0011S: [
    { batchNo: "J6C271/20290324", productionDate: "2026-03-27", expiryDate: "2026-09-22", currentQty: 20471, unit: "PCS", qualityPeriodDays: 179, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
  ],
  DD25F0011T: [
    { batchNo: "J6C271/20290324", productionDate: "2026-03-27", expiryDate: "2026-09-22", currentQty: 20471, unit: "PCS", qualityPeriodDays: 179, warehouse: "OEM瑾亭航谊仓（其然）(放行)", status: "正常" },
  ],
}

/**
 * 返回某成品 SKU 的可追溯批次库存列表：
 * - 有完整逆向链数据的批次（可上钻，如 DD25F0011A / J5F1211/20280611）优先展示；
 * - 其余为该 SPU 下 SKU 的真实生产入库批次（第一层展示，仅 DD25F0011A 可继续下钻）。
 */
export function getReverseBatchStocks(code: string): BatchStock[] {
  const deep: BatchStock[] =
    getReverseSku(code)?.batches.map((b) => queryReverseTrace(code, b)).filter((n): n is ReverseNode => Boolean(n)).map((n) => n.inventory) ?? []
  const real: BatchStock[] = firstLayerBatches[code] ?? []
  const seen = new Set(deep.map((b) => b.batchNo))
  return [...deep, ...real.filter((b) => !seen.has(b.batchNo))]
}

/* ==================== 节点构造辅助 ==================== */

function makeSku(
  code: string,
  name: string,
  category: Category,
  spec: string,
  unit: string,
  validityDays: number,
  provider: string
): SkuInfo {
  return {
    code,
    name,
    category,
    spec,
    unit,
    validityDays,
    purchaseFlag: category === "原料",
    salesFlag: category === "成品裸支",
    isWip: category === "成品裸支" || category === "半成品",
    defaultProvider: provider,
  }
}

/* ==================== 逆向追溯数据（真实） ==================== */

const reverseNodes: Record<string, ReverseNode> = {
  /* 燕麦唇油 → 燕麦半成品7 → QRYL01231 */
  "DD24F0011A|B5A1021/20280109": {
    sku: makeSku("DD24F0011A", KD_OA, "成品裸支", "4ml · 单支唇油", "PCS", 1095, P_XXAE),
    inventory: {
      warehouse: "成品仓",
      batchNo: "B5A1021/20280109",
      currentQty: 0,
      unit: "PCS",
      productionDate: "2025-01-19",
      expiryDate: "2028-01-09",
      qualityPeriodDays: 1095,
      status: "正常",
    },
    stockInRecords: [
      {
        stockInNo: "MRK250119003",
        provider: P_XXAE,
        businessType: "生产入库",
        workType: "生产完工入库",
        docType: "生产入库单",
        date: "2025-01-19",
        qty: 5184,
        unit: "PCS",
        sourceOrder: "-",
        orderNo: "-",
        supplier: "-",
      },
    ],
    upstream: [
      {
        code: "DD24F0011N7",
        name: KD_N7,
        category: "半成品",
        batchNo: "B5A102",
        qty: 14,
        unit: "千克",
        usageRatio: "实际生产投料",
        provider: P_XXAE,
        orderNo: "MRK250119003",
        status: "合格",
      },
    ],
  },

  "DD24F0011N7|B5A102": {
    sku: makeSku("DD24F0011N7", KD_N7, "半成品", "内料 · 乳化/均质", "千克", 180, P_JT),
    inventory: {
      warehouse: "OEM瑾亭航谊仓（其然）(待检)",
      batchNo: "B5A102",
      currentQty: 0,
      unit: "千克",
      productionDate: "2025-01-10",
      expiryDate: "2025-07-09",
      qualityPeriodDays: 180,
      status: "正常",
    },
    stockInRecords: [
      {
        stockInNo: "SCB5201010001",
        provider: P_JT,
        businessType: "生产入库",
        workType: "生产完工入库",
        docType: "生产入库单",
        date: "2025-01-10",
        qty: 14,
        unit: "千克",
        sourceOrder: "-",
        orderNo: "-",
        supplier: "-",
      },
    ],
    upstream: [
      {
        code: "QRYL01231",
        name: KD_RAW,
        category: "原料",
        batchNo: "642408",
        qty: 3.6,
        unit: "千克",
        usageRatio: "实际生产投料",
        provider: P_XXAE,
        orderNo: "MRK250119241",
        status: "合格",
      },
      {
        code: "QRYL01231",
        name: KD_RAW,
        category: "原料",
        batchNo: "642410",
        qty: 3.6,
        unit: "千克",
        usageRatio: "实际生产投料",
        provider: P_XXAE,
        orderNo: "MRK250119241",
        status: "合格",
      },
      {
        code: "QRYL01231",
        name: KD_RAW,
        category: "原料",
        batchNo: "642414",
        qty: 3.6,
        unit: "千克",
        usageRatio: "实际生产投料",
        provider: P_XXAE,
        orderNo: "MRK250119241",
        status: "合格",
      },
    ],
  },

  /* 白桃唇油 → 白桃半成品4 → QRYL01231 */
  "DD25F0261A|J6F0521/20290604": {
    sku: makeSku("DD25F0261A", KD_PA, "成品裸支", "4ml · 单支唇油", "PCS", 1095, P_JT),
    inventory: {
      warehouse: "OEM瑾亭航谊仓（其然）(放行)",
      batchNo: "J6F0521/20290604",
      currentQty: 1440,
      unit: "PCS",
      productionDate: "2026-06-05",
      expiryDate: "2029-06-04",
      qualityPeriodDays: 1095,
      status: "正常",
    },
    stockInRecords: [
      {
        stockInNo: "MRK26061800246",
        provider: P_JT,
        businessType: "生产入库",
        workType: "生产完工入库",
        docType: "生产入库单",
        date: "2026-06-18",
        qty: 6015,
        unit: "PCS",
        sourceOrder: "-",
        orderNo: "-",
        supplier: "-",
      },
    ],
    upstream: [
      {
        code: "DD25F0261N4",
        name: KD_N4,
        category: "半成品",
        batchNo: "J6F052",
        qty: 6200,
        unit: "千克",
        usageRatio: "实际生产投料",
        provider: P_JT,
        orderNo: "MRK26061800246",
        status: "合格",
      },
    ],
  },

  "DD25F0261N4|J6F052": {
    sku: makeSku("DD25F0261N4", KD_N4, "半成品", "内料 · 乳化/均质", "千克", 180, P_JT),
    inventory: {
      warehouse: "OEM瑾亭航谊仓（其然）(放行)",
      batchNo: "J6F052",
      currentQty: 6200,
      unit: "千克",
      productionDate: "2026-06-05",
      expiryDate: "2026-12-02",
      qualityPeriodDays: 180,
      status: "正常",
    },
    stockInRecords: [
      {
        stockInNo: "MRK2606050032",
        provider: P_JT,
        businessType: "生产入库",
        workType: "生产完工入库",
        docType: "生产入库单",
        date: "2026-06-05",
        qty: 6200,
        unit: "千克",
        sourceOrder: "ZZ260605018",
        orderNo: "ZZ260605018",
        supplier: "-",
      },
    ],
    upstream: [
      {
        code: "QRYL01231",
        name: KD_RAW,
        category: "原料",
        batchNo: "652425",
        qty: 35.5,
        unit: "千克",
        usageRatio: "实际生产投料",
        provider: P_JT,
        orderNo: "ZZ260605018",
        status: "合格",
      },
    ],
  },

  /* 荔枝卸妆膏 → 荔枝半成品 → QRYL01231 */
  "DD25F0011A|J5F1211/20280611": {
    sku: makeSku("DD25F0011A", KD_LA, "成品裸支", "110ml · 卸妆膏", "PCS", 1095, P_JT),
    inventory: {
      warehouse: "OEM瑾亭航谊仓（其然）(待检)",
      batchNo: "J5F1211/20280611",
      currentQty: 0,
      unit: "PCS",
      productionDate: "2025-06-13",
      expiryDate: "2028-06-11",
      qualityPeriodDays: 1095,
      status: "正常",
    },
    stockInRecords: [
      {
        stockInNo: "MRK25061300321",
        provider: P_JT,
        businessType: "生产入库",
        workType: "生产完工入库",
        docType: "生产入库单",
        date: "2025-06-13",
        qty: 1980,
        unit: "PCS",
        sourceOrder: "-",
        orderNo: "-",
        supplier: "-",
      },
    ],
    upstream: [
      {
        code: "DD25F0131N",
        name: KD_NLZ,
        category: "半成品",
        batchNo: "J5F091",
        qty: 78,
        unit: "千克",
        usageRatio: "实际生产投料",
        provider: P_JT,
        orderNo: "MRK25061300321",
        status: "合格",
      },
    ],
  },

  "DD25F0131N|J5F091": {
    sku: makeSku("DD25F0131N", KD_NLZ, "半成品", "内料 · 乳化/均质", "千克", 180, P_JT),
    inventory: {
      warehouse: "OEM瑾亭航谊仓（其然）(待检)",
      batchNo: "J5F091",
      currentQty: 0,
      unit: "千克",
      productionDate: "2025-06-09",
      expiryDate: "2025-12-06",
      qualityPeriodDays: 180,
      status: "正常",
    },
    stockInRecords: [
      {
        stockInNo: "MRK25060900566",
        provider: P_JT,
        businessType: "生产入库",
        workType: "组装入库",
        docType: "生产入库单",
        date: "2025-06-09",
        qty: 35.5,
        unit: "千克",
        sourceOrder: "ZZ250609029",
        orderNo: "ZZ250609029",
        supplier: "-",
      },
    ],
    upstream: [
      {
        code: "QRYL01231",
        name: KD_RAW,
        category: "原料",
        batchNo: "652401",
        qty: 35.5,
        unit: "千克",
        usageRatio: "实际生产投料",
        provider: P_JT,
        orderNo: "ZZ250609029",
        status: "合格",
      },
    ],
  },

  /* 原料 QRYL01231 投料叶节点（追溯终点） */
  "QRYL01231|642408": {
    sku: makeSku("QRYL01231", KD_RAW, "原料", "润肤油脂 · 氨基酸表面活性体系", "千克", 730, P_XXAE),
    inventory: { warehouse: "原料仓", batchNo: "642408", currentQty: 0, unit: "千克", productionDate: "2024-09-01", expiryDate: "2026-08-31", qualityPeriodDays: 730, status: "正常" },
    stockInRecords: [],
    upstream: [],
  },
  "QRYL01231|642410": {
    sku: makeSku("QRYL01231", KD_RAW, "原料", "润肤油脂 · 氨基酸表面活性体系", "千克", 730, P_XXAE),
    inventory: { warehouse: "原料仓", batchNo: "642410", currentQty: 0, unit: "千克", productionDate: "2024-10-15", expiryDate: "2026-10-14", qualityPeriodDays: 730, status: "正常" },
    stockInRecords: [],
    upstream: [],
  },
  "QRYL01231|642414": {
    sku: makeSku("QRYL01231", KD_RAW, "原料", "润肤油脂 · 氨基酸表面活性体系", "千克", 730, P_XXAE),
    inventory: { warehouse: "原料仓", batchNo: "642414", currentQty: 0, unit: "千克", productionDate: "2025-01-15", expiryDate: "2027-01-14", qualityPeriodDays: 730, status: "正常" },
    stockInRecords: [],
    upstream: [],
  },
  "QRYL01231|652425": {
    sku: makeSku("QRYL01231", KD_RAW, "原料", "润肤油脂 · 氨基酸表面活性体系", "千克", 730, P_JT),
    inventory: { warehouse: "原料仓", batchNo: "652425", currentQty: 0, unit: "千克", productionDate: "2026-06-05", expiryDate: "2028-06-04", qualityPeriodDays: 730, status: "正常" },
    stockInRecords: [],
    upstream: [],
  },
  "QRYL01231|652401": {
    sku: makeSku("QRYL01231", KD_RAW, "原料", "润肤油脂 · 氨基酸表面活性体系", "千克", 730, P_JT),
    inventory: { warehouse: "原料仓", batchNo: "652401", currentQty: 0, unit: "千克", productionDate: "2026-06-09", expiryDate: "2028-06-08", qualityPeriodDays: 730, status: "正常" },
    stockInRecords: [],
    upstream: [],
  },
}

/** 递进式上钻查询：输入 物料编码 + 物料批次，返回该节点一层内容 */
export function queryReverseTrace(code: string, batchNo: string): ReverseNode | null {
  const key = `${code.trim().toUpperCase()}|${batchNo.trim().toUpperCase()}`
  return reverseNodes[key] ?? null
}
