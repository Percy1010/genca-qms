/**
 * 正向追溯 - 演示数据（基于 genca 生产库真实数据结构建模）。
 *
 * 交互模型（分步驱动）：
 *   ① 按编码/名称搜索并选择【物料】 → 查询
 *      返回：物料基本信息 + 该物料【批次库存列表】
 *   ② 选择某【批次】 → 返回该批次历史【入库】+【出库】+【生产出的半成品/成品】(产出物)
 *   ③ 点击某【产出物】→ 进入下一层【物料视图】（基本信息 + 批次库存列表）
 *   ④ 再选该产出物的【批次】→ 返回该批次【入库】+【出库】+【进一步成品】+【销售记录】
 */

export type Category = "原料" | "包材" | "半成品" | "成品裸支" | "成品组合"

export interface SkuInfo {
  code: string
  name: string
  category: Category
  spec: string
  unit: string
  validityDays: number
  purchaseFlag: boolean
  salesFlag: boolean
  isWip: boolean
  defaultProvider: string
  /** 品牌（生产库当前无对应字段，预留为空） */
  brand?: string
  /** 注册/备案号（生产库当前无对应字段，预留为空） */
  registrationNo?: string
  /** 产品备案名称（生产库当前无对应字段，预留为空） */
  productRegistrationName?: string
}

/** 批次库存行（逆向追溯仍展示库存；正向追溯前端不展示但类型共享，字段保持必填） */
export interface BatchStock {
  batchNo: string
  warehouse: string
  currentQty: number
  unit: string
  productionDate: string
  expiryDate: string
  qualityPeriodDays: number
  status: "正常" | "待检" | "冻结"
  /** 多仓库库存明细；缺省时视为单仓库（warehouse/currentQty） */
  stockByWarehouse?: { warehouse: string; currentQty: number}[]
}

export interface StockInRecord {
  /** 入库单号 */
  stockInNo: string
  /** 委外加工商 */
  provider: string
  /** 业务类型 */
  businessType: string
  /** 作业类型 */
  workType: string
  /** 单据类型 */
  docType: string
  /** 入库日期 */
  date: string
  /** 入库数量 */
  qty: number
  unit: string
  /** 源单单号 */
  sourceOrder: string
  /** 订单编号 */
  orderNo: string
  /** 供应商 */
  supplier: string
  /** 检验单号（可选，仅逆向报告展示用） */
  inspectionNo?: string
  /** 检验结果（可选） */
  inspectionResult?: "合格" | "不合格" | "免检"
  /** 展示层补充：批次编号（正向聚合查询填充） */
  batchNo?: string
  /** 展示层补充：生产日期（批次） */
  productionDate?: string
  /** 展示层补充：有效期至（批次） */
  expiryDate?: string
  /** 展示层补充：入库仓库（批次仓库） */
  warehouse?: string
}

export interface StockOutRecord {
  /** 出库单号 */
  stockOutNo: string
  /** 委外加工商 */
  provider: string
  /** 业务类型 */
  businessType: string
  /** 作业类型 */
  workType: string
  /** 单据类型 */
  docType: string
  /** 出库日期 */
  date: string
  /** 出库数量 */
  qty: number
  unit: string
  /** 源单单号 */
  sourceOrder: string
  /** 订单编号 */
  orderNo: string
  /** 供应商 */
  supplier: string
  /** 展示层补充：有效期至（批次） */
  expiryDate?: string
  /** 展示层补充：出库仓库（批次仓库） */
  warehouse?: string
  /** 展示层补充：送货单号（出库关联，无则 "-"） */
  deliveryNo?: string
  /** 展示层补充：批次编号 */
  batchNo?: string
}

/** 生产出来的半成品/成品（可继续下钻） */
export interface DownstreamProduct {
  code: string
  name: string
  category: Category
  batchNo: string
  qty: number
  unit: string
  date: string
  bomCode: string
  usageRatio: string
  provider: string
  orderNo: string
  status: "合格" | "待检" | "不合格"
  /** 展示层补充：品牌（产出物） */
  brand?: string
  /** 展示层补充：生产日期（产出物） */
  productionDate?: string
  /** 展示层补充：有效期至（产出物批次） */
  expiryDate?: string
}

/** 送货记录（供应商送货 → 收货入库，由入库记录派生并补全供应商/订单信息） */
export interface DeliveryRecord {
  batchNo: string
  productionDate: string
  expiryDate: string
  /** 送货单号（ASN） */
  deliveryNo: string
  /** 送货日期 */
  deliveryDate: string
  /** 送货数量 */
  deliveryQty: number
  /** 订单编号 */
  orderNo: string
  /** 订单行号 */
  orderLineNo: string
  /** 订单数量 */
  orderQty: number
  unit: string
  /** 单价（元） */
  price: number
  /** 供应商编码 */
  supplierCode: string
  /** 供应商名称 */
  supplierName: string
  /** 联系人 */
  contact: string
  /** 联系邮箱 */
  contactEmail: string
  /** 联系电话 */
  contactPhone: string
  /** 供应商地址 */
  supplierAddress: string
}

/** 领用记录（生产领用/耗用出库，由出库记录派生） */
export interface IssueRecord {
  materialCode: string
  materialName: string
  materialType: Category
  batchNo: string
  productionDate: string
  expiryDate: string
  /** 领用单号 */
  issueNo: string
  /** 领用数量 */
  issueQty: number
  unit: string
  /** 领用日期 */
  issueDate: string
  /** 委外加工商 */
  provider: string
  /** 生产工单 */
  workOrder: string
  /** 领料仓库 */
  warehouse?: string
}

export interface SalesRecord {
  /** 订单编号（平台订单号 tid） */
  orderNo: string
  /** 渠道名称（抖音 / 淘系 / 拼多多等） */
  channel: string
  /** 店铺名称 */
  shopName: string
  /** 平台货品名 */
  goodsName: string
  /** 平台规格名 */
  specName: string
  /** 交易日期 */
  date: string
  /** 数量 */
  qty: number
  unit: string
  /** 单价（元） */
  price: number
  /** 金额（元） */
  amount: number
  /** 客户信息（收货地区） */
  customer: string
}

/** 查询某【物料】后返回：基本信息 + 所有批次库存列表 */
export interface MaterialDetail {
  material: SkuInfo
  batches: BatchStock[]
}

/** 选择某【批次】后返回：单据流 + 产出物 + 销售 */
export interface BatchFlow {
  sku: SkuInfo
  batch: BatchStock
  inRecords: StockInRecord[]
  outRecords: StockOutRecord[]
  outputs: DownstreamProduct[]
  sales: SalesRecord[]
}

/* ==================== 物料主数据（远程搜索用） ==================== */

export interface SkuMaster {
  code: string
  name: string
  category: Category
  batches: string[]
}

export const skuMasters: SkuMaster[] = [
  { code: "QRYL01231", name: "POLYSYNLANE HV", category: "原料", batches: ["QC20240229", "642408", "642410", "642414", "642416", "642454", "652401", "652411", "652423", "652424", "652425", "652439", "652445"]},
  { code: "DD25F0261N4", name: "ddg 舒润护唇精华油（白桃香）半成品4（内料）", category: "半成品", batches: ["J6F052", "J6F051"]},
  { code: "DD25F0261A", name: "ddg 舒润护唇精华油（白桃香）4ml 白桃唇油", category: "成品裸支", batches: ["J6F0521/20290604", "J6F0522"]},
  { code: "DD24F0011N7", name: "ddg 舒润护唇精华油（燕麦香）半成品7（内料）", category: "半成品", batches: ["B5A102"]},
  { code: "DD24F0011A", name: "ddg 舒润护唇精华油（燕麦香）4ml 燕麦唇油", category: "成品裸支", batches: ["B5A1021/20280109"]},
  { code: "DD25F0131N", name: "ddg 舒润特护唇部精华油（荔枝香）荔枝唇油 半成品（内料）", category: "半成品", batches: ["J5F091", "J5F281", "J5G211", "J5G261", "J5H231", "J5H232", "J5I061", "J5I062", "J6G281"]},
  { code: "DD25F0011A", name: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", category: "成品裸支", batches: ["J5F1211/20280611"]},
]

/** 编码精确 / 名称模糊；未输入返回空 */
export function searchMaterials(keyword: string): SkuMaster[] {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return []
  return skuMasters.filter(
    (s) => s.code.toLowerCase() === kw || s.name.toLowerCase().includes(kw)
  )
}

export function getSku(code: string): SkuMaster | undefined {
  return skuMasters.find((s) => s.code === code)
}

/* ==================== 批次级数据 ==================== */

const DD_N4 = "ddg 舒润护唇精华油（白桃香） 半成品4（内料）"
const DD_A = "ddg 舒润护唇精华油（白桃香）4ml 白桃唇油"
const DD_N7 = "ddg 舒润护唇精华油（燕麦香）半成品7（内料）"
const DD_A7 = "ddg 舒润护唇精华油（燕麦香）4ml 燕麦唇油"
const DD_N_LZ = "ddg 舒润特护唇部精华油（荔枝香）荔枝唇油 半成品（内料）"
const DD_A_LZ = "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏"

/* —— QRYL01231（POLYSYNLANE HV）仓库编码 → 名称映射（来自 maple_warehouse_tbl）—— */
const W_053   = "OEM西西艾尔仓（其然）"
const W_30011 = "西西艾尔线边仓"
const W_30018 = "瑾亭线边仓"
const W_22DJ  = "OEM瑾亭航谊仓（其然）(待检)"
const W_22FX  = "OEM瑾亭航谊仓（其然）(放行)"
const W_23DJ  = "OEM西西艾尔海州仓（其然）(待检)"
const W_23FX  = "OEM西西艾尔海州仓（其然）(放行)"
const W_23KL  = "OEM西西艾尔海州仓（其然）(扣留)"

const DD_SKU: SkuInfo = { code: "QRYL01231", name: "POLYSYNLANE HV", category: "原料", spec: "润肤油脂 · 氨基酸表面活性体系", unit: "kg", validityDays: 730, purchaseFlag: true, salesFlag: false, isWip: false, brand: "无品牌", defaultProvider: "-"}

/** QRYL01231 批次消耗后产出的 ddg 燕麦香半成品7（下游产物，可继续下钻）
    来源：西西艾尔（002514）的 QRYL01231 批次（641408/642410/…/642454 等）；
    真实 B5A102 生产入库 41000 克（MRK250113282，源 WD241217008，2025-01-10） */
const DD_PROD_OUT = out("DD24F0011N7", DD_N7, "半成品", "B5A102", 41000, "克", "2025-01-10", "RP2-DD24F0011N7", "18%", "上海西西艾尔启东日用化学品有限公司", "WD241217008")

/** 652425 经组装单 ZZ260605018 产出的 ddg 白桃香半成品4（真实下游，可继续下钻）；真实 J6F052 入库 34100 克 */
const WHITE4_OUT = out("DD25F0261N4", DD_N4, "半成品", "J6F052", 34100, "克", "2026-06-05", "RP2-DD25F0261N4", "18%", "上海瑾亭化妆品有限公司", "ZZ260605018")

/** 652401 经组装单 ZZ250609029 产出的 ddg 荔枝香半成品（内料）（真实下游，可继续下钻）；真实 J5F091 入库 35500 克 */
const LITCHI_OUT = out("DD25F0131N", DD_N_LZ, "半成品", "J5F091", 35500, "克", "2025-06-09", "ZZ-DD25F0131N", "18%", "上海瑾亭化妆品有限公司", "ZZ250609029")
const LITCHI_OUT_211 = out("DD25F0131N", DD_N_LZ, "半成品", "J5G211", 36000, "克", "2025-07-21", "ZZ-DD25F0131N", "18%", "上海瑾亭化妆品有限公司", "ZZ250721052")
const LITCHI_OUT_261 = out("DD25F0131N", DD_N_LZ, "半成品", "J5G261", 78000, "克", "2025-07-26", "ZZ-DD25F0131N", "18%", "上海瑾亭化妆品有限公司", "ZZ250726001")
const LITCHI_OUT_231 = out("DD25F0131N", DD_N_LZ, "半成品", "J5H231", 28500, "克", "2025-08-23", "ZZ-DD25F0131N", "18%", "上海瑾亭化妆品有限公司", "ZZ250823022")
const LITCHI_OUT_6281 = out("DD25F0131N", DD_N_LZ, "半成品", "J6G281", 73000, "克", "2026-07-28", "ZZ-DD25F0131N", "18%", "上海瑾亭化妆品有限公司", "ZZ260728016")

/** 依据真实 maple_stock_tbl 建一条 QRYL01231（原料）批次流（真实库存，单位克；正向前端不展示库存但类型共享保留） */
function ddBatch(batchNo: string, prod: string, exp: string, warehouse: string, currentQty = 0): BatchFlow {
  return {
    sku: DD_SKU,
    batch: { batchNo, warehouse, currentQty, unit: "克", productionDate: prod, expiryDate: exp, qualityPeriodDays: 730, status: "正常"},
    inRecords: [],
    outRecords: [],
    outputs: [],
    sales: [],
 }
}

function out(
  code: string, name: string, category: Category, batchNo: string, qty: number,
  unit: string, date: string, bomCode: string, usageRatio: string,
  provider: string, orderNo: string, status: DownstreamProduct["status"] = "合格"
): DownstreamProduct {
  return { code, name, category, batchNo, qty, unit, date, bomCode, usageRatio, provider, orderNo, status}
}

const flows: Record<string, BatchFlow> = {
  /* ==================== ddg 舒润护唇精华油（白桃香）专属链 ==================== */

  /* ---------- 原料 POLYSYNLANE HV (QRYL01231) · 依据 maple_stock_tbl / 真实出入库单（数据库数量单位为克，页面 ÷1000 显示千克） ---------- */

  "QRYL01231|642408": {
    ...ddBatch("642408", "2024-03-05", "2026-03-04", W_053),
    inRecords: [
      { stockInNo: "MRK240612034", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "受托物料入库", workType: "送货入库", docType: "受托加工入库单", date: "2024-06-12", qty: 15000, unit: "克", sourceOrder: "ASN20240611000095", orderNo: "-", supplier: "-"},
      { stockInNo: "MRK240619017", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "生产领退料入库", workType: "生产领退料入库", docType: "生产入库单", date: "2024-06-19", qty: 14870, unit: "克", sourceOrder: "LT2406190006", orderNo: "-", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK240619017", provider: "-", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2024-06-19", qty: 14870, unit: "克", sourceOrder: "LT2406190006", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK240620042", provider: "-", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2024-06-20", qty: 11220, unit: "克", sourceOrder: "LT2406200016", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK240625054", provider: "-", businessType: "其他出库", workType: "其他出库", docType: "其他出库单", date: "2024-06-25", qty: 130, unit: "克", sourceOrder: "-", orderNo: "-", supplier: "-"},
    ],
    outputs: [DD_PROD_OUT],
 },
  "QRYL01231|642410": {
    ...ddBatch("642410", "2024-04-03", "2026-03-07", W_053),
    inRecords: [
      { stockInNo: "MRK241011037", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "受托物料入库", workType: "送货入库", docType: "受托加工入库单", date: "2024-10-11", qty: 15000, unit: "克", sourceOrder: "ASN20241009000104", orderNo: "-", supplier: "-"},
      { stockInNo: "MRK241016038", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "生产领退料入库", workType: "生产领退料入库", docType: "生产入库单", date: "2024-10-16", qty: 14950, unit: "克", sourceOrder: "LT2410160007", orderNo: "-", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK241016037", provider: "-", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2024-10-16", qty: 14950, unit: "克", sourceOrder: "LT2410160007", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK241017051", provider: "-", businessType: "生产耗用", workType: "生产耗用", docType: "生产出库单", date: "2024-10-17", qty: 6234.24, unit: "克", sourceOrder: "WD241017008", orderNo: "-", supplier: "-"},
    ],
    outputs: [DD_PROD_OUT],
 },
  "QRYL01231|642414": {
    ...ddBatch("642414", "2024-03-20", "2026-03-19", W_053),
    inRecords: [
      { stockInNo: "MRK241204054", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "受托物料入库", workType: "送货入库", docType: "受托加工入库单", date: "2024-12-04", qty: 15000, unit: "克", sourceOrder: "ASN20241203000069", orderNo: "-", supplier: "-"},
      { stockInNo: "MRK241209016", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "生产领退料入库", workType: "生产领退料入库", docType: "生产入库单", date: "2024-12-09", qty: 6960, unit: "克", sourceOrder: "LT2412090004", orderNo: "-", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK241209014", provider: "-", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2024-12-09", qty: 6960, unit: "克", sourceOrder: "LT2412090004", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK241210016", provider: "-", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2024-12-10", qty: 7990, unit: "克", sourceOrder: "LT2412100005", orderNo: "-", supplier: "-"},
    ],
    outputs: [DD_PROD_OUT],
 },
  "QRYL01231|642416": {
    ...ddBatch("642416", "2024-03-22", "2026-03-21", W_053),
    inRecords: [
      { stockInNo: "MRK241223056", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "受托物料入库", workType: "送货入库", docType: "受托加工入库单", date: "2024-12-23", qty: 30000, unit: "克", sourceOrder: "ASN20241219000067", orderNo: "-", supplier: "-"},
      { stockInNo: "MRK241225016", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "生产领退料入库", workType: "生产领退料入库", docType: "生产入库单", date: "2024-12-25", qty: 29950, unit: "克", sourceOrder: "LT2412250005", orderNo: "-", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK241225020", provider: "-", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2024-12-25", qty: 29950, unit: "克", sourceOrder: "LT2412250005", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK241224069", provider: "-", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2024-12-24", qty: 29950, unit: "克", sourceOrder: "DB2412240007", orderNo: "DB2412240007", supplier: "-"},
    ],
    outputs: [DD_PROD_OUT],
 },
  "QRYL01231|642454": {
    ...ddBatch("642454", "2024-12-25", "2026-12-24", W_23FX),
    inRecords: [
      { stockInNo: "MRK250401402", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "受托物料入库", workType: "送货入库", docType: "受托加工入库单", date: "2025-04-01", qty: 15000, unit: "克", sourceOrder: "ASN20250331000101", orderNo: "-", supplier: "-"},
      { stockInNo: "MRK250403092", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "生产领退料入库", workType: "生产领退料入库", docType: "生产入库单", date: "2025-04-03", qty: 14950, unit: "克", sourceOrder: "LT2504030092", orderNo: "-", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK250403471", provider: "-", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-04-03", qty: 14950, unit: "克", sourceOrder: "DB2504030128", orderNo: "DB2504030128", supplier: "-"},
      { stockOutNo: "MCK250426074", provider: "-", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2025-04-26", qty: 14950, unit: "克", sourceOrder: "LT2504260023", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK250429003", provider: "-", businessType: "生产耗用", workType: "生产耗用", docType: "生产出库单", date: "2025-04-29", qty: 936.425, unit: "克", sourceOrder: "WD250429001", orderNo: "-", supplier: "-"},
    ],
    outputs: [DD_PROD_OUT],
 },
  "QRYL01231|652401": {
    ...ddBatch("652401", "2025-01-07", "2027-01-06", W_22FX),
    inRecords: [
      { stockInNo: "MRK250514636", provider: "上海瑾亭化妆品有限公司", businessType: "受托物料入库", workType: "送货入库", docType: "受托加工入库单", date: "2025-05-14", qty: 15000, unit: "克", sourceOrder: "ASN20250512000208", orderNo: "-", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK250515224", provider: "-", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-05-15", qty: 14950, unit: "克", sourceOrder: "DB2505150011", orderNo: "DB2505150011", supplier: "-"},
      { stockOutNo: "MCK25060700077", provider: "-", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2025-06-07", qty: 5110, unit: "克", sourceOrder: "LT2506070035", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK25060900565", provider: "-", businessType: "其他出库", workType: "组装耗用", docType: "其他出库单", date: "2025-06-09", qty: 4717.51, unit: "克", sourceOrder: "ZZ250609029", orderNo: "ZZ250609029", supplier: "-"},
    ],
    outputs: [LITCHI_OUT],
 },

  /* 在库批次（放行仓） */
  "QRYL01231|652411": {
    ...ddBatch("652411", "2025-04-09", "2027-04-08", W_23FX),
    inRecords: [
      { stockInNo: "MRK25062700944", provider: "上海瑾亭化妆品有限公司", businessType: "受托物料入库", workType: "送货入库", docType: "受托加工入库单", date: "2025-06-27", qty: 15000, unit: "克", sourceOrder: "ASN20250626000037", orderNo: "-", supplier: "-"},
      { stockInNo: "MRK25071000356", provider: "上海瑾亭化妆品有限公司", businessType: "生产领退料入库", workType: "生产领退料入库", docType: "生产入库单", date: "2025-07-10", qty: 9550, unit: "克", sourceOrder: "LT2507100208", orderNo: "-", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK25062900327", provider: "-", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-06-29", qty: 15000, unit: "克", sourceOrder: "DB2506290049", orderNo: "DB2506290049", supplier: "-"},
      { stockOutNo: "MCK25070900356", provider: "-", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2025-07-09", qty: 14950, unit: "克", sourceOrder: "LT2507090084", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK25072600027", provider: "-", businessType: "其他出库", workType: "组装耗用", docType: "其他出库单", date: "2025-07-26", qty: 14166.36, unit: "克", sourceOrder: "ZZ250726001", orderNo: "ZZ250726001", supplier: "-"},
    ],
    outputs: [LITCHI_OUT_211, LITCHI_OUT_261],
 },
  "QRYL01231|652423": {
    ...ddBatch("652423", "2025-05-08", "2027-05-07", W_22FX),
    inRecords: [
      { stockInNo: "MRK25072100034", provider: "上海瑾亭化妆品有限公司", businessType: "受托物料入库", workType: "送货入库", docType: "受托加工入库单", date: "2025-07-18", qty: 15000, unit: "克", sourceOrder: "ASN20250717000036", orderNo: "-", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK25072100465", provider: "-", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-07-21", qty: 15000, unit: "克", sourceOrder: "DB2507210106", orderNo: "DB2507210106", supplier: "-"},
      { stockOutNo: "MCK25072900271", provider: "-", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2025-07-29", qty: 516, unit: "克", sourceOrder: "LT2507290146", orderNo: "-", supplier: "-"},
    ],
    outputs: [LITCHI_OUT_261],
 },
  "QRYL01231|652424": {
    ...ddBatch("652424", "2025-05-12", "2027-05-11", W_22FX),
    inRecords: [
      { stockInNo: "MRK25091500459", provider: "上海瑾亭化妆品有限公司", businessType: "受托物料入库", workType: "送货入库", docType: "受托加工入库单", date: "2025-09-15", qty: 30000, unit: "克", sourceOrder: "ASN20250912000048", orderNo: "-", supplier: "-"},
      { stockInNo: "MRK25091600496", provider: "上海瑾亭化妆品有限公司", businessType: "调拨入库", workType: "调拨入库", docType: "调拨入库单", date: "2025-09-16", qty: 30000, unit: "克", sourceOrder: "DB2509160089", orderNo: "DB2509160089", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK25091600492", provider: "-", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-09-16", qty: 30000, unit: "克", sourceOrder: "DB2509160089", orderNo: "DB2509160089", supplier: "-"},
      { stockOutNo: "MCK25092100284", provider: "-", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2025-09-21", qty: 9962.4, unit: "克", sourceOrder: "LT2509210112", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK25092500094", provider: "-", businessType: "其他出库", workType: "组装耗用", docType: "其他出库单", date: "2025-09-25", qty: 5121.684, unit: "克", sourceOrder: "ZZ250925011", orderNo: "ZZ250925011", supplier: "-"},
    ],
    outputs: [LITCHI_OUT_231],
 },
  "QRYL01231|652425": {
    ...ddBatch("652425", "2025-05-13", "2027-05-12", W_22FX),
    inRecords: [
      { stockInNo: "MRK25102900332", provider: "上海瑾亭化妆品有限公司", businessType: "受托物料入库", workType: "送货入库", docType: "受托加工入库单", date: "2025-10-29", qty: 15000, unit: "克", sourceOrder: "ASN20251028000001", orderNo: "PO20251023000170", supplier: "卡尔迪克商业（上海）有限公司"},
      { stockInNo: "MRK25103000185", provider: "上海瑾亭化妆品有限公司", businessType: "调拨入库", workType: "调拨入库", docType: "调拨入库单", date: "2025-10-30", qty: 15000, unit: "克", sourceOrder: "DB2510300037", orderNo: "DB2510300037", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK25103000166", provider: "-", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-10-30", qty: 15000, unit: "克", sourceOrder: "DB2510300037", orderNo: "DB2510300037", supplier: "-"},
      { stockOutNo: "MCK26060500352", provider: "上海瑾亭化妆品有限公司", businessType: "生产耗用", workType: "组装", docType: "加工出库单", date: "2026-06-05", qty: 3676.102, unit: "克", sourceOrder: "ZZ260605018", orderNo: "ZZ260605018", supplier: "-"},
    ],
    outputs: [WHITE4_OUT],
 },

  /* 在库批次（含实际非零库存） */
  "QRYL01231|652439": {
    ...ddBatch("652439", "2025-09-01", "2027-08-31", W_22FX),
    inRecords: [
      { stockInNo: "MRK25112100121", provider: "上海瑾亭化妆品有限公司", businessType: "受托物料入库", workType: "送货入库", docType: "受托加工入库单", date: "2025-11-21", qty: 15000, unit: "克", sourceOrder: "ASN20251119000160", orderNo: "-", supplier: "-"},
      { stockInNo: "MRK25112200027", provider: "上海瑾亭化妆品有限公司", businessType: "调拨入库", workType: "调拨入库", docType: "调拨入库单", date: "2025-11-22", qty: 15000, unit: "克", sourceOrder: "DB2511220004", orderNo: "DB2511220004", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK25112200023", provider: "-", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-11-22", qty: 15000, unit: "克", sourceOrder: "DB2511220004", orderNo: "DB2511220004", supplier: "-"},
      { stockOutNo: "MCK26072700303", provider: "-", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2026-07-27", qty: 3000, unit: "克", sourceOrder: "LT2607270029", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK26072800465", provider: "-", businessType: "其他出库", workType: "组装耗用", docType: "其他出库单", date: "2026-07-28", qty: 3501.984, unit: "克", sourceOrder: "ZZ260728016", orderNo: "ZZ260728016", supplier: "-"},
    ],
    outputs: [LITCHI_OUT_6281],
 },
  "QRYL01231|652445": {
    ...ddBatch("652445", "2025-10-01", "2027-09-30", W_22FX),
    inRecords: [
      { stockInNo: "MRK26080600131", provider: "上海瑾亭化妆品有限公司", businessType: "受托物料入库", workType: "送货入库", docType: "受托加工入库单", date: "2026-08-06", qty: 15000, unit: "克", sourceOrder: "ASN20260804000106", orderNo: "-", supplier: "-"},
      { stockInNo: "MRK26080900101", provider: "上海瑾亭化妆品有限公司", businessType: "调拨入库", workType: "调拨入库", docType: "调拨入库单", date: "2026-08-09", qty: 15000, unit: "克", sourceOrder: "DB2608090004", orderNo: "DB2608090004", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK26080900120", provider: "-", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2026-08-09", qty: 15000, unit: "克", sourceOrder: "DB2608090004", orderNo: "DB2608090004", supplier: "-"},
    ],
 },

  /* ---------- 原料 QRYL01231 · QC20240229（真实在库批：其然实验室 15000 克，QC 质检批/无去向） ---------- */
  "QRYL01231|QC20240229": {
    sku: DD_SKU,
    batch: { batchNo: "QC20240229", warehouse: "其然实验室", unit: "克", productionDate: "未知", expiryDate: "-", currentQty: 15000, qualityPeriodDays: 730, status: "待检"},
    inRecords: [],
    outRecords: [],
    outputs: [],
    sales: [],
 },

  /* ---------- 半成品4（内料）DD25F0261N4 · J6F052（真实：652425 → ZZ260605018 → 2026-06-05；入库 34100 克） ---------- */
  "DD25F0261N4|J6F052": {
    sku: { code: "DD25F0261N4", name: DD_N4, category: "半成品", spec: "内料 · 乳化/均质", unit: "克", validityDays: 180, purchaseFlag: false, salesFlag: false, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "J6F052", warehouse: "OEM瑾亭航谊仓（其然）(放行)", unit: "克", productionDate: "2026-06-05", expiryDate: "2026-12-02", currentQty: 0, qualityPeriodDays: 730, status: "正常"},
    inRecords: [
      { stockInNo: "MRK26060500327", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "组装入库", docType: "生产入库单", date: "2026-06-05", qty: 34100, unit: "克", sourceOrder: "ZZ260605018", orderNo: "ZZ260605018", supplier: "-"},
      { stockInNo: "MRK26061000228", provider: "上海瑾亭化妆品有限公司", businessType: "调拨入库", workType: "调拨入库", docType: "调拨入库单", date: "2026-06-10", qty: 34100, unit: "克", sourceOrder: "DB2606100022", orderNo: "DB2606100022", supplier: "-"},
      { stockInNo: "MRK26061600185", provider: "上海瑾亭化妆品有限公司", businessType: "生产领退料入库", workType: "生产领退料入库", docType: "生产入库单", date: "2026-06-16", qty: 34100, unit: "克", sourceOrder: "LT2606160045", orderNo: "LT2606160045", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK26061000250", provider: "上海瑾亭化妆品有限公司", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2026-06-10", qty: 34100, unit: "克", sourceOrder: "DB2606100022", orderNo: "DB2606100022", supplier: "-"},
      { stockOutNo: "MCK26061600218", provider: "上海瑾亭化妆品有限公司", businessType: "生产领用", workType: "生产领用", docType: "生产出库单", date: "2026-06-16", qty: 34100, unit: "克", sourceOrder: "LT2606160045", orderNo: "LT2606160045", supplier: "-"},
      { stockOutNo: "MCK26061800255", provider: "上海瑾亭化妆品有限公司", businessType: "生产耗用", workType: "生产耗用", docType: "生产出库单", date: "2026-06-18", qty: 20379.783, unit: "克", sourceOrder: "WD260618002", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK26062200079", provider: "上海瑾亭化妆品有限公司", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2026-06-22", qty: 10000, unit: "克", sourceOrder: "LT2606220019", orderNo: "LT2606220019", supplier: "-"},
      { stockOutNo: "MCK26062300642", provider: "上海瑾亭化妆品有限公司", businessType: "其他出库", workType: "其他出库", docType: "其他出库单", date: "2026-06-23", qty: 3720.217, unit: "克", sourceOrder: "-", orderNo: "-", supplier: "-"},
    ],
    outputs: [
      out("DD25F0261A", DD_A, "成品裸支", "J6F0521/20290604", 6015, "个", "2026-06-18", "BOM-DD25F0261A", "0.75 克/个", "上海瑾亭化妆品有限公司", "MRK26061800246"),
    ],
    sales: [],
 },

  /* ---------- 半成品 白桃4（内料）DD25F0261N4 · J6F051（真实：652424 → ZZ260605017 → 2026-06-05；入库 33000 克） ---------- */
  "DD25F0261N4|J6F051": {
    sku: { code: "DD25F0261N4", name: DD_N4, category: "半成品", spec: "内料 · 乳化/均质", unit: "克", validityDays: 180, purchaseFlag: false, salesFlag: false, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "J6F051", warehouse: "OEM瑾亭航谊仓（其然）(放行)", unit: "克", productionDate: "2026-06-05", expiryDate: "2026-12-02", currentQty: 0, qualityPeriodDays: 730, status: "正常"},
    inRecords: [
      { stockInNo: "MRK26060500326", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "组装入库", docType: "生产入库单", date: "2026-06-05", qty: 33000, unit: "克", sourceOrder: "ZZ260605017", orderNo: "ZZ260605017", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK26061600186", provider: "上海瑾亭化妆品有限公司", businessType: "生产领用", workType: "生产领用", docType: "生产出库单", date: "2026-06-16", qty: 33000, unit: "克", sourceOrder: "LT2606160044", orderNo: "LT2606160044", supplier: "-"},
    ],
    outputs: [],
    sales: [],
 },

  /* ---------- 成品 白桃唇油（4ml）DD25F0261A · J6F0521/20290604 ---------- */
  "DD25F0261A|J6F0521/20290604": {
    sku: { code: "DD25F0261A", name: DD_A, category: "成品裸支", spec: "4ml · 单支唇油", unit: "个", validityDays: 1095, purchaseFlag: false, salesFlag: true, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "J6F0521/20290604", warehouse: "OEM瑾亭航谊仓（其然）(放行)", unit: "个", productionDate: "2026-06-05", expiryDate: "2029-06-04", currentQty: 0, qualityPeriodDays: 1095, status: "正常"},
    inRecords: [
      { stockInNo: "MRK26061800246", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "生产完工入库", docType: "生产入库单", date: "2026-06-18", qty: 6015, unit: "个", sourceOrder: "-", orderNo: "-", supplier: "-"},
      { stockInNo: "MRK26062100230", provider: "上海瑾亭化妆品有限公司", businessType: "调拨入库", workType: "调拨入库", docType: "调拨入库单", date: "2026-06-21", qty: 5727, unit: "个", sourceOrder: "DB2606210061", orderNo: "DB2606210061", supplier: "-"},
      { stockInNo: "MRK26062200157", provider: "上海瑾亭化妆品有限公司", businessType: "调拨入库", workType: "调拨入库", docType: "调拨入库单", date: "2026-06-22", qty: 5727, unit: "个", sourceOrder: "DB2606220058", orderNo: "DB2606220058", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK26062100230", provider: "上海瑾亭化妆品有限公司", businessType: "厂内调拨", workType: "调拨出库", docType: "调拨出库单", date: "2026-06-21", qty: 5727, unit: "个", sourceOrder: "DB2606210061", orderNo: "DB2606210061", supplier: "-"},
      { stockOutNo: "MCK26062100275", provider: "上海瑾亭化妆品有限公司", businessType: "厂内调拨", workType: "调拨出库", docType: "调拨出库单", date: "2026-06-21", qty: 288, unit: "个", sourceOrder: "DB2606210101", orderNo: "DB2606210101", supplier: "-"},
      { stockOutNo: "MCK26062200157", provider: "上海瑾亭化妆品有限公司", businessType: "厂内调拨", workType: "调拨出库", docType: "调拨出库单", date: "2026-06-22", qty: 5727, unit: "个", sourceOrder: "DB2606220058", orderNo: "DB2606220058", supplier: "-"},
      { stockOutNo: "MCK26062400260", provider: "上海瑾亭化妆品有限公司", businessType: "交付出库", workType: "交付出库", docType: "交付出库单", date: "2026-06-24", qty: 1296, unit: "个", sourceOrder: "-", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK26062400263", provider: "上海瑾亭化妆品有限公司", businessType: "交付出库", workType: "交付出库", docType: "交付出库单", date: "2026-06-24", qty: 1839, unit: "个", sourceOrder: "-", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK26062600315", provider: "上海瑾亭化妆品有限公司", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2026-06-26", qty: 288, unit: "个", sourceOrder: "LT2606260036", orderNo: "LT2606260036", supplier: "-"},
      { stockOutNo: "MCK26062700086", provider: "上海瑾亭化妆品有限公司", businessType: "生产耗用", workType: "生产耗用", docType: "生产出库单", date: "2026-06-27", qty: 288, unit: "个", sourceOrder: "WD260627001", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK26062900200", provider: "上海瑾亭化妆品有限公司", businessType: "厂内调拨", workType: "调拨出库", docType: "调拨出库单", date: "2026-06-29", qty: 288, unit: "个", sourceOrder: "DB2606290055", orderNo: "DB2606290055", supplier: "-"},
    ],
    outputs: [],
    sales: [
      { orderNo: "5126892158037004615", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 宁波市 宁海县"},
      { orderNo: "6954887590671750649", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河北省 保定市 定兴县"},
      { orderNo: "6954894314332100209", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "湖南省 长沙市 芙蓉区"},
      { orderNo: "6928389835605179895", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "四川省 成都市 成华区"},
      { orderNo: "3315699732342001982", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖南省 永州市 冷水滩区"},
      { orderNo: "6928405859017456730", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "辽宁省 沈阳市 沈北新区"},
      { orderNo: "6928392266911285152", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "江苏省 无锡市 新吴区"},
      { orderNo: "6928399212255411409", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 郑州市 中原区"},
      { orderNo: "5127012146760034815", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 绍兴市 柯桥区"},
      { orderNo: "3315196671777227473", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河南省 商丘市 梁园区"},
      { orderNo: "3315230042377043776", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 萧山区"},
      { orderNo: "3315227558975001199", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 广安市 广安区"},
      { orderNo: "3315200775274030069", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 金华市 婺城区"},
      { orderNo: "6928415077581880456", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "山东省 青岛市 市北区"},
      { orderNo: "3315201387336015191", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 增城区"},
      { orderNo: "3315203151556049953", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 通州区"},
      { orderNo: "6954918185228178597", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河北省 石家庄市 长安区"},
      { orderNo: "5127289560617156943", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 雅安市 雨城区"},
      { orderNo: "5127020246427066325", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "天津 天津市 河西区"},
      { orderNo: "5126849427138028407", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 长宁区"},
      { orderNo: "6954928740230895097", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河北省 保定市 竞秀区"},
      { orderNo: "3315239114199060855", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "重庆 重庆市 大渡口区"},
      { orderNo: "260802-119715981740121", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,白桃香型（新香）", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "3315227091496124797", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 临平区"},
      { orderNo: "3315271262667009587", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "贵州省 安顺市 平坝区"},
      { orderNo: "6928418474914643547", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "浙江省 绍兴市 柯桥区"},
      { orderNo: "3315705601964012171", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 建德市"},
      { orderNo: "260802-645629242910804", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,白桃香型（新香）", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "6954920747548481494", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "天津 天津市 滨海新区"},
      { orderNo: "6954925136604960709", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "贵州省 毕节市 金沙县"},
      { orderNo: "5127345540653065228", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 中山市"},
      { orderNo: "3315295563479073251", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖北省 武汉市 黄陂区"},
      { orderNo: "6954943085334828326", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "浙江省 杭州市 萧山区"},
      { orderNo: "5127094658869038533", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 宁波市 北仑区"},
      { orderNo: "3315767881040003289", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 上城区"},
      { orderNo: "3315307227484021789", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广西壮族自治区 南宁市 青秀区"},
      { orderNo: "3315313599203070381", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖北省 武汉市 江夏区"},
      { orderNo: "3315310755775024360", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 越秀区"},
      { orderNo: "5127421213822141212", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "重庆 重庆市 南岸区"},
      { orderNo: "260803-444826938912165", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,白桃香型（新香）", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "3315789553897001393", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 徐州市 贾汪区"},
      { orderNo: "3315953676701040385", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 浦东新区"},
      { orderNo: "5127387912119005103", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 揭阳市 榕城区"},
      { orderNo: "3315799453287012579", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 东莞市"},
      { orderNo: "6928432488790654712", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 东莞市 东莞市"},
      { orderNo: "260803-525588272711194", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,白桃香型（新香）", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "5127485113701004545", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 大兴区"},
      { orderNo: "3316019700315016094", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 揭阳市 普宁市"},
      { orderNo: "260803-339906445641029", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,白桃香型（新香）", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "5127017043894022033", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖北省 黄冈市 麻城市"},
      { orderNo: "260803-103431564913918", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,白桃香型（新香）", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "3315896617929033985", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 徐州市 睢宁县"},
      { orderNo: "3315440967437007157", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 徐州市 睢宁县"},
      { orderNo: "5127540013398008816", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河南省 开封市 尉氏县"},
      { orderNo: "5127039759044001948", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 青浦区"},
      { orderNo: "5127039759561013434", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 泸州市 泸县"},
      { orderNo: "3315906085076026872", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖北省 武汉市 汉阳区"},
      { orderNo: "3316076256837002862", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "福建省 漳州市 云霄县"},
      { orderNo: "5127043215469000319", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "重庆 重庆市 江北区"},
      { orderNo: "5127489612222000319", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "重庆 重庆市 九龙坡区"},
      { orderNo: "3315483194647002983", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖南省 岳阳市 平江县"},
      { orderNo: "6928462437861588626", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-04", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "江苏省 扬州市 江都区"},
      { orderNo: "6928462532285594945", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-04", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 深圳市 宝安区"},
      { orderNo: "5127237254540118912", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 朝阳区"},
      { orderNo: "3315547490446001192", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 宜宾市 翠屏区"},
      { orderNo: "6954952164158215826", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-04", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "上海 上海市 闵行区"},
      { orderNo: "6928459014673235649", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-04", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 汕头市 潮南区"},
      { orderNo: "6928469647887203516", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-04", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "江苏省 淮安市 涟水县"},
      { orderNo: "3315558399550014655", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 温州市 乐清市"},
      { orderNo: "5127550488240004549", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "黑龙江省 七台河市 桃山区"},
      { orderNo: "5127561108094025824", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 惠州市 惠东县"},
      { orderNo: "6928472183092444242", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-04", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 湛江市 霞山区"},
      { orderNo: "3315617582533035089", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 成都市 新津区"},
      { orderNo: "5127568668170022832", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 南充市 阆中市"},
      { orderNo: "5127299210271128834", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 增城区"},
      { orderNo: "3315620714916237276", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "陕西省 咸阳市 渭城区"},
      { orderNo: "3315623594059020864", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "福建省 福州市 台江区"},
      { orderNo: "3316054189075207973", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 徐汇区"},
      { orderNo: "5127301370207034126", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 成都市 双流区"},
      { orderNo: "3315625394191027692", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 东莞市"},
      { orderNo: "6928466093016448496", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-04", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 肇庆市 端州区"},
      { orderNo: "3315625790531354286", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 光明区"},
      { orderNo: "5127571800394028143", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 湖州市 吴兴区"},
      { orderNo: "5127626953645028339", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广西壮族自治区 钦州市 钦南区"},
      { orderNo: "5127126375072007101", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "云南省 昆明市 官渡区"},
      { orderNo: "5127302090305025218", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 景德镇市 珠山区"},
      { orderNo: "3316225296431015588", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 宿迁市 沭阳县"},
      { orderNo: "260805-302084298320326", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,白桃香型（新香）", date: "2026-08-05", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "6928470797207567381", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-05", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "福建省 南平市 武夷山市"},
      { orderNo: "MI634710017890717696", channel: "自有", shopName: "自有门店", goodsName: "ddg 舒润护唇精华油（白桃香）4ml 白桃唇油", specName: " ", date: "2026-08-05", qty: 1, unit: "个", price: 0.0, amount: 0, customer: "山西省 太原市 万柏林区"},
      { orderNo: "3316242828640020090", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "安徽省 芜湖市 弋江区"},
      { orderNo: "3315644114839085693", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 吉安市 永丰县"},
      { orderNo: "3315662294586292376", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 常州市 钟楼区"},
      { orderNo: "6954997267708974494", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-05", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广西壮族自治区 南宁市 西乡塘区"},
      { orderNo: "5127321962610009717", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 宝安区"},
      { orderNo: "5127149343262075720", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 德阳市 旌阳区"},
      { orderNo: "5127339890160018434", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河北省 石家庄市 裕华区"},
      { orderNo: "3315674247649002397", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 拱墅区"},
      { orderNo: "6928486518571695951", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-05", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 安阳市 龙安区"},
      { orderNo: "3315697611517222991", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 白云区"},
      { orderNo: "3315723026586036352", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖北省 武汉市 洪山区"},
      { orderNo: "3316182277708088591", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 赣州市 章贡区"},
      { orderNo: "5127356738014060618", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 朝阳区"},
      { orderNo: "5127609528003072009", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "甘肃省 兰州市 安宁区"},
      { orderNo: "3315737031390004873", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 汕尾市 海丰县"},
      { orderNo: "5127357890021003634", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 龙岗区"},
      { orderNo: "3316359288926012598", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "陕西省 西安市 未央区"},
      { orderNo: "3316189981157017385", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖北省 武汉市 青山区"},
      { orderNo: "3315757442042003968", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 宁波市 鄞州区"},
      { orderNo: "6928490145206140175", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "辽宁省 盘锦市 兴隆台区"},
      { orderNo: "6928502332553068378", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广西壮族自治区 南宁市 西乡塘区"},
      { orderNo: "260806-284122212760707", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg燕麦荔枝唇油保湿滋润唇部精华去死皮淡唇纹秋冬换季补水唇膏", specName: "4.0g 白桃滋养唇油", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "3315740703150009881", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 金华市 婺城区"},
      { orderNo: "3315739947426006795", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "内蒙古自治区 赤峰市 松山区"},
      { orderNo: "5127172239440005046", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 苏州市 相城区"},
      { orderNo: "5127680305094005218", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 徐汇区"},
      { orderNo: "3316467144717072950", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "海南省 海口市 琼山区"},
      { orderNo: "6955014129670690264", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 安阳市 龙安区"},
      { orderNo: "6955030336457545326", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "安徽省 淮北市 杜集区"},
      { orderNo: "6955010381118379288", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 新乡市 原阳县"},
      { orderNo: "260806-503164475033381", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,白桃香型（新香）", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "6928505976108842745", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 梅州市 梅县区"},
      { orderNo: "5127621948670043747", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 常州市 武进区"},
      { orderNo: "5127356702156111730", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 德阳市 旌阳区"},
      { orderNo: "3316520316215059376", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 绍兴市 新昌县"},
      { orderNo: "5127678757162019732", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 无锡市 梁溪区"},
      { orderNo: "3315913178725039671", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖北省 武汉市 洪山区"},
      { orderNo: "3316347013717120782", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖南省 长沙市 宁乡市"},
      { orderNo: "6955012917268124809", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-07", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 广州市 白云区"},
      { orderNo: "6955031024038122968", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-07", qty: 2, unit: "个", price: 49.0, amount: 98, customer: "广东省 佛山市 南海区"},
      { orderNo: "6928523410474761910", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-07", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "安徽省 芜湖市 弋江区"},
      { orderNo: "3315897375618078457", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 萧山区"},
      { orderNo: "5127357926163076641", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 苏州市 虎丘区"},
      { orderNo: "3315897123912063678", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 汕头市 潮阳区"},
      { orderNo: "6928517678413348745", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-07", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "浙江省 宁波市 象山县"},
      { orderNo: "3316350217104039483", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 佛山市 禅城区"},
      { orderNo: "5127679549185163027", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "山西省 临汾市 吉县"},
      { orderNo: "6928515991557930512", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-07", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "江苏省 常州市 武进区"},
      { orderNo: "3316538316144014397", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 钱塘区"},
      { orderNo: "5127359438001072526", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 南通市 如东县"},
      { orderNo: "6955024532163794860", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-07", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "北京 北京市 大兴区"},
      { orderNo: "3316575756964009564", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 宁波市 海曙区"},
      { orderNo: "3316578384345003194", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 上城区"},
      { orderNo: "3316577124461002178", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "吉林省 松原市 扶余市"},
      { orderNo: "3316616472579096278", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖北省 武汉市 武昌区"},
      { orderNo: "3315999867688039087", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "黑龙江省 哈尔滨市 香坊区"},
      { orderNo: "3316008002746098268", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "安徽省 合肥市 肥西县"},
      { orderNo: "3316450297361088976", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "陕西省 咸阳市 渭城区"},
      { orderNo: "6955027466762917861", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-07", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 鹤壁市 山城区"},
      { orderNo: "5127682069077009641", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 罗湖区"},
      { orderNo: "6955058490677728482", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "四川省 成都市 新都区"},
      { orderNo: "6955058681780376597", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "安徽省 马鞍山市 花山区"},
      { orderNo: "3316007319590001572", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 朝阳区"},
      { orderNo: "3316634544340176557", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 萧山区"},
      { orderNo: "3316635552243189864", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖南省 邵阳市 双清区"},
      { orderNo: "6928543369440034655", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "重庆 重庆市 巫山县"},
      { orderNo: "3316639836951026091", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河南省 郑州市 管城回族区"},
      { orderNo: "5127683149117360701", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 龙华区"},
      { orderNo: "5127183759140034322", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 嘉兴市 平湖市"},
      { orderNo: "3316676880262016684", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "重庆 重庆市 北碚区"},
      { orderNo: "6955075407346865267", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "贵州省 贵阳市 观山湖区"},
      { orderNo: "260808-219928368732673", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,白桃香型（新香）", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "6955073294945884038", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "云南省 临沧市 镇康县"},
      { orderNo: "5127182823179001544", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 朝阳区"},
      { orderNo: "6928553619196706372", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 广州市 黄埔区"},
      { orderNo: "5127681565193076937", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 黄埔区"},
      { orderNo: "3316087203126008872", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "黑龙江省 哈尔滨市 松北区"},
      { orderNo: "6955076380436927613", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "重庆 重庆市 沙坪坝区"},
      { orderNo: "6955055882486945559", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "山东省 青岛市 黄岛区"},
      { orderNo: "5127627456216019120", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 成都市 双流区"},
      { orderNo: "6955065078442235558", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "辽宁省 铁岭市 银州区"},
      { orderNo: "5127683797211026320", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "重庆 重庆市 巴南区"},
      { orderNo: "6928556329282076436", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "黑龙江省 鹤岗市 兴安区"},
      { orderNo: "260809-473956359721805", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,白桃香型（新香）", date: "2026-08-09", qty: 2, unit: "个", price: 49.0, amount: 98, customer: "-"},
      { orderNo: "6928560622228504156", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "江苏省 苏州市 常熟市"},
      { orderNo: "3316100199658022273", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 朝阳区"},
      { orderNo: "3316129250579068075", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 闵行区"},
      { orderNo: "3316578061440289861", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 萍乡市 安源区"},
      { orderNo: "3316137315989022257", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "山西省 太原市 杏花岭区"},
      { orderNo: "6928575969158266254", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 东莞市 东莞市"},
      { orderNo: "5127681961284007829", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "辽宁省 铁岭市 昌图县"},
      { orderNo: "260809-422869757523262", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg燕麦荔枝唇油保湿滋润唇部精华去死皮淡唇纹秋冬换季补水唇膏", specName: "4.0g 白桃滋养唇油", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "3316178210184006271", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 珠海市 香洲区"},
      { orderNo: "3316614529149035482", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "重庆 重庆市 秀山土家族苗族自治县"},
      { orderNo: "3316790460366001282", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖南省 长沙市 岳麓区"},
      { orderNo: "6955087449411884648", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "福建省 泉州市 永春县"},
      { orderNo: "5127360554291104730", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 普陀区"},
      { orderNo: "5127625620373024747", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "云南省 昆明市 官渡区"},
      { orderNo: "5127682681316152817", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "福建省 福州市 晋安区"},
      { orderNo: "6928581116612344947", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 郑州市 二七区"},
      { orderNo: "5127180879376089647", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖南省 长沙市 芙蓉区"},
      { orderNo: "3316793232470001282", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖南省 长沙市 岳麓区"},
      { orderNo: "6955085506400163680", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【徐振轩同款ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河北省 承德市 承德县"},
      { orderNo: "3316620757037018099", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "天津 天津市 西青区"},
      { orderNo: "5127360446308086738", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 普陀区"},
      { orderNo: "3316798164200067370", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 中山市"},
      { orderNo: "3316622305694025690", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 韶关市 武江区"},
      { orderNo: "3316175727355132355", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖南省 长沙市 开福区"},
      { orderNo: "5127682285362025532", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "甘肃省 白银市 景泰县"},
      { orderNo: "3316628965508145794", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 无锡市 宜兴市"},
      { orderNo: "5127627636304019409", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 成都市 郫都区"},
      { orderNo: "6928583709048864644", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【徐振轩同款ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "四川省 自贡市 自流井区"},
      { orderNo: "3316805220234001175", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 宝安区"},
      { orderNo: "5127181311366017446", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 南通市 崇川区"},
      { orderNo: "3316636561616044054", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 韶关市 武江区"},
      { orderNo: "6955113102650643606", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【徐振轩同款ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "白桃滋养唇油4ml*1支", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "浙江省 杭州市 淳安县"},
      { orderNo: "260810-418885178900937", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,白桃香型（新香）", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "3316820700110044452", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 2, unit: "个", price: 118.0, amount: 236, customer: "山东省 临沂市 罗庄区"},
      { orderNo: "MI636590646173503488", channel: "自有", shopName: "自有门店", goodsName: "ddg 舒润护唇精华油（白桃香）4ml 白桃唇油", specName: " ", date: "2026-08-10", qty: 2, unit: "个", price: 0.0, amount: 0, customer: "浙江省 杭州市 西湖区"},
      { orderNo: "3316843092656156367", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 白云区"},
      { orderNo: "3316671373704061594", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4.00ml[【新香上市】白桃滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "山东省 济宁市 任城区"},
      { orderNo: "260810-452355714633052", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,白桃香型（新香）", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
    ],
 },

  /* ---------- 成品 白桃唇油（4ml）DD25F0261A · J6F0522（真实在库批，放行仓无下游） ---------- */
  "DD25F0261A|J6F0522": {
    sku: { code: "DD25F0261A", name: DD_A, category: "成品裸支", spec: "4ml · 单支唇油", unit: "个", validityDays: 1095, purchaseFlag: false, salesFlag: true, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "J6F0522", warehouse: "OEM瑾亭航谊仓（其然）(放行)", unit: "个", productionDate: "2026-06-05", expiryDate: "2029-06-04", currentQty: 0, qualityPeriodDays: 1095, status: "正常"},
    inRecords: [],
    outRecords: [],
    outputs: [],
    sales: [],
 },

  /* ---------- 半成品7（内料）DD24F0011N7 · 燕麦香（QRYL01231 真实下游；西西艾尔批次；真实 B5A102 生产入库 41000 克） ---------- */
  "DD24F0011N7|B5A102": {
    sku: { code: "DD24F0011N7", name: DD_N7, category: "半成品", spec: "内料 · 乳化/均质", unit: "克", validityDays: 180, purchaseFlag: false, salesFlag: false, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "B5A102", warehouse: "u8-30011 西西艾尔线边仓", unit: "克", productionDate: "2025-01-10", expiryDate: "2025-07-09", currentQty: 0, qualityPeriodDays: 730, status: "正常"},
    inRecords: [
      { stockInNo: "MRK250113282", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "生产入库", workType: "生产完工入库", docType: "生产入库单", date: "2025-01-10", qty: 41000, unit: "克", sourceOrder: "WD241217008", orderNo: "WD241217008", supplier: "-"},
      { stockInNo: "MRK250112173", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "调拨入库", workType: "调拨入库", docType: "调拨入库单", date: "2025-01-11", qty: 40320, unit: "克", sourceOrder: "DB2501120001", orderNo: "DB2501120001", supplier: "-"},
      { stockInNo: "MRK250116235", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "生产领退料入库", workType: "生产领退料入库", docType: "生产入库单", date: "2025-01-16", qty: 40320, unit: "克", sourceOrder: "LT2501160014", orderNo: "LT2501160014", supplier: "-"},
      { stockInNo: "MRK250120214", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "其他入库", workType: "其他入库", docType: "其他入库单", date: "2025-01-20", qty: 3666.208, unit: "克", sourceOrder: "-", orderNo: "-", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK250112154", provider: "-", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-01-12", qty: 40320, unit: "克", sourceOrder: "DB2501120001", orderNo: "DB2501120001", supplier: "-"},
      { stockOutNo: "MCK250116027", provider: "-", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2025-01-16", qty: 40320, unit: "克", sourceOrder: "LT2501160014", orderNo: "LT2501160014", supplier: "-"},
      { stockOutNo: "MCK250119277", provider: "-", businessType: "生产耗用", workType: "生产耗用", docType: "生产出库单", date: "2025-01-19", qty: 4166.208, unit: "克", sourceOrder: "WD250119002", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK250120213", provider: "-", businessType: "生产耗用", workType: "生产耗用", docType: "生产出库单", date: "2025-01-20", qty: 8855.968, unit: "克", sourceOrder: "WD250120003", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK250120088", provider: "-", businessType: "生产耗用", workType: "生产耗用", docType: "生产出库单", date: "2025-01-20", qty: 30964.032, unit: "克", sourceOrder: "WD250120004", orderNo: "-", supplier: "-"},
      { stockOutNo: "MCK250331442", provider: "-", businessType: "生产耗用", workType: "生产耗用", docType: "生产出库单", date: "2025-03-31", qty: 1339.426, unit: "克", sourceOrder: "WD250331001", orderNo: "-", supplier: "-"},
    ],
    outputs: [
      out("DD24F0011A", DD_A7, "成品裸支", "B5A1021/20280109", 12000, "个", "2025-01-19", "BOM-DD24F0011A", "0.75 克/个", "上海西西艾尔启东日用化学品有限公司", "WD241217007"),
    ],
    sales: [],
 },

  /* ---------- 成品 燕麦唇油（4ml）DD24F0011A ---------- */
  "DD24F0011A|B5A1021/20280109": {
    sku: { code: "DD24F0011A", name: DD_A7, category: "成品裸支", spec: "4ml · 单支唇油", unit: "个", validityDays: 1095, purchaseFlag: false, salesFlag: true, isWip: true, brand: "ddg", defaultProvider: "上海西西艾尔启东日用化学品有限公司"},
    batch: { batchNo: "B5A1021/20280109", warehouse: "OEM西西艾尔海州仓（其然）(待检)", unit: "个", productionDate: "2025-01-19", expiryDate: "2028-01-09", currentQty: 0, qualityPeriodDays: 1095, status: "正常"},
    inRecords: [
      { stockInNo: "MRK250119003", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "生产入库", workType: "生产完工入库", docType: "生产入库单", date: "2025-01-19", qty: 60, unit: "个", sourceOrder: "-", orderNo: "-", supplier: "-"},
      { stockInNo: "MRK250119241", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "生产入库", workType: "生产完工入库", docType: "生产入库单", date: "2025-01-19", qty: 45, unit: "个", sourceOrder: "-", orderNo: "-", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MRK250119014", provider: "-", businessType: "其他出库", workType: "其他出库", docType: "其他出库单", date: "2025-01-19", qty: 60, unit: "个", sourceOrder: "-", orderNo: "-", supplier: "-"},
      { stockOutNo: "MRK250119209", provider: "上海西西艾尔启东日用化学品有限公司", businessType: "厂内调拨", workType: "调拨出库", docType: "调拨出库单", date: "2025-01-19", qty: 5184, unit: "个", sourceOrder: "DB2501190033", orderNo: "DB2501190033", supplier: "-"},
    ],
    outputs: [],
    sales: [
      { orderNo: "6954883172575089761", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "湖南省 长沙市 开福区"},
      { orderNo: "6928384919978278185", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 汕头市 潮阳区"},
      { orderNo: "3315059043402021693", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-01", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "福建省 福州市 晋安区"},
      { orderNo: "6954883216520123930", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "安徽省 池州市 青阳县"},
      { orderNo: "6928387178442947943", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "重庆 重庆市 万州区"},
      { orderNo: "5126887406107065343", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 赣州市 章贡区"},
      { orderNo: "5126901806346028935", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 拱墅区"},
      { orderNo: "5126915810906001829", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-01", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "广东省 东莞市"},
      { orderNo: "260801-652853941793690", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "6928387881736830652", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "陕西省 宝鸡市 渭滨区"},
      { orderNo: "5126752659803127543", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "福建省 福州市 晋安区"},
      { orderNo: "3315550513440008169", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-01", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "江苏省 南京市 栖霞区"},
      { orderNo: "3315550513440008169", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-01", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "江苏省 南京市 栖霞区"},
      { orderNo: "6928390138764951123", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "陕西省 咸阳市 杨陵区"},
      { orderNo: "3315098319191014166", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 余杭区"},
      { orderNo: "6954909861092464563", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "重庆 重庆市 南岸区"},
      { orderNo: "3315572293520015095", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-01", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "上海 上海市 静安区"},
      { orderNo: "5126772639664001412", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河北省 张家口市 怀来县"},
      { orderNo: "3315593569454014776", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 海珠区"},
      { orderNo: "3315185762182137950", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河南省 郑州市 金水区"},
      { orderNo: "5126973086959026244", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-01", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "重庆 重庆市 江津区"},
      { orderNo: "3315786024503032080", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-01", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "上海 上海市 浦东新区"},
      { orderNo: "3315786240239048664", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-01", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "广东省 佛山市 顺德区"},
      { orderNo: "3315789552778032384", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "山西省 长治市 长子县"},
      { orderNo: "6928407843049143585", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "湖北省 武汉市 黄陂区"},
      { orderNo: "260801-497371072141001", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "260801-387302069782039", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "3315193143693015658", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 青浦区"},
      { orderNo: "3315223562836012065", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 湛江市 麻章区"},
      { orderNo: "5127335281064055938", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 长宁区"},
      { orderNo: "6954906500763948475", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "上海 上海市 宝山区"},
      { orderNo: "5126839275533010900", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-01", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "辽宁省 沈阳市 于洪区"},
      { orderNo: "3315199731884035489", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 惠州市 博罗县"},
      { orderNo: "5127336901493156010", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "重庆 重庆市 南岸区"},
      { orderNo: "5127338017571003602", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 通州区"},
      { orderNo: "6928403809268432008", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "山东省 青岛市 市北区"},
      { orderNo: "5126842515539027342", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-02", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "浙江省 宁波市 鄞州区"},
      { orderNo: "6954915660044178689", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "北京 北京市 朝阳区"},
      { orderNo: "5127014774711108929", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 金华市 义乌市"},
      { orderNo: "260802-633895667281695", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,燕麦香型", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "5126844423571086143", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 天河区"},
      { orderNo: "260802-164710336011358", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg燕麦荔枝唇油保湿滋润唇部精华去死皮淡唇纹秋冬换季补水唇膏", specName: "4mL 燕麦滋养唇油", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "260802-090408261180244", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,燕麦香型", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "3315660457498002964", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 惠州市 惠东县"},
      { orderNo: "6928417654711418621", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "福建省 福州市 台江区"},
      { orderNo: "6928413333871623697", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 广州市 白云区"},
      { orderNo: "6928421906532040607", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 洛阳市 洛龙区"},
      { orderNo: "6954928686241223865", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "辽宁省 沈阳市 沈河区"},
      { orderNo: "5127295248148145017", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-02", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "河南省 商丘市 睢阳区"},
      { orderNo: "3315663554000073255", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 徐汇区"},
      { orderNo: "6954916155253724436", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "湖北省 黄石市 大冶市"},
      { orderNo: "3315247862685198672", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 闵行区"},
      { orderNo: "5127040370308234934", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "云南省 怒江傈僳族自治州 泸水市"},
      { orderNo: "5127310728690017303", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "宁夏回族自治区 银川市 兴庆区"},
      { orderNo: "5127310728690008121", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 石景山区"},
      { orderNo: "5127374377266012134", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 成都市 成华区"},
      { orderNo: "3315271334783052182", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 南昌市 南昌县"},
      { orderNo: "6928418474914578011", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 佛山市 顺德区"},
      { orderNo: "5127324012123193712", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 浦东新区"},
      { orderNo: "5127376717410010733", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 嘉定区"},
      { orderNo: "260802-621858035243642", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "5127383125611006030", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "福建省 泉州市 晋江市"},
      { orderNo: "5127070286008087028", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 南通市 通州区"},
      { orderNo: "6928416483551050854", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "湖南省 长沙市 岳麓区"},
      { orderNo: "5127072986871031844", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-02", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "湖北省 武汉市 硚口区"},
      { orderNo: "3315274827524001855", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-02", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "重庆 重庆市 涪陵区"},
      { orderNo: "110208980044033926", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 白桃/燕麦/荔枝舒润唇油 唇部精华唇膏 舒缓淡纹滋润保湿去角质修护 以油养唇淡唇纹去死皮 4ml", specName: "燕麦唇油4ml@101220044405444994", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河北省 石家庄市 新乐市"},
      { orderNo: "3315279471631107188", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "吉林省 长春市 南关区"},
      { orderNo: "3315281631613009478", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 白云区"},
      { orderNo: "3315765397022036885", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "山东省 青岛市 李沧区"},
      { orderNo: "6928433817359187395", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "湖南省 长沙市 长沙县"},
      { orderNo: "3315764857121078880", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 龙岗区"},
      { orderNo: "3315304995379031565", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-02", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 舟山市 普陀区"},
      { orderNo: "260802-682664957483070", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "260803-209641879853057", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "3315344306613008280", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "吉林省 吉林市 船营区"},
      { orderNo: "6928427585197407743", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河北省 石家庄市 藁城区"},
      { orderNo: "3315778897927008984", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 番禺区"},
      { orderNo: "3315934740464128370", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 龙岗区"},
      { orderNo: "260803-279393082961695", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "3315338366698168470", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "安徽省 合肥市 蜀山区"},
      { orderNo: "260803-110488460881695", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "5127380028906104346", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-03", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "湖北省 武汉市 洪山区"},
      { orderNo: "260803-258201434452994", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,燕麦香型", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "6954937142142113476", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "天津 天津市 滨海新区"},
      { orderNo: "5127445477621029531", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "云南省 昆明市 西山区"},
      { orderNo: "5127393636886008117", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 浦东新区"},
      { orderNo: "6928434614264429629", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "上海 上海市 普陀区"},
      { orderNo: "3315369110777008989", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "山西省 吕梁市 柳林县"},
      { orderNo: "6954926048862213395", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 深圳市 龙华区"},
      { orderNo: "5127397200207004036", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 宝安区"},
      { orderNo: "P801284750889092193", channel: "平台56", shopName: "818", goodsName: "ddg 燕麦荔枝唇油保湿滋润唇部精华淡化唇纹润唇膏 燕麦唇油4ml", specName: "燕麦唇油4ml", date: "2026-08-03", qty: 1, unit: "个", price: 79.0, amount: 79, customer: "黑龙江省 绥化市 北林区"},
      { orderNo: "3315993780353033497", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "陕西省 西安市 长安区"},
      { orderNo: "260803-652067499610088", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg燕麦荔枝唇油保湿滋润唇部精华去死皮淡唇纹秋冬换季补水唇膏", specName: "4mL 燕麦滋养唇油", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "5127439032883042300", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-03", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "浙江省 宁波市 海曙区"},
      { orderNo: "5127184262982001912", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 清远市 清城区"},
      { orderNo: "6928435347464486339", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "湖南省 长沙市 长沙县"},
      { orderNo: "3315876889651001496", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-03", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "湖北省 武汉市 东西湖区"},
      { orderNo: "6928430941628824815", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 东莞市 东莞市"},
      { orderNo: "5127532309423162909", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河北省 邢台市 宁晋县"},
      { orderNo: "5127036051651023248", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 天河区"},
      { orderNo: "5127479964750146848", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-03", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "广西壮族自治区 贺州市 富川瑶族自治县"},
      { orderNo: "3315898345399186091", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖南省 邵阳市 邵东市"},
      { orderNo: "5127212882944023303", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "山东省 青岛市 李沧区"},
      { orderNo: "5127038859238073602", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 盐城市 大丰区"},
      { orderNo: "6954971103073277136", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "云南省 楚雄彝族自治州 楚雄市"},
      { orderNo: "5127039759044001948", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 2, unit: "个", price: 118.0, amount: 236, customer: "上海 上海市 青浦区"},
      { orderNo: "6928448971467030401", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "四川省 成都市 双流区"},
      { orderNo: "P801321640961102991", channel: "平台56", shopName: "818", goodsName: "ddg 燕麦荔枝唇油保湿滋润唇部精华淡化唇纹润唇膏 燕麦唇油4ml", specName: "燕麦唇油4ml", date: "2026-08-03", qty: 1, unit: "个", price: 79.0, amount: 79, customer: "山东省 潍坊市 诸城市"},
      { orderNo: "3315477758677080274", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "宁夏回族自治区 石嘴山市 惠农区"},
      { orderNo: "5127217418708007915", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 南山区"},
      { orderNo: "5127543613149003020", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-03", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河南省 焦作市 解放区"},
      { orderNo: "5127540985012287635", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 光明区"},
      { orderNo: "5127540373893055326", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 江门市 蓬江区"},
      { orderNo: "3316079208491032452", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 罗湖区"},
      { orderNo: "3315912097207037963", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 龙岗区"},
      { orderNo: "3316087344930005274", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖南省 长沙市 岳麓区"},
      { orderNo: "3315916165885035088", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-04", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "安徽省 合肥市 包河区"},
      { orderNo: "FX20260804000002", channel: "自有", shopName: "自有门店", goodsName: "ddg 舒润护唇精华油（燕麦香）4ml 燕麦唇油", specName: " ", date: "2026-08-04", qty: 30, unit: "个", price: 30.25, amount: 908, customer: "山东省 青岛市 城阳区"},
      { orderNo: "6954978225654666621", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-04", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 广州市 黄埔区"},
      { orderNo: "4041906193327168214", channel: "平台45", shopName: "DP945", goodsName: "程十安 ddg荔枝燕麦唇油润唇膏修护保湿滋润防干裂淡纹唇部精华燕麦香/荔枝香 4ml/支", specName: "规格+燕麦香4ml*1支", date: "2026-08-04", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "重庆 重庆市 渝中区"},
      { orderNo: "5127240746121012542", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 静安区"},
      { orderNo: "3316154592100077657", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 2, unit: "个", price: 118.0, amount: 236, customer: "江苏省 常州市 新北区"},
      { orderNo: "3315563222036011093", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河南省 周口市 太康县"},
      { orderNo: "6954967557992289281", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-04", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 周口市 太康县"},
      { orderNo: "5127602689221002331", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-04", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "山西省 太原市 万柏林区"},
      { orderNo: "4080010360049054217", channel: "平台45", shopName: "DP926", goodsName: "程十安 ddg荔枝燕麦唇油润唇膏修护保湿滋润防干裂淡纹唇部精华燕麦香/荔枝香 4ml/支", specName: "规格+燕麦香4ml*1支", date: "2026-08-04", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "湖北省 武汉市 江夏区"},
      { orderNo: "3316209168987050798", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河北省 保定市 定州市"},
      { orderNo: "5127621373098093023", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 温州市 乐清市"},
      { orderNo: "3315615170565229793", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河北省 承德市 双桥区"},
      { orderNo: "5127122415489048646", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "福建省 泉州市 晋江市"},
      { orderNo: "5127299210271004834", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 台州市 玉环市"},
      { orderNo: "5127298634693001234", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河北省 廊坊市 香河县"},
      { orderNo: "3315611606975306192", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 青浦区"},
      { orderNo: "5127122019437417241", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 成都市 成华区"},
      { orderNo: "3316222344378093784", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "福建省 泉州市 惠安县"},
      { orderNo: "3315601779092034376", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-04", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "山东省 青岛市 李沧区"},
      { orderNo: "6954983252893898266", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-04", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 东莞市 东莞市"},
      { orderNo: "3316056961014031290", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-04", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "上海 上海市 黄浦区"},
      { orderNo: "5127125655002079340", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 宿迁市 宿豫区"},
      { orderNo: "5127300470923023346", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 苏州市 吴中区"},
      { orderNo: "5127301334438046303", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 无锡市 滨湖区"},
      { orderNo: "5127627781069446446", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 绍兴市 越城区"},
      { orderNo: "3315603003417004974", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "安徽省 合肥市 包河区"},
      { orderNo: "6954992310019364077", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-04", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "浙江省 宁波市 鄞州区"},
      { orderNo: "5127626413846179138", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 萧山区"},
      { orderNo: "3316224828459028982", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-04", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "江西省 抚州市 崇仁县"},
      { orderNo: "5127627241414255100", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 抚州市 临川区"},
      { orderNo: "3316224684562002875", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-04", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "北京 北京市 通州区"},
      { orderNo: "5127125079770117800", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 嘉兴市 桐乡市"},
      { orderNo: "5127301982340018235", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-04", qty: 2, unit: "个", price: 118.0, amount: 236, customer: "上海 上海市 宝山区"},
      { orderNo: "3316224072765030860", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河南省 郑州市 管城回族区"},
      { orderNo: "5127628393008048449", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "甘肃省 甘南藏族自治州 合作市"},
      { orderNo: "5127125763293003231", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 九江市 瑞昌市"},
      { orderNo: "5127627493475033836", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "山东省 济南市 槐荫区"},
      { orderNo: "5127628033176318204", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 金华市 婺城区"},
      { orderNo: "3315603939137017599", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 阳江市 阳春市"},
      { orderNo: "5127126375072007101", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "云南省 昆明市 官渡区"},
      { orderNo: "3316057465230009260", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 5, unit: "个", price: 118.0, amount: 590, customer: "安徽省 阜阳市 颍州区"},
      { orderNo: "3316057825074011271", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 南昌市 青山湖区"},
      { orderNo: "3316223964899085688", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 宁波市 奉化区"},
      { orderNo: "5127627817345056925", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 宝安区"},
      { orderNo: "3316225296431015588", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 宿迁市 沭阳县"},
      { orderNo: "3316057897122050968", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 杨浦区"},
      { orderNo: "3316223820886399890", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 拱墅区"},
      { orderNo: "5127303350652089201", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-05", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "河南省 郑州市 二七区"},
      { orderNo: "6928488431152758299", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-05", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 深圳市 光明区"},
      { orderNo: "5127639877540095221", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 朝阳区"},
      { orderNo: "6954986164472649176", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-05", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 安阳市 龙安区"},
      { orderNo: "6928471229604724169", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-05", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 安阳市 龙安区"},
      { orderNo: "5127315482268044827", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 宁波市 鄞州区"},
      { orderNo: "6954979870518875608", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-05", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 安阳市 龙安区"},
      { orderNo: "6954999896204449219", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-05", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "北京 北京市 房山区"},
      { orderNo: "5127662341888076935", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 汕头市 龙湖区"},
      { orderNo: "3316134397543129867", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-05", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "四川省 成都市 新都区"},
      { orderNo: "3316139545952023864", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-05", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "河南省 濮阳市 华龙区"},
      { orderNo: "3316317276219081379", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 温州市 瓯海区"},
      { orderNo: "5127620364769015230", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "陕西省 西安市 未央区"},
      { orderNo: "5127176775203008048", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "云南省 德宏傣族景颇族自治州 瑞丽市"},
      { orderNo: "FX20260805000054", channel: "自有", shopName: "自有门店", goodsName: "ddg 舒润护唇精华油（燕麦香）4ml 燕麦唇油", specName: " ", date: "2026-08-05", qty: 10, unit: "个", price: 30.25, amount: 302, customer: "江苏省 淮安市 清江浦区"},
      { orderNo: "5127620796894136208", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 苏州市 相城区"},
      { orderNo: "3316157437261019694", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河南省 郑州市 新郑市"},
      { orderNo: "110209162931584748", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 白桃/燕麦/荔枝舒润唇油 唇部精华唇膏 舒缓淡纹滋润保湿去角质修护 以油养唇淡唇纹去死皮 4ml", specName: "燕麦唇油4ml@101220044452641406", date: "2026-08-05", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "江西省 赣州市 兴国县"},
      { orderNo: "3316330380169128453", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 东莞市"},
      { orderNo: "3316173493798009355", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 静安区"},
      { orderNo: "3315724359475030594", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 苏州市 昆山市"},
      { orderNo: "5127180015001015738", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-05", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "湖南省 永州市 东安县"},
      { orderNo: "3316354788585050893", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 中山市"},
      { orderNo: "3315733899558125195", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-05", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "宁夏回族自治区 吴忠市 红寺堡区"},
      { orderNo: "5127622056512031413", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "安徽省 马鞍山市 博望区"},
      { orderNo: "6928497515656019742", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-05", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "海南省 海口市 美兰区"},
      { orderNo: "260805-668519657041454", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-05", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "5127180015023154742", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河北省 石家庄市 长安区"},
      { orderNo: "260805-518311186850044", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-05", qty: 3, unit: "个", price: 49.0, amount: 147, customer: "-"},
      { orderNo: "5127178431034009425", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "吉林省 延边朝鲜族自治州 安图县"},
      { orderNo: "3315755930303007398", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 南沙区"},
      { orderNo: "5127356954028230746", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-05", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 徐州市 泉山区"},
      { orderNo: "3315755246769114072", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 台州市 临海市"},
      { orderNo: "6954984981530612988", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 安阳市 龙安区"},
      { orderNo: "3316360476895355173", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 普陀区"},
      { orderNo: "6954991703014971082", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 漯河市 舞阳县"},
      { orderNo: "6954996015043975011", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "甘肃省 酒泉市 敦煌市"},
      { orderNo: "6928490142287494415", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "辽宁省 盘锦市 兴隆台区"},
      { orderNo: "3315737211943030950", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-06", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "广东省 佛山市 顺德区"},
      { orderNo: "5127679009048027642", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-06", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "上海 上海市 宝山区"},
      { orderNo: "6954989388191438327", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "江苏省 苏州市 苏州工业园区"},
      { orderNo: "5127679873052001809", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 汕头市 澄海区"},
      { orderNo: "6955003754669151628", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河北省 邢台市 襄都区"},
      { orderNo: "6955001602542671746", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "辽宁省 沈阳市 于洪区"},
      { orderNo: "5127357350067014340", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 福田区"},
      { orderNo: "3315780950580003281", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 上饶市 弋阳县"},
      { orderNo: "3316215109757007097", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "山西省 太原市 杏花岭区"},
      { orderNo: "5127680377069036445", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 河源市 源城区"},
      { orderNo: "6928514133062352202", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "辽宁省 大连市 长海县"},
      { orderNo: "5127623532079150010", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-06", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "辽宁省 沈阳市 浑南区"},
      { orderNo: "3315837074552129852", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "内蒙古自治区 鄂尔多斯市 康巴什区"},
      { orderNo: "3316447056317136582", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 静安区"},
      { orderNo: "3315848558132073097", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 南昌市 新建区"},
      { orderNo: "3315849098148001571", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 萧山区"},
      { orderNo: "3315849026162017695", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 宁波市 鄞州区"},
      { orderNo: "6928503484400958787", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 广州市 南沙区"},
      { orderNo: "260806-396450906400526", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,燕麦香型", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "3315891542493003496", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 苏州市 姑苏区"},
      { orderNo: "5127177675217416623", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 成都市 武侯区"},
      { orderNo: "3316324981936056064", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 汕头市 澄海区"},
      { orderNo: "5127624108155092049", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 朝阳区"},
      { orderNo: "5127678937151045017", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 海淀区"},
      { orderNo: "3316346185146000060", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 连云港市 东海县"},
      { orderNo: "3315913178725039671", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-06", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖北省 武汉市 洪山区"},
      { orderNo: "260806-031336743261643", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "6955028711871420217", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 佛山市 南海区"},
      { orderNo: "3316346653793034361", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-06", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "广西壮族自治区 桂林市 资源县"},
      { orderNo: "6955030965443696545", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "江西省 吉安市 井冈山市"},
      { orderNo: "5127622956244005634", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 抚州市 临川区"},
      { orderNo: "5127623028223043637", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河北省 秦皇岛市 海港区"},
      { orderNo: "3316522116344080186", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 赣州市 章贡区"},
      { orderNo: "5127179583166159546", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 白云区"},
      { orderNo: "3315897051886177964", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 南京市 江宁区"},
      { orderNo: "5127677533683064944", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "安徽省 安庆市 岳西县"},
      { orderNo: "5127681565001121600", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 衢州市 开化县"},
      { orderNo: "5127680377206018436", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 朝阳区"},
      { orderNo: "3315902595258130274", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 成都市 大邑县"},
      { orderNo: "FX20260807000067", channel: "自有", shopName: "自有门店", goodsName: "ddg 舒润护唇精华油（燕麦香）4ml 燕麦唇油", specName: " ", date: "2026-08-07", qty: 576, unit: "个", price: 19.73, amount: 11364, customer: "浙江省 嘉兴市 平湖市"},
      { orderNo: "FX20260807000068", channel: "自有", shopName: "自有门店", goodsName: "ddg 舒润护唇精华油（燕麦香）4ml 燕麦唇油", specName: " ", date: "2026-08-07", qty: 720, unit: "个", price: 19.73, amount: 14206, customer: "天津 天津市 武清区"},
      { orderNo: "FX20260807000069", channel: "自有", shopName: "自有门店", goodsName: "ddg 舒润护唇精华油（燕麦香）4ml 燕麦唇油", specName: " ", date: "2026-08-07", qty: 576, unit: "个", price: 19.73, amount: 11364, customer: "四川省 成都市 龙泉驿区"},
      { orderNo: "FX20260807000071", channel: "自有", shopName: "自有门店", goodsName: "ddg 舒润护唇精华油（燕麦香）4ml 燕麦唇油", specName: " ", date: "2026-08-07", qty: 576, unit: "个", price: 19.73, amount: 11364, customer: "湖北省 武汉市 江夏区"},
      { orderNo: "3316353709559132172", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-07", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "广东省 深圳市 福田区"},
      { orderNo: "FX20260807000074", channel: "自有", shopName: "自有门店", goodsName: "ddg 舒润护唇精华油（燕麦香）4ml 燕麦唇油", specName: " ", date: "2026-08-07", qty: 7, unit: "个", price: 10.0, amount: 70, customer: "江西省 南昌市 西湖区"},
      { orderNo: "3316553544569178477", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 苏州市 吴中区"},
      { orderNo: "6955034074207949965", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-07", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 东莞市 东莞市"},
      { orderNo: "5127181023041000711", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "山东省 济南市 槐荫区"},
      { orderNo: "5127625908030109026", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 宝山区"},
      { orderNo: "6955034151917196927", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-07", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 广州市 花都区"},
      { orderNo: "5127360122016154030", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "吉林省 长春市 南关区"},
      { orderNo: "6955022791255201113", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-07", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "上海 上海市 徐汇区"},
      { orderNo: "5127181527039231323", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-07", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "云南省 昆明市 官渡区"},
      { orderNo: "3316571148392042893", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-07", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "浙江省 宁波市 鄞州区"},
      { orderNo: "5127681421045186102", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 苏州市 吴江区"},
      { orderNo: "3316578384345003194", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 上城区"},
      { orderNo: "3316400761504118793", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 绵阳市 涪城区"},
      { orderNo: "260807-468587671142393", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-07", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "3316597032303077470", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河南省 商丘市 睢阳区"},
      { orderNo: "5127181635033131411", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-07", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "上海 上海市 闵行区"},
      { orderNo: "260807-280557002333553", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-07", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "5127683041015019939", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 普陀区"},
      { orderNo: "5127627672041089400", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 潮州市 饶平县"},
      { orderNo: "6955042591924819367", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-07", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "黑龙江省 哈尔滨市 南岗区"},
      { orderNo: "3316011134756015758", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-07", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "浙江省 杭州市 拱墅区"},
      { orderNo: "3316016210319095793", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "重庆 重庆市 渝北区"},
      { orderNo: "3316014950937086780", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "福建省 厦门市 湖里区"},
      { orderNo: "3316629972396021554", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 朝阳区"},
      { orderNo: "5127182679080093915", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-07", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河北省 石家庄市 鹿泉区"},
      { orderNo: "5127626196068075900", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-08", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "福建省 福州市 鼓楼区"},
      { orderNo: "5127683005063007412", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 罗湖区"},
      { orderNo: "3316023230305000399", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-08", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "浙江省 杭州市 上城区"},
      { orderNo: "5127181419083097319", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-08", qty: 4, unit: "个", price: 57.7, amount: 231, customer: "北京 北京市 怀柔区"},
      { orderNo: "3316632672552007682", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-08", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "广东省 广州市 荔湾区"},
      { orderNo: "5127681853105074115", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "黑龙江省 哈尔滨市 松北区"},
      { orderNo: "260808-123396431371987", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "5127181635083031141", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "北京 北京市 朝阳区"},
      { orderNo: "5127182607088063112", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖北省 武汉市 洪山区"},
      { orderNo: "5127625656129085311", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 嘉兴市 海宁市"},
      { orderNo: "6955065729297684201", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "福建省 三明市 三元区"},
      { orderNo: "5127181131117022139", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "甘肃省 兰州市 西固区"},
      { orderNo: "6955068196686402635", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "四川省 成都市 大邑县"},
      { orderNo: "3316462357151086872", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖北省 荆州市 监利市"},
      { orderNo: "3316459117827123863", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 绍兴市 越城区"},
      { orderNo: "6928551957088534395", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "山东省 临沂市 沂南县"},
      { orderNo: "260808-303971766623123", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,燕麦香型", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "6955061312510433082", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 深圳市 福田区"},
      { orderNo: "5127682285129011001", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 赣州市 宁都县"},
      { orderNo: "5127183147121185340", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 潮州市 潮安区"},
      { orderNo: "6928539551864683784", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 周口市 太康县"},
      { orderNo: "3316467109268010086", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-08", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "天津 天津市 东丽区"},
      { orderNo: "5127183075128042815", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 天河区"},
      { orderNo: "6955059120814692185", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "安徽省 蚌埠市 蚌山区"},
      { orderNo: "6955045712255457109", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "上海 上海市 普陀区"},
      { orderNo: "5127627600131112015", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 静安区"},
      { orderNo: "3316035506146113891", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-08", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "广西壮族自治区 南宁市 良庆区"},
      { orderNo: "260808-236516872563212", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "6928557043786546879", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "四川省 雅安市 荥经县"},
      { orderNo: "260808-124633761293575", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "5127682321125111409", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 花都区"},
      { orderNo: "6955054704603829841", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "上海 上海市 崇明区"},
      { orderNo: "3316493749907136588", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 眉山市 东坡区"},
      { orderNo: "6955068635857032364", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "四川省 成都市 金牛区"},
      { orderNo: "6955075407346865267", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "贵州省 贵阳市 观山湖区"},
      { orderNo: "5127683797141370107", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "福建省 漳州市 东山县"},
      { orderNo: "5127627420141203616", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "重庆 重庆市 沙坪坝区"},
      { orderNo: "3316086446197005866", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 扬州市 宝应县"},
      { orderNo: "3316506529343089662", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "黑龙江省 哈尔滨市 南岗区"},
      { orderNo: "3316703700519040681", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 成都市 双流区"},
      { orderNo: "5127183003187003313", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 茂名市 高州市"},
      { orderNo: "5127359762153075900", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-08", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "北京 北京市 顺义区"},
      { orderNo: "6955057237878445992", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 深圳市 福田区"},
      { orderNo: "6928563768283987681", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "湖北省 武汉市 蔡甸区"},
      { orderNo: "3316707876533106987", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 南京市 江宁区"},
      { orderNo: "5127626484179011320", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 温州市 苍南县"},
      { orderNo: "5127359258186081116", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-08", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "陕西省 咸阳市 渭城区"},
      { orderNo: "5127183219175034749", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-08", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "河南省 平顶山市 卫东区"},
      { orderNo: "5127183687166009425", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-08", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "陕西省 西安市 雁塔区"},
      { orderNo: "6955069101882480143", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-08", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "黑龙江省 牡丹江市 东安区"},
      { orderNo: "3316097390591219996", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "安徽省 宿州市 埇桥区"},
      { orderNo: "5127359762162111337", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 浦东新区"},
      { orderNo: "6928546923911151474", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "山东省 济宁市 梁山县"},
      { orderNo: "5127682069203019110", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-09", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "广东省 广州市 南沙区"},
      { orderNo: "5127627312187004625", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-09", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "河南省 南阳市 唐河县"},
      { orderNo: "6928555789028785833", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "福建省 龙岩市 长汀县"},
      { orderNo: "6955069552236172321", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "浙江省 嘉兴市 南湖区"},
      { orderNo: "5127682177211068607", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "贵州省 遵义市 汇川区"},
      { orderNo: "3316715544374026290", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖南省 岳阳市 岳阳楼区"},
      { orderNo: "6955078417111782525", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "重庆 重庆市 沙坪坝区"},
      { orderNo: "260809-096846487172927", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "【新香上市】ddg白桃淡纹唇油保湿滋润精华去死皮淡化唇纹燕麦", specName: "4mL 唇油,燕麦香型", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "3316550701124077083", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-09", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "重庆 重庆市 南岸区"},
      { orderNo: "5127181239283306343", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江苏省 苏州市 吴江区"},
      { orderNo: "5127682717242066209", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 2, unit: "个", price: 118.0, amount: 236, customer: "河南省 开封市 龙亭区"},
      { orderNo: "6955089134662391126", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "陕西省 西安市 碑林区"},
      { orderNo: "5127683041255044114", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 阳江市 阳东区"},
      { orderNo: "6955070054200120527", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "海南省 海口市 美兰区"},
      { orderNo: "3316563337889011185", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河南省 漯河市 源汇区"},
      { orderNo: "5127359474264067620", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 宝安区"},
      { orderNo: "3316129250579068075", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 闵行区"},
      { orderNo: "6955078906366137752", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "重庆 重庆市 渝北区"},
      { orderNo: "3316137315989196752", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 绍兴市 上虞区"},
      { orderNo: "3316765584418168084", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 茂名市 信宜市"},
      { orderNo: "3316152326908131672", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 深圳市 福田区"},
      { orderNo: "5127683401274083530", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 番禺区"},
      { orderNo: "5127627816128012905", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 宁波市 奉化区"},
      { orderNo: "5127181023318123729", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 台州市 天台县"},
      { orderNo: "3316784556324001756", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-09", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "江苏省 苏州市 常熟市"},
      { orderNo: "6928573840604495275", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "河南省 三门峡市 灵宝市"},
      { orderNo: "3316784520475047395", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 余杭区"},
      { orderNo: "260809-007696586351467", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "5127625656326084632", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-09", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "陕西省 西安市 长安区"},
      { orderNo: "5127626844295057819", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 丽水市 莲都区"},
      { orderNo: "3316786860201202588", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 虹口区"},
      { orderNo: "6928573944992726512", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-09", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 东莞市 东莞市"},
      { orderNo: "5127359006320046224", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河北省 秦皇岛市 海港区"},
      { orderNo: "5127682249298076646", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 闵行区"},
      { orderNo: "3316786896737040559", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 杭州市 西湖区"},
      { orderNo: "3316615825148046257", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河南省 洛阳市 西工区"},
      { orderNo: "3316180730769033692", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-09", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "山东省 菏泽市 定陶区"},
      { orderNo: "3316790460366001282", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖南省 长沙市 岳麓区"},
      { orderNo: "5127360014301033635", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 荔湾区"},
      { orderNo: "5127625620373024747", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 3, unit: "个", price: 118.0, amount: 354, customer: "云南省 昆明市 官渡区"},
      { orderNo: "3316616365270080391", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "福建省 宁德市 蕉城区"},
      { orderNo: "6955096631439136303", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "江苏省 苏州市 苏州工业园区"},
      { orderNo: "3316791684281161284", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-10", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "广东省 深圳市 南山区"},
      { orderNo: "5127682393298078942", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "广东省 广州市 番禺区"},
      { orderNo: "3316792080507118271", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-10", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "上海 上海市 长宁区"},
      { orderNo: "3316166259604004879", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "安徽省 马鞍山市 当涂县"},
      { orderNo: "6955094394191484647", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【新香上市ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "内蒙古自治区 通辽市 科尔沁区"},
      { orderNo: "3316618741132044376", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 2, unit: "个", price: 118.0, amount: 236, customer: "广东省 佛山市 禅城区"},
      { orderNo: "5127627744308306347", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【新香上市】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河南省 南阳市 镇平县"},
      { orderNo: "5127360302297032319", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 浦东新区"},
      { orderNo: "5127359510361020427", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-10", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "山西省 朔州市 朔城区"},
      { orderNo: "3316177491195061167", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "河北省 唐山市 玉田县"},
      { orderNo: "3316176483874006656", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "安徽省 六安市 金寨县"},
      { orderNo: "3316628281405016389", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "安徽省 宿州市 萧县"},
      { orderNo: "110209458084939028", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 白桃/燕麦/荔枝舒润唇油 唇部精华唇膏 舒缓淡纹滋润保湿去角质修护 以油养唇淡唇纹去死皮 4ml", specName: "燕麦唇油4ml@101220044517066429", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "江苏省 苏州市 张家港市"},
      { orderNo: "3316182891582105367", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "上海 上海市 杨浦区"},
      { orderNo: "6955120049180251748", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【徐振轩同款ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 汕头市 龙湖区"},
      { orderNo: "6955097136468857898", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【徐振轩同款ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "安徽省 合肥市 蜀山区"},
      { orderNo: "3316810728506082088", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "湖南省 衡阳市 衡南县"},
      { orderNo: "3316184727481344366", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "安徽省 宿州市 萧县"},
      { orderNo: "302250131970564427", channel: "程十安", shopName: "程十安", goodsName: "程十安 ddg荔枝燕麦唇油润唇膏修护保湿滋润防干裂淡纹唇部精华燕麦香/荔枝香 4ml/支", specName: "", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "天津 天津市 河北区"},
      { orderNo: "3316642069634058068", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "山东省 青岛市 黄岛区"},
      { orderNo: "3316195599067106763", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "程十安ddg荔枝唇油润唇膏保湿滋润补水防干裂去死皮淡纹唇部精华", specName: "4ml[【燕麦唇油】敏感唇部适用]", date: "2026-08-10", qty: 1, unit: "个", price: 57.7, amount: 58, customer: "陕西省 西安市 莲湖区"},
      { orderNo: "5127682681382190727", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "江西省 抚州市 临川区"},
      { orderNo: "MI636590646173503488", channel: "自有", shopName: "自有门店", goodsName: "ddg 舒润护唇精华油（燕麦香）4ml 燕麦唇油", specName: " ", date: "2026-08-10", qty: 2, unit: "个", price: 0.0, amount: 0, customer: "浙江省 杭州市 西湖区"},
      { orderNo: "5127184299014035544", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 内江市 隆昌市"},
      { orderNo: "3316841724636172367", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 内江市 隆昌市"},
      { orderNo: "5127682969390035544", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 内江市 隆昌市"},
      { orderNo: "260810-059737392781237", channel: "拼多多", shopName: "ddg官方旗舰店（拼多多）", goodsName: "ddg511燕麦特护唇膏油滋润保湿补水淡化唇纹秋冬润唇膏油学生男女", specName: "【滋润】燕麦唇油4ml", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "-"},
      { orderNo: "5127359726381026033", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "浙江省 台州市 黄岩区"},
      { orderNo: "6955088315188057153", channel: "抖音", shopName: "ddg官方旗舰店（抖音）", goodsName: "【徐振轩同款ddg白桃润唇油唇膏】燕麦荔枝唇油舒润特护滋养防干裂", specName: "燕麦滋养唇油4ml*1支", date: "2026-08-10", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "四川省 成都市 温江区"},
      { orderNo: "5127183507389117535", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【徐振轩同款】ddg白桃燕麦荔枝唇油保湿滋润去死皮淡化唇纹精华", specName: "4ml[燕麦滋养唇油]", date: "2026-08-10", qty: 1, unit: "个", price: 118.0, amount: 118, customer: "四川省 成都市 金牛区"},
    ],
 },

  /* ---------- 半成品 荔枝唇油（内料）DD25F0131N · J5F091（真实：652401 → ZZ250609029 → 2025-06-09，瑾亭） ---------- */
  "DD25F0131N|J5F091": {
    sku: { code: "DD25F0131N", name: DD_N_LZ, category: "半成品", spec: "内料 · 乳化/均质", unit: "克", validityDays: 180, purchaseFlag: false, salesFlag: false, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "J5F091", warehouse: "OEM瑾亭航谊仓（其然）(待检)", unit: "克", productionDate: "2025-06-09", expiryDate: "2025-12-06", currentQty: 0, qualityPeriodDays: 730, status: "正常"},
    inRecords: [
      { stockInNo: "MRK25060900566", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "组装入库", docType: "生产入库单", date: "2025-06-09", qty: 35500, unit: "克", sourceOrder: "ZZ250609029", orderNo: "ZZ250609029", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK25061200337", provider: "上海瑾亭化妆品有限公司", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2025-06-12", qty: 35500, unit: "克", sourceOrder: "LT2506120132", orderNo: "LT2506120132", supplier: "-"},
    ],
    outputs: [
      out("DD25F0011A", DD_A_LZ, "成品裸支", "J5F1211/20280611", 1980, "个", "2025-06-13", "BOM-DD25F0011A", "0.75 克/个", "上海瑾亭化妆品有限公司", "MRK25061300321"),
    ],
    sales: [],
 },

  /* ---------- 成品 荔枝卸妆膏（110ml）DD25F0011A · J5F1211/20280611 ---------- */
  "DD25F0011A|J5F1211/20280611": {
    sku: { code: "DD25F0011A", name: DD_A_LZ, category: "成品裸支", spec: "110ml · 卸妆膏", unit: "个", validityDays: 1095, purchaseFlag: false, salesFlag: true, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "J5F1211/20280611", warehouse: "OEM瑾亭航谊仓（其然）(待检)", unit: "个", productionDate: "2025-06-13", expiryDate: "2028-06-11", currentQty: 0, qualityPeriodDays: 1095, status: "正常"},
    inRecords: [
      { stockInNo: "MRK25061300321", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "生产完工入库", docType: "生产入库单", date: "2025-06-13", qty: 1980, unit: "个", sourceOrder: "-", orderNo: "-", supplier: "-"},
      { stockInNo: "MRK25061300327", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "生产完工入库", docType: "生产入库单", date: "2025-06-13", qty: 1980, unit: "个", sourceOrder: "-", orderNo: "-", supplier: "-"},
      { stockInNo: "MRK25061300332", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "生产完工入库", docType: "生产入库单", date: "2025-06-13", qty: 1980, unit: "个", sourceOrder: "-", orderNo: "-", supplier: "-"},
      { stockInNo: "MRK25061300336", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "生产完工入库", docType: "生产入库单", date: "2025-06-13", qty: 1980, unit: "个", sourceOrder: "-", orderNo: "-", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK25061300575", provider: "上海瑾亭化妆品有限公司", businessType: "厂内调拨", workType: "调拨出库", docType: "调拨出库单", date: "2025-06-13", qty: 1980, unit: "个", sourceOrder: "DB2506130237", orderNo: "DB2506130237", supplier: "-"},
      { stockOutNo: "MCK25061300573", provider: "上海瑾亭化妆品有限公司", businessType: "厂内调拨", workType: "调拨出库", docType: "调拨出库单", date: "2025-06-13", qty: 1980, unit: "个", sourceOrder: "DB2506130236", orderNo: "DB2506130236", supplier: "-"},
      { stockOutNo: "MCK25061300590", provider: "上海瑾亭化妆品有限公司", businessType: "厂内调拨", workType: "调拨出库", docType: "调拨出库单", date: "2025-06-13", qty: 1980, unit: "个", sourceOrder: "DB2506130252", orderNo: "DB2506130252", supplier: "-"},
      { stockOutNo: "MCK25061300570", provider: "上海瑾亭化妆品有限公司", businessType: "厂内调拨", workType: "调拨出库", docType: "调拨出库单", date: "2025-06-13", qty: 1159, unit: "个", sourceOrder: "DB2506130235", orderNo: "DB2506130235", supplier: "-"},
      { stockOutNo: "MCK25061300588", provider: "上海瑾亭化妆品有限公司", businessType: "厂内调拨", workType: "调拨出库", docType: "调拨出库单", date: "2025-06-13", qty: 1980, unit: "个", sourceOrder: "DB2506130250", orderNo: "DB2506130250", supplier: "-"},
    ],
    outputs: [],
    sales: [
      { orderNo: "110208866352970013", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044392245929", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "云南省 昆明市 官渡区"},
      { orderNo: "110208874951811074", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044393709819", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江苏省 徐州市 贾汪区"},
      { orderNo: "110208880120841934", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044395417367", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "辽宁省 大连市 庄河市"},
      { orderNo: "110208885759008962", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044396529614", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "四川省 广安市 前锋区"},
      { orderNo: "110208885164504730", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044397055692", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "辽宁省 沈阳市 大东区"},
      { orderNo: "110208886138019539", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044397249067", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "河南省 漯河市 郾城区"},
      { orderNo: "110208890864668068", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044397507562", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "河南省 安阳市 滑县"},
      { orderNo: "110208894976725743", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044398888275", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "浙江省 杭州市 上城区"},
      { orderNo: "110208891146456210", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044398888275", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "广东省 韶关市 武江区"},
      { orderNo: "110208892358299316", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044398888275", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "甘肃省 兰州市 西固区"},
      { orderNo: "110208892482107701", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044399246329", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "福建省 福州市 福清市"},
      { orderNo: "110208897249650542", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044399246329", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江西省 赣州市 上犹县"},
      { orderNo: "3834475014099628180", channel: "平台112", shopName: "DP901", goodsName: "ddg 净润卸妆膏110ml 卸妆膏", specName: "荔枝款110ml正装", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "海南省 海口市 龙华区"},
      { orderNo: "110208899442766023", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044400240875", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江苏省 苏州市 苏州工业园区"},
      { orderNo: "3834487879674054450", channel: "平台112", shopName: "DP901", goodsName: "ddg 净润卸妆膏110ml 卸妆膏", specName: "荔枝款110ml正装", date: "2026-08-01", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "湖北省 武汉市 黄陂区"},
      { orderNo: "110208903527049681", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044400240875", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "贵州省 铜仁市 印江土家族苗族自治县"},
      { orderNo: "110208912910331663", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044402216806", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "广东省 深圳市 宝安区"},
      { orderNo: "110208910246724836", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044402216806", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江西省 南昌市 青山湖区"},
      { orderNo: "110208913065307232", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044402216806", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "福建省 泉州市 南安市"},
      { orderNo: "110208913156166747", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044402216806", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "黑龙江省 绥化市 安达市"},
      { orderNo: "110208914871100143", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044402216806", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "福建省 泉州市 南安市"},
      { orderNo: "110208917165670585", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044403149353", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "海南省 三亚市 吉阳区"},
      { orderNo: "5126995118494008441", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【重磅升级】ddg白桃燕麦荔枝卸妆膏4.0温和清洁不糊眼油乳护肤", specName: "109.99g[荔枝香3.0❤赠3ml]", date: "2026-08-01", qty: 1, unit: "个", price: 61.2, amount: 61, customer: "江苏省 宿迁市 宿城区"},
      { orderNo: "110208919440476457", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044403365477", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "陕西省 宝鸡市 金台区"},
      { orderNo: "110208920352598470", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044403365477", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江西省 九江市 都昌县"},
      { orderNo: "110208921370117517", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044403365477", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "重庆 重庆市 江津区"},
      { orderNo: "110208920661612036", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044403365477", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江西省 上饶市 玉山县"},
      { orderNo: "110208924289744832", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044403947511", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "湖北省 随州市 曾都区"},
      { orderNo: "110208934712524868", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044404642736", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "黑龙江省 鹤岗市 绥滨县"},
      { orderNo: "110208932068786542", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044404843999", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "河北省 唐山市 路北区"},
      { orderNo: "110208935846578182", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044404843999", date: "2026-08-01", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "福建省 厦门市 翔安区"},
      { orderNo: "3315229718735001867", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【重磅升级】ddg白桃燕麦荔枝卸妆膏4.0温和清洁不糊眼油乳护肤", specName: "109.99g[荔枝香3.0❤赠3ml]", date: "2026-08-01", qty: 1, unit: "个", price: 61.2, amount: 61, customer: "浙江省 衢州市 衢江区"},
      { orderNo: "110208933205886569", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044404843999", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "浙江省 杭州市 西湖区"},
      { orderNo: "110208935131598605", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044405159466", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "贵州省 贵阳市 云岩区"},
      { orderNo: "110208937238359556", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044405565765", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "河南省 郑州市 惠济区"},
      { orderNo: "110208939765168897", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044405329810", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "湖南省 长沙市 天心区"},
      { orderNo: "3102237981715274933", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-02", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "湖南省 长沙市 芙蓉区"},
      { orderNo: "110208939036505197", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044405790818", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "辽宁省 锦州市 凌海市"},
      { orderNo: "110208956743837277", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044409567894", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "安徽省 亳州市 蒙城县"},
      { orderNo: "110208953524985242", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044409567894", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "四川省 南充市 南部县"},
      { orderNo: "110208957156685355", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044410398450", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江西省 赣州市 瑞金市"},
      { orderNo: "3834651318212019265", channel: "平台112", shopName: "DP901", goodsName: "ddg 净润卸妆膏110ml 卸妆膏", specName: "荔枝款110ml正装", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "海南省 海口市 龙华区"},
      { orderNo: "3402238583805416807", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-02", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "江苏省 南京市 建邺区"},
      { orderNo: "3315270830866013156", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【重磅升级】ddg白桃燕麦荔枝卸妆膏4.0温和清洁不糊眼油乳护肤", specName: "109.99g[荔枝香3.0❤赠3ml]", date: "2026-08-02", qty: 1, unit: "个", price: 61.2, amount: 61, customer: "湖南省 衡阳市 蒸湘区"},
      { orderNo: "110208962387160195", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044411299028", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "山东省 潍坊市 青州市"},
      { orderNo: "702238730479983955", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-02", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "辽宁省 沈阳市 和平区"},
      { orderNo: "110208971701033282", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044412582046", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "贵州省 黔南布依族苗族自治州 都匀市"},
      { orderNo: "3902238790008914453", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-02", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "浙江省 杭州市 西湖区"},
      { orderNo: "110208973088540525", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044412665283", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "浙江省 嘉兴市 平湖市"},
      { orderNo: "110208974119526406", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044413293167", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江苏省 盐城市 亭湖区"},
      { orderNo: "110208970371090875", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044413293167", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "黑龙江省 大庆市 龙凤区"},
      { orderNo: "110208973384573802", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044413767116", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "贵州省 安顺市 西秀区"},
      { orderNo: "110208976989763958", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044413767116", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江苏省 常州市 金坛区"},
      { orderNo: "110208973477458944", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044413767116", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江苏省 苏州市 虎丘区"},
      { orderNo: "3802238893055695645", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-02", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "浙江省 杭州市 余杭区"},
      { orderNo: "110208984941786743", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044414705239", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "黑龙江省 哈尔滨市 香坊区"},
      { orderNo: "110208984215145574", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044414705239", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "山东省 德州市 庆云县"},
      { orderNo: "3834715549447988066", channel: "平台112", shopName: "DP901", goodsName: "ddg 净润卸妆膏110ml 卸妆膏", specName: "荔枝款110ml正装", date: "2026-08-02", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广东省 梅州市 梅江区"},
      { orderNo: "110208988060118715", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044415170590", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "湖北省 武汉市 洪山区"},
      { orderNo: "110208988073410204", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044415170590", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "四川省 成都市 温江区"},
      { orderNo: "110208988152760367", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044415170590", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "辽宁省 辽阳市 灯塔市"},
      { orderNo: "110208991187186034", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044415556550", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "湖南省 娄底市 娄星区"},
      { orderNo: "110208988327974721", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044415556550", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "四川省 达州市 达川区"},
      { orderNo: "110208991664863505", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044416227856", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "福建省 泉州市 鲤城区"},
      { orderNo: "110208999784671246", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044416782698", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江西省 九江市 湖口县"},
      { orderNo: "110208996033552109", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044416782698", date: "2026-08-02", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "北京 北京市 通州区"},
      { orderNo: "4049816192996723285", channel: "平台45", shopName: "DP943", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-02", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "江苏省 南京市 鼓楼区"},
      { orderNo: "110209000261864021", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044416746484", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "黑龙江省 鸡西市 虎林市"},
      { orderNo: "110209002868970189", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044417271570", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "河南省 南阳市 社旗县"},
      { orderNo: "3315309567338346850", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【重磅升级】ddg白桃燕麦荔枝卸妆膏4.0温和清洁不糊眼油乳护肤", specName: "109.99g[荔枝香3.0❤赠3ml]", date: "2026-08-03", qty: 1, unit: "个", price: 61.2, amount: 61, customer: "云南省 昆明市 嵩明县"},
      { orderNo: "110209007796630382", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044417704135", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "湖北省 宜昌市 枝江市"},
      { orderNo: "110209005081173984", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044417904799", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "四川省 成都市 锦江区"},
      { orderNo: "3315954972298007855", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【重磅升级】ddg白桃燕麦荔枝卸妆膏4.0温和清洁不糊眼油乳护肤", specName: "109.99g[荔枝香3.0❤赠3ml]", date: "2026-08-03", qty: 1, unit: "个", price: 61.2, amount: 61, customer: "浙江省 台州市 玉环市"},
      { orderNo: "110209014041263403", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044420506622", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "广东省 佛山市 顺德区"},
      { orderNo: "3834819028095063164", channel: "平台112", shopName: "DP901", goodsName: "ddg 净润卸妆膏110ml 卸妆膏", specName: "荔枝款110ml正装", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广西壮族自治区 南宁市 西乡塘区"},
      { orderNo: "110209014291287654", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044420506622", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "贵州省 铜仁市 石阡县"},
      { orderNo: "110209011492594050", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044421016141", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "河南省 洛阳市 栾川县"},
      { orderNo: "FX20260803000005", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-03", qty: 2, unit: "个", price: 26.82, amount: 54, customer: "上海 上海市 静安区"},
      { orderNo: "110209016299240851", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044421131360", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江苏省 南京市 浦口区"},
      { orderNo: "110209014496700638", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044421131360", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "重庆 重庆市 北碚区"},
      { orderNo: "110209021123017282", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044421930813", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "湖南省 张家界市 永定区"},
      { orderNo: "E20260803132120006500157", channel: "平台17", shopName: "813", goodsName: "ddg净润卸妆膏（荔枝香/青苹香/燕麦香/凤梨香）110ml荔枝卸妆膏【3.0与4.0不兼容】", specName: "规格:荔枝3.0 正装", date: "2026-08-03", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "浙江省 金华市 婺城区"},
      { orderNo: "110209024070223596", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044422129716", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "河北省 廊坊市 安次区"},
      { orderNo: "110209021364740768", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044422267458", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "河北省 承德市 双滦区"},
      { orderNo: "FX20260803000014", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-03", qty: 50, unit: "个", price: 29.5, amount: 1475, customer: "山东省 青岛市 李沧区"},
      { orderNo: "FX20260803000014", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-03", qty: 10, unit: "个", price: 0.0, amount: 0, customer: "山东省 青岛市 李沧区"},
      { orderNo: "110209025916014724", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044422935801", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江苏省 徐州市 沛县"},
      { orderNo: "110209025940459086", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044422935801", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江西省 九江市 修水县"},
      { orderNo: "110209030726217216", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044422935801", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "河北省 邯郸市 武安市"},
      { orderNo: "110209030848217353", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044423312257", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "河北省 邯郸市 邯山区"},
      { orderNo: "110209031938095632", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044423423905", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "山东省 济宁市 梁山县"},
      { orderNo: "110209032268219904", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044424418566", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "山东省 青岛市 黄岛区"},
      { orderNo: "110209032528089176", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044424787240", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "湖北省 黄冈市 英山县"},
      { orderNo: "110209034113307262", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044425304635", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "湖南省 长沙市 浏阳市"},
      { orderNo: "110209040745695454", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044425793326", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "贵州省 安顺市 西秀区"},
      { orderNo: "110209042225093384", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044427029022", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "湖北省 咸宁市 咸安区"},
      { orderNo: "110209046086913425", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044427348361", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "浙江省 台州市 温岭市"},
      { orderNo: "110209044478237732", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044427746436", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "福建省 福州市 长乐区"},
      { orderNo: "3315473798121014864", channel: "淘系", shopName: "ddg官方旗舰店（淘系）", goodsName: "【重磅升级】ddg白桃燕麦荔枝卸妆膏4.0温和清洁不糊眼油乳护肤", specName: "109.99g[荔枝香3.0❤赠3ml]", date: "2026-08-03", qty: 1, unit: "个", price: 61.2, amount: 61, customer: "江苏省 徐州市 邳州市"},
      { orderNo: "110209047392132384", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044427915589", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "湖南省 张家界市 永定区"},
      { orderNo: "110209047490802384", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044427937186", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "湖南省 张家界市 永定区"},
      { orderNo: "110209045631505080", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044427951546", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "陕西省 西安市 雁塔区"},
      { orderNo: "110209051743332384", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044427951546", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "湖南省 张家界市 永定区"},
      { orderNo: "110209051744520202", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044427951546", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "重庆 重庆市 武隆区"},
      { orderNo: "110209048499574577", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044427951546", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "海南省 海口市 美兰区"},
      { orderNo: "110209052914875387", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044428378845", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "山东省 聊城市 阳谷县"},
      { orderNo: "110209054559486972", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044429048319", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "山西省 运城市 稷山县"},
      { orderNo: "110209058716869084", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044429048319", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "四川省 成都市 龙泉驿区"},
      { orderNo: "110209056412067308", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044429048319", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "陕西省 榆林市 靖边县"},
      { orderNo: "4040556193376215707", channel: "平台45", shopName: "DP966", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-03", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "江苏省 苏州市 常熟市"},
      { orderNo: "110209060838732686", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044429183445", date: "2026-08-03", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "河南省 南阳市 宛城区"},
      { orderNo: "110209064489281888", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044430155949", date: "2026-08-04", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "贵州省 毕节市 威宁彝族回族苗族自治县"},
      { orderNo: "110209069729613425", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044430770173", date: "2026-08-04", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "云南省 红河哈尼族彝族自治州 蒙自市"},
      { orderNo: "110209067111838020", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044431153291", date: "2026-08-04", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "上海 上海市 宝山区"},
      { orderNo: "110209072119356015", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044433031142", date: "2026-08-04", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "黑龙江省 绥化市 望奎县"},
      { orderNo: "110209067417376255", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044433031142", date: "2026-08-04", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "山东省 德州市 禹城市"},
      { orderNo: "110209067583478326", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044433308915", date: "2026-08-04", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "天津 天津市 西青区"},
      { orderNo: "110209070589105021", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044433308915", date: "2026-08-04", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "河南省 新乡市 原阳县"},
      { orderNo: "110209075264362136", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044435146558", date: "2026-08-04", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "广东省 广州市 海珠区"},
      { orderNo: "110209074480410694", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044435290862", date: "2026-08-04", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "江苏省 宿迁市 沭阳县"},
      { orderNo: "110209079658188996", channel: "品牌直发", shopName: "品牌直发仓", goodsName: "【品牌直发】ddg 3.0净润卸妆膏荔枝/燕麦 清洁温和养肤精华级养护无需二次洁面敏肌可用 110ml 护肤品化妆品", specName: "荔枝香110ml@101220044436126168", date: "2026-08-04", qty: 1, unit: "个", price: 57.0, amount: 57, customer: "湖南省 长沙市 岳麓区"},
      { orderNo: "FX20260804000025", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-04", qty: 20, unit: "个", price: 29.5, amount: 590, customer: "浙江省 杭州市 临平区"},
      { orderNo: "FX20260804000025", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-04", qty: 4, unit: "个", price: 0.0, amount: 0, customer: "浙江省 杭州市 临平区"},
      { orderNo: "FX20260804000026", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-04", qty: 20, unit: "个", price: 29.5, amount: 590, customer: "广东省 深圳市 宝安区"},
      { orderNo: "FX20260804000026", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-04", qty: 4, unit: "个", price: 0.0, amount: 0, customer: "广东省 深圳市 宝安区"},
      { orderNo: "FX20260804000027", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-04", qty: 20, unit: "个", price: 29.5, amount: 590, customer: "浙江省 嘉兴市 桐乡市"},
      { orderNo: "FX20260804000027", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-04", qty: 4, unit: "个", price: 0.0, amount: 0, customer: "浙江省 嘉兴市 桐乡市"},
      { orderNo: "MI634420039138807808", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-04", qty: 1, unit: "个", price: 0.0, amount: 0, customer: "广东省 广州市 番禺区"},
      { orderNo: "3835042456588746222", channel: "平台112", shopName: "DP901", goodsName: "ddg 净润卸妆膏110ml 卸妆膏", specName: "荔枝款110ml正装", date: "2026-08-04", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "上海 上海市 浦东新区"},
      { orderNo: "3802241831636464348", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-04", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "上海 上海市 静安区"},
      { orderNo: "3602241912632555203", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-04", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "江苏省 苏州市 姑苏区"},
      { orderNo: "3102242000424921045", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-04", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "湖南省 长沙市 芙蓉区"},
      { orderNo: "602242660434012607", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-05", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "辽宁省 大连市 甘井子区"},
      { orderNo: "FX20260805000005", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-05", qty: 180, unit: "个", price: 29.5, amount: 5310, customer: "四川省 成都市 新都区"},
      { orderNo: "FX20260805000005", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-05", qty: 36, unit: "个", price: 0.0, amount: 0, customer: "四川省 成都市 新都区"},
      { orderNo: "FX20260805000007", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-05", qty: 144, unit: "个", price: 29.5, amount: 4248, customer: "河北省 石家庄市 新华区"},
      { orderNo: "FX20260805000007", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-05", qty: 28, unit: "个", price: 0.0, amount: 0, customer: "河北省 石家庄市 新华区"},
      { orderNo: "2702243162257136583", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-05", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "上海 上海市 普陀区"},
      { orderNo: "MI634819766783184896", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-05", qty: 1, unit: "个", price: 0.0, amount: 0, customer: "河北省 廊坊市 广阳区"},
      { orderNo: "MI634819774815277056", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-05", qty: 1, unit: "个", price: 0.0, amount: 0, customer: "浙江省 杭州市 西湖区"},
      { orderNo: "MI634819779735195648", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-05", qty: 1, unit: "个", price: 0.0, amount: 0, customer: "江苏省 苏州市 吴中区"},
      { orderNo: "2202243222356639658", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-05", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "上海 上海市 黄浦区"},
      { orderNo: "4088120360138773241", channel: "平台45", shopName: "DP899", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-05", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "上海 上海 长宁区"},
      { orderNo: "MI634869855513874432", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-05", qty: 1, unit: "个", price: 0.0, amount: 0, customer: "浙江省 杭州市 西湖区"},
      { orderNo: "3602243631447411809", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-06", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "海南省 海口市 秀英区"},
      { orderNo: "3835359287736088062", channel: "平台112", shopName: "DP901", goodsName: "ddg 净润卸妆膏110ml 卸妆膏", specName: "荔枝款110ml正装", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "广西壮族自治区 贵港市 港南区"},
      { orderNo: "3835386305227893625", channel: "平台112", shopName: "DP901", goodsName: "ddg 净润卸妆膏110ml 卸妆膏", specName: "荔枝款110ml正装", date: "2026-08-06", qty: 1, unit: "个", price: 49.0, amount: 49, customer: "上海 上海市 闵行区"},
      { orderNo: "2702244611344220541", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-06", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "浙江省 杭州市 西湖区"},
      { orderNo: "2802244951177994586", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-06", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "湖南省 长沙市 芙蓉区"},
      { orderNo: "FX20260807000074", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-07", qty: 36, unit: "个", price: 18.0, amount: 648, customer: "江西省 南昌市 西湖区"},
      { orderNo: "3102245992272998560", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-07", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "湖南省 长沙市 雨花区"},
      { orderNo: "2102247581563836565", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-08", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "浙江省 杭州市 西湖区"},
      { orderNo: "1802247651349282994", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-08", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "吉林省 吉林市 丰满区"},
      { orderNo: "4036310361720911407", channel: "平台45", shopName: "DP935", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-08", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "陕西省 西安市 雁塔区"},
      { orderNo: "4016080361549266665", channel: "平台45", shopName: "DP937", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-08", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "山东省 烟台市 芝罘区"},
      { orderNo: "2802248893041125076", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-09", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "上海 上海市 长宁区"},
      { orderNo: "1902249162266913401", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-09", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "上海 上海市 普陀区"},
      { orderNo: "2002249922974675683", channel: "程十安", shopName: "程十安", goodsName: "【荔枝香卸妆膏】程十安 ddg净润卸妆膏(荔枝香)110ml/盒1秒乳化速溶速净抗氧透亮", specName: "", date: "2026-08-10", qty: 1, unit: "个", price: 55.0, amount: 55, customer: "上海 上海市 普陀区"},
      { orderNo: "MI636617132561534976", channel: "自有", shopName: "自有门店", goodsName: "ddg 净润卸妆膏（荔枝香）110ml 荔枝卸妆膏", specName: " ", date: "2026-08-10", qty: 1, unit: "个", price: 0.0, amount: 0, customer: "广东省 深圳市 其它区"},
    ],
 },

  /* ---------- 半成品 荔枝唇油（内料）DD25F0131N · J5F281（真实：652401 → ZZ250628033 → 2025-06-28，瑾亭；入库 36000 克） ---------- */
  "DD25F0131N|J5F281": {
    sku: { code: "DD25F0131N", name: DD_N_LZ, category: "半成品", spec: "内料 · 乳化/均质", unit: "克", validityDays: 180, purchaseFlag: false, salesFlag: false, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "J5F281", warehouse: "OEM瑾亭航谊仓（其然）(待检)", unit: "克", productionDate: "2025-06-28", expiryDate: "2025-12-25", currentQty: 0, qualityPeriodDays: 730, status: "正常"},
    inRecords: [
      { stockInNo: "MRK25062800637", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "组装入库", docType: "生产入库单", date: "2025-06-28", qty: 36000, unit: "克", sourceOrder: "ZZ250628033", orderNo: "ZZ250628033", supplier: "-"},
      { stockInNo: "MRK25070200656", provider: "上海瑾亭化妆品有限公司", businessType: "调拨入库", workType: "调拨入库", docType: "调拨入库单", date: "2025-07-02", qty: 36000, unit: "克", sourceOrder: "DB2507020195", orderNo: "DB2507020195", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK25070200662", provider: "上海瑾亭化妆品有限公司", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-07-02", qty: 36000, unit: "克", sourceOrder: "DB2507020195", orderNo: "DB2507020195", supplier: "-"},
      { stockOutNo: "MCK25070300112", provider: "上海瑾亭化妆品有限公司", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2025-07-03", qty: 36000, unit: "克", sourceOrder: "LT2507030021", orderNo: "LT2507030021", supplier: "-"},
      { stockOutNo: "MCK25070400337", provider: "上海瑾亭化妆品有限公司", businessType: "生产耗用", workType: "生产耗用", docType: "生产出库单", date: "2025-07-04", qty: 33376.887, unit: "克", sourceOrder: "WD250704001", orderNo: "-", supplier: "-"},
    ],
    outputs: [LITCHI_OUT],
    sales: [],
 },

  /* ---------- 半成品 荔枝唇油（内料）DD25F0131N · J5G211（真实：652411 → ZZ250721052 → 2025-07-21，瑾亭） ---------- */
  "DD25F0131N|J5G211": {
    sku: { code: "DD25F0131N", name: DD_N_LZ, category: "半成品", spec: "内料 · 乳化/均质", unit: "克", validityDays: 180, purchaseFlag: false, salesFlag: false, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "J5G211", warehouse: "OEM瑾亭航谊仓（其然）(待检)", unit: "克", productionDate: "2025-07-21", expiryDate: "2026-01-17", currentQty: 0, qualityPeriodDays: 730, status: "正常"},
    inRecords: [
      { stockInNo: "MRK25072100777", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "组装入库", docType: "生产入库单", date: "2025-07-21", qty: 36000, unit: "克", sourceOrder: "ZZ250721052", orderNo: "ZZ250721052", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK25072400259", provider: "上海瑾亭化妆品有限公司", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-07-24", qty: 36000, unit: "克", sourceOrder: "DB2507240030", orderNo: "DB2507240030", supplier: "-"},
      { stockOutNo: "MCK25072400163", provider: "上海瑾亭化妆品有限公司", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2025-07-24", qty: 36000, unit: "克", sourceOrder: "LT2507240063", orderNo: "LT2507240063", supplier: "-"},
    ],
    outputs: [
      out("DD25F0011A", DD_A_LZ, "成品裸支", "J5F1211/20280611", 1980, "个", "2025-06-13", "BOM-DD25F0011A", "0.75 克/个", "上海瑾亭化妆品有限公司", "MRK25061300321"),
    ],
    sales: [],
 },

  /* ---------- 半成品 荔枝唇油（内料）DD25F0131N · J5G261（真实：652423 → ZZ250726001 → 2025-07-26，瑾亭） ---------- */
  "DD25F0131N|J5G261": {
    sku: { code: "DD25F0131N", name: DD_N_LZ, category: "半成品", spec: "内料 · 乳化/均质", unit: "克", validityDays: 180, purchaseFlag: false, salesFlag: false, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "J5G261", warehouse: "OEM瑾亭航谊仓（其然）(待检)", unit: "克", productionDate: "2025-07-26", expiryDate: "2026-01-22", currentQty: 0, qualityPeriodDays: 730, status: "正常"},
    inRecords: [
      { stockInNo: "MRK25072600014", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "组装入库", docType: "生产入库单", date: "2025-07-26", qty: 78000, unit: "克", sourceOrder: "ZZ250726001", orderNo: "ZZ250726001", supplier: "-"},
      { stockInNo: "MRK25073100396", provider: "上海瑾亭化妆品有限公司", businessType: "调拨入库", workType: "调拨入库", docType: "调拨入库单", date: "2025-07-31", qty: 78000, unit: "克", sourceOrder: "DB2507310156", orderNo: "DB2507310156", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK25073100395", provider: "上海瑾亭化妆品有限公司", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-07-31", qty: 78000, unit: "克", sourceOrder: "DB2507310156", orderNo: "DB2507310156", supplier: "-"},
      { stockOutNo: "MCK25080700248", provider: "上海瑾亭化妆品有限公司", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2025-08-07", qty: 78000, unit: "克", sourceOrder: "LT2508070096", orderNo: "LT2508070096", supplier: "-"},
    ],
    outputs: [
      out("DD25F0011A", DD_A_LZ, "成品裸支", "J5F1211/20280611", 1980, "个", "2025-06-13", "BOM-DD25F0011A", "0.75 克/个", "上海瑾亭化妆品有限公司", "MRK25061300321"),
    ],
    sales: [],
 },

  /* ---------- 半成品 荔枝唇油（内料）DD25F0131N · J5H231（真实：652424 → ZZ250823022 → 2025-08-23，瑾亭） ---------- */
  "DD25F0131N|J5H231": {
    sku: { code: "DD25F0131N", name: DD_N_LZ, category: "半成品", spec: "内料 · 乳化/均质", unit: "克", validityDays: 180, purchaseFlag: false, salesFlag: false, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "J5H231", warehouse: "OEM瑾亭航谊仓（其然）(待检)", unit: "克", productionDate: "2025-08-23", expiryDate: "2026-02-19", currentQty: 0, qualityPeriodDays: 730, status: "正常"},
    inRecords: [
      { stockInNo: "MRK25082300376", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "组装入库", docType: "生产入库单", date: "2025-08-23", qty: 28500, unit: "克", sourceOrder: "ZZ250823022", orderNo: "ZZ250823022", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK25082800176", provider: "上海瑾亭化妆品有限公司", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-08-28", qty: 28500, unit: "克", sourceOrder: "DB2508280022", orderNo: "DB2508280022", supplier: "-"},
      { stockOutNo: "MCK25083000093", provider: "上海瑾亭化妆品有限公司", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2025-08-30", qty: 28500, unit: "克", sourceOrder: "LT2508300019", orderNo: "LT2508300019", supplier: "-"},
    ],
    outputs: [
      out("DD25F0011A", DD_A_LZ, "成品裸支", "J5F1211/20280611", 1980, "个", "2025-06-13", "BOM-DD25F0011A", "0.75 克/个", "上海瑾亭化妆品有限公司", "MRK25061300321"),
    ],
    sales: [],
 },

  /* ---------- 半成品 荔枝唇油（内料）DD25F0131N · J5H232（真实：652423 → ZZ250823023 → 2025-08-23，瑾亭；入库 29000 克） ---------- */
  "DD25F0131N|J5H232": {
    sku: { code: "DD25F0131N", name: DD_N_LZ, category: "半成品", spec: "内料 · 乳化/均质", unit: "克", validityDays: 180, purchaseFlag: false, salesFlag: false, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "J5H232", warehouse: "OEM瑾亭航谊仓（其然）(待检)", unit: "克", productionDate: "2025-08-23", expiryDate: "2026-02-19", currentQty: 0, qualityPeriodDays: 730, status: "正常"},
    inRecords: [
      { stockInNo: "MRK25082300378", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "组装入库", docType: "生产入库单", date: "2025-08-23", qty: 29000, unit: "克", sourceOrder: "ZZ250823023", orderNo: "ZZ250823023", supplier: "-"},
      { stockInNo: "MRK25082800188", provider: "上海瑾亭化妆品有限公司", businessType: "调拨入库", workType: "调拨入库", docType: "调拨入库单", date: "2025-08-28", qty: 29000, unit: "克", sourceOrder: "DB2508280022", orderNo: "DB2508280022", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK25082800176", provider: "上海瑾亭化妆品有限公司", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-08-28", qty: 29000, unit: "克", sourceOrder: "DB2508280022", orderNo: "DB2508280022", supplier: "-"},
      { stockOutNo: "MCK25083000093", provider: "上海瑾亭化妆品有限公司", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2025-08-30", qty: 29000, unit: "克", sourceOrder: "LT2508300019", orderNo: "LT2508300019", supplier: "-"},
      { stockOutNo: "MCK25090100144", provider: "上海瑾亭化妆品有限公司", businessType: "生产耗用", workType: "生产耗用", docType: "生产出库单", date: "2025-09-01", qty: 27212.717, unit: "克", sourceOrder: "WD250901002", orderNo: "-", supplier: "-"},
    ],
    outputs: [LITCHI_OUT_231],
    sales: [],
 },

  /* ---------- 半成品 荔枝唇油（内料）DD25F0131N · J5I061（真实：652424 → ZZ250906026 → 2025-09-06，瑾亭；入库 28200 克） ---------- */
  "DD25F0131N|J5I061": {
    sku: { code: "DD25F0131N", name: DD_N_LZ, category: "半成品", spec: "内料 · 乳化/均质", unit: "克", validityDays: 180, purchaseFlag: false, salesFlag: false, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "J5I061", warehouse: "OEM瑾亭航谊仓（其然）(待检)", unit: "克", productionDate: "2025-09-06", expiryDate: "2026-03-05", currentQty: 0, qualityPeriodDays: 730, status: "正常"},
    inRecords: [
      { stockInNo: "MRK25090600606", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "组装入库", docType: "生产入库单", date: "2025-09-06", qty: 28200, unit: "克", sourceOrder: "ZZ250906026", orderNo: "ZZ250906026", supplier: "-"},
      { stockInNo: "MRK25091100376", provider: "上海瑾亭化妆品有限公司", businessType: "调拨入库", workType: "调拨入库", docType: "调拨入库单", date: "2025-09-11", qty: 28200, unit: "克", sourceOrder: "DB2509110131", orderNo: "DB2509110131", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK25091100361", provider: "上海瑾亭化妆品有限公司", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-09-11", qty: 28200, unit: "克", sourceOrder: "DB2509110131", orderNo: "DB2509110131", supplier: "-"},
      { stockOutNo: "MCK25091200596", provider: "上海瑾亭化妆品有限公司", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2025-09-12", qty: 28200, unit: "克", sourceOrder: "LT2509120217", orderNo: "LT2509120217", supplier: "-"},
      { stockOutNo: "MCK25091900499", provider: "上海瑾亭化妆品有限公司", businessType: "生产耗用", workType: "生产耗用", docType: "生产出库单", date: "2025-09-19", qty: 25141.675, unit: "克", sourceOrder: "WD250919001", orderNo: "-", supplier: "-"},
    ],
    outputs: [LITCHI_OUT_261],
    sales: [],
 },

  /* ---------- 半成品 荔枝唇油（内料）DD25F0131N · J5I062（真实：652424 → ZZ250908022 → 2025-09-08，瑾亭；入库 37000 克） ---------- */
  "DD25F0131N|J5I062": {
    sku: { code: "DD25F0131N", name: DD_N_LZ, category: "半成品", spec: "内料 · 乳化/均质", unit: "克", validityDays: 180, purchaseFlag: false, salesFlag: false, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "J5I062", warehouse: "OEM瑾亭航谊仓（其然）(待检)", unit: "克", productionDate: "2025-09-08", expiryDate: "2026-03-07", currentQty: 0, qualityPeriodDays: 730, status: "正常"},
    inRecords: [
      { stockInNo: "MRK25090800224", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "组装入库", docType: "生产入库单", date: "2025-09-08", qty: 37000, unit: "克", sourceOrder: "ZZ250908022", orderNo: "ZZ250908022", supplier: "-"},
      { stockInNo: "MRK25091100376", provider: "上海瑾亭化妆品有限公司", businessType: "调拨入库", workType: "调拨入库", docType: "调拨入库单", date: "2025-09-11", qty: 37000, unit: "克", sourceOrder: "DB2509110131", orderNo: "DB2509110131", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK25091100361", provider: "上海瑾亭化妆品有限公司", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2025-09-11", qty: 37000, unit: "克", sourceOrder: "DB2509110131", orderNo: "DB2509110131", supplier: "-"},
      { stockOutNo: "MCK25091200596", provider: "上海瑾亭化妆品有限公司", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2025-09-12", qty: 37000, unit: "克", sourceOrder: "LT2509120217", orderNo: "LT2509120217", supplier: "-"},
      { stockOutNo: "MCK25091900500", provider: "上海瑾亭化妆品有限公司", businessType: "生产耗用", workType: "生产耗用", docType: "生产出库单", date: "2025-09-19", qty: 32049.536, unit: "克", sourceOrder: "WD250919002", orderNo: "-", supplier: "-"},
    ],
    outputs: [LITCHI_OUT_261],
    sales: [],
 },

  /* ---------- 半成品 荔枝唇油（内料）DD25F0131N · J6G281（真实：652439 → ZZ260728016 → 2026-07-28，瑾亭） ---------- */
  "DD25F0131N|J6G281": {
    sku: { code: "DD25F0131N", name: DD_N_LZ, category: "半成品", spec: "内料 · 乳化/均质", unit: "克", validityDays: 180, purchaseFlag: false, salesFlag: false, isWip: true, brand: "ddg", defaultProvider: "上海瑾亭化妆品有限公司"},
    batch: { batchNo: "J6G281", warehouse: "OEM瑾亭航谊仓（其然）(待检)", unit: "克", productionDate: "2026-07-28", expiryDate: "2027-01-24", currentQty: 0, qualityPeriodDays: 730, status: "正常"},
    inRecords: [
      { stockInNo: "MRK26072800479", provider: "上海瑾亭化妆品有限公司", businessType: "生产入库", workType: "组装入库", docType: "生产入库单", date: "2026-07-28", qty: 73000, unit: "克", sourceOrder: "ZZ260728016", orderNo: "ZZ260728016", supplier: "-"},
    ],
    outRecords: [
      { stockOutNo: "MCK26073000196", provider: "上海瑾亭化妆品有限公司", businessType: "调拨出库", workType: "调拨出库", docType: "调拨出库单", date: "2026-07-30", qty: 73000, unit: "克", sourceOrder: "DB2607300056", orderNo: "DB2607300056", supplier: "-"},
      { stockOutNo: "MCK26073000561", provider: "上海瑾亭化妆品有限公司", businessType: "生产领退料出库", workType: "生产领退料出库", docType: "生产出库单", date: "2026-07-30", qty: 73000, unit: "克", sourceOrder: "LT2607300050", orderNo: "LT2607300050", supplier: "-"},
    ],
    outputs: [
      out("DD25F0011A", DD_A_LZ, "成品裸支", "J5F1211/20280611", 1980, "个", "2025-06-13", "BOM-DD25F0011A", "0.75 克/个", "上海瑾亭化妆品有限公司", "MRK25061300321"),
    ],
    sales: [],
 },
}

const fallbackBatch = (b: string): BatchStock => ({
  batchNo: b, warehouse: "-", unit: "", productionDate: "-", expiryDate: "-", currentQty: 0, qualityPeriodDays: 0, status: "正常",
})

/* ==================== 单位归一化：页面仅展示「千克 / PCS」 ====================
   数据库真实单位可能为 g / 克 / kg / 个 / 支等。按约定统一：
     - g、克 → 千克，数量 ÷1000
     - kg、千克 → 千克，数量不变
     - 其余（个/支/PCS/盒/套）→ PCS，数量不变
   在数据出口（getMaterial / queryBatchFlow）统一转换，UI 无需改动。 */
const UNIT_KG = "千克"
const UNIT_PCS = "PCS"

function normUnit(unit: string | undefined): string {
  const u = (unit || "").trim().toLowerCase()
  if (!u) return UNIT_KG
  if (["g", "克", "kg", "千克"].includes(u)) return UNIT_KG
  return UNIT_PCS
}

/** g → 千克换算（÷1000），其余单位数量不变 */
function normQty(qty: number | undefined, unit: string | undefined): number {
  const u = (unit || "").trim().toLowerCase()
  if (qty == null) return 0
  if (["g", "克"].includes(u)) {
    const converted = qty / 1000
    return Math.round(converted * 1000) / 1000
 }
  return qty
}

function normStock(b: BatchStock): BatchStock {
  return {
    ...b,
    unit: normUnit(b.unit),
    currentQty: normQty(b.currentQty, b.unit),
    stockByWarehouse: b.stockByWarehouse?.map((w) => ({
      warehouse: w.warehouse,
      currentQty: normQty(w.currentQty, b.unit),
   })),
 }
}

function normSku(material: SkuInfo): SkuInfo {
  return { ...material, unit: normUnit(material.unit)}
}

/** 查询某物料：基本信息 + 该物料全部批次库存列表（已做单位归一化） */
export function getMaterial(code: string): MaterialDetail | null {
  const master = getSku(code)
  if (!master) return null
  const firstFlow = flows[`${master.code}|${master.batches[0]}`]
  const material: SkuInfo = firstFlow?.sku ?? {
    code: master.code, name: master.name, category: master.category,
    spec: "-", unit: "", validityDays: 0, purchaseFlag: false, salesFlag: false,
    isWip: false, defaultProvider: "-",
 }
  const batches: BatchStock[] = master.batches.map((b) => {
    const flow = flows[`${master.code}|${b}`]?.batch ?? fallbackBatch(b)
    return normStock(flow)
 })
  return { material: normSku(material), batches}
}

/** 选择某批次：返回批次单据流（入库/出库/产出物/销售；已做单位归一化） */
export function queryBatchFlow(code: string, batchNo: string): BatchFlow | null {
  const key = `${code.trim().toUpperCase()}|${batchNo.trim().toUpperCase()}`
  const flow = flows[key]
  if (!flow) return null
  return {
    ...flow,
    sku: normSku(flow.sku),
    batch: normStock(flow.batch),
    inRecords: flow.inRecords.map((r) => ({ ...r, unit: normUnit(r.unit), qty: normQty(r.qty, r.unit)})),
    outRecords: flow.outRecords.map((r) => ({ ...r, unit: normUnit(r.unit), qty: normQty(r.qty, r.unit)})),
    outputs: flow.outputs.map((o) => ({ ...o, unit: normUnit(o.unit), qty: normQty(o.qty, o.unit)})),
    sales: flow.sales.map((s) => ({ ...s, unit: normUnit(s.unit), qty: normQty(s.qty, s.unit)})),
 }
}

/* ==================== 正向追溯 · 按模块聚合查询 ====================
   查询一个物料（可多选批次过滤）后，按六大模块返回：
   物料信息 / 送货记录 / 入库记录 / 出库记录 / 领用记录 / 生产去向。 */

/** 供应商主数据（演示用：送货记录补全供应商编码/联系人/邮箱/电话/地址） */
export interface SupplierMaster {
  code: string
  name: string
  contact: string
  contactEmail: string
  contactPhone: string
  address: string
}

export const supplierMasters: SupplierMaster[] = [
  { code: "S1001", name: "上海瑾亭化妆品有限公司", contact: "李婷", contactEmail: "liting@jinting-cosmetics.com", contactPhone: "021-5742 8836", address: "上海市奉贤区庄行镇北环路 800 号"},
  { code: "S1002", name: "上海西西艾尔启东日用化学品有限公司", contact: "张伟", contactEmail: "zhangwei@xicair-qd.com", contactPhone: "0513-8322 1108", address: "江苏省启东市经济开发区江海路 699 号"},
  { code: "S1003", name: "卡尔迪克商业（上海）有限公司", contact: "王芳", contactEmail: "wangfang@cargill.com", contactPhone: "021-2312 9900", address: "上海市浦东新区世纪大道 100 号"},
  { code: "S1004", name: "上海其然生物科技有限公司", contact: "赵敏", contactEmail: "zhaomin@qiran-bio.com", contactPhone: "021-3759 2211", address: "上海市嘉定区安亭镇园际路 88 号"},
]

export function getSupplier(name: string): SupplierMaster | undefined {
  return supplierMasters.find((s) => s.name === name)
}

/** 正向追溯查询结果（六大模块数据，批次过滤后聚合） */
export interface ForwardTraceResult {
  sku: SkuInfo
  batches: BatchStock[]
  deliveries: DeliveryRecord[]
  stockIns: StockInRecord[]
  stockOuts: StockOutRecord[]
  issues: IssueRecord[]
  outputs: DownstreamProduct[]
  sales: SalesRecord[]
}

/** 是否为生产领用/耗用类出库（进入「领用记录」模块） */
function isProductionIssue(r: StockOutRecord): boolean {
  return r.businessType.includes("生产")
}

/** 演示用单价（按物料类型） */
function mockPrice(category: Category): number {
  switch (category) {
    case "原料": return 25.8
    case "半成品": return 46.5
    case "成品裸支": return 3.2
    case "成品组合": return 12.8
    default: return 0.8
 }
}

/** 由入库记录派生送货记录（补全供应商主数据与订单信息） */
function buildDelivery(
  r: StockInRecord,
  batch: BatchStock,
  sku: SkuInfo,
  line: number,
): DeliveryRecord {
  const supplierName =
    r.supplier && r.supplier !== "-" ? r.supplier
      : r.provider && r.provider !== "-" ? r.provider
        : "-"
  const sup = getSupplier(supplierName)
  const orderNo =
    r.orderNo && r.orderNo !== "-"
      ? r.orderNo
      : `PO${r.date.replace(/-/g, "")}${String(line).padStart(3, "0")}`
  return {
    batchNo: batch.batchNo,
    productionDate: batch.productionDate,
    expiryDate: batch.expiryDate,
    deliveryNo: r.sourceOrder || "-",
    deliveryDate: r.date,
    deliveryQty: r.qty,
    orderNo,
    orderLineNo: `L${String(line).padStart(3, "0")}`,
    orderQty: Math.round(r.qty * 1.1),
    unit: r.unit,
    price: mockPrice(sku.category),
    supplierCode: sup?.code ?? "-",
    supplierName: sup?.name ?? supplierName,
    contact: sup?.contact ?? "-",
    contactEmail: sup?.contactEmail ?? "-",
    contactPhone: sup?.contactPhone ?? "-",
    supplierAddress: sup?.address ?? "-",
 }
}

/** 由出库记录派生领用记录 */
function buildIssue(
  r: StockOutRecord,
  flow: BatchFlow,
  batch: BatchStock,
): IssueRecord {
  const sku = flow.sku
  return {
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    batchNo: batch.batchNo,
    productionDate: batch.productionDate,
    expiryDate: batch.expiryDate,
    issueNo: r.stockOutNo,
    issueQty: r.qty,
    unit: r.unit,
    issueDate: r.date,
    provider: r.provider && r.provider !== "-" ? r.provider : "-",
    workOrder:
      r.orderNo && r.orderNo !== "-" ? r.orderNo : r.sourceOrder || "-",
    warehouse: batch.warehouse,
 }
}

/**
 * 正向追溯聚合查询：查询某物料（可选批次过滤），返回六大模块数据。
 * - batchNos 为空 → 汇总该物料全部批次；否则仅汇总所选批次。
 * - 各记录已做单位归一化，并补全批次/仓库/供应商等展示字段。
 */
export function queryForwardTrace(
  code: string,
  batchNos?: string[],
): ForwardTraceResult | null {
  const master = getSku(code)
  if (!master) return null
  const targets =
    batchNos && batchNos.length > 0 ? batchNos : master.batches
  const firstFlow = flows[`${master.code}|${master.batches[0]}`]
  const sku: SkuInfo = firstFlow?.sku ?? {
    code: master.code, name: master.name, category: master.category,
    spec: "-", unit: "", validityDays: 0, purchaseFlag: false, salesFlag: false,
    isWip: false, defaultProvider: "-",
 }

  const batches: BatchStock[] = []
  const deliveries: DeliveryRecord[] = []
  const stockIns: StockInRecord[] = []
  const stockOuts: StockOutRecord[] = []
  const issues: IssueRecord[] = []
  const outputs: DownstreamProduct[] = []
  const sales: SalesRecord[] = []

  for (const b of targets) {
    const flow = flows[`${master.code}|${b}`]
    if (!flow) continue
    const batch = normStock(flow.batch)
    batches.push(batch)

    /* 送货记录 + 入库记录：仅供应商送货类入库生成送货记录，生产入库只进入库 */
    flow.inRecords.forEach((r, i) => {
      const rec = {
        ...r,
        unit: normUnit(r.unit),
        qty: normQty(r.qty, r.unit),
        // 供应商名称为空时回退到委外加工商
        supplier: r.supplier && r.supplier !== "-" ? r.supplier : r.provider,
     }
      if (r.workType.includes("送货")) {
        deliveries.push(buildDelivery(rec, batch, sku, i + 1))
     }
      stockIns.push({
        ...rec,
        batchNo: batch.batchNo,
        productionDate: batch.productionDate,
        expiryDate: batch.expiryDate,
        warehouse: batch.warehouse,
     })
   })

    /* 出库/领用分流：生产领用/耗用 → 领用记录；其余（调拨等）→ 出库记录 */
    flow.outRecords.forEach((r) => {
      const rec = {
        ...r,
        unit: normUnit(r.unit),
        qty: normQty(r.qty, r.unit),
        supplier:
          r.supplier && r.supplier !== "-"
            ? r.supplier
            : sku.defaultProvider || "-",
     }
      if (isProductionIssue(r)) {
        issues.push(buildIssue(rec, flow, batch))
     } else {
        stockOuts.push({
          ...rec,
          batchNo: batch.batchNo,
          expiryDate: batch.expiryDate,
          warehouse: batch.warehouse,
          deliveryNo: "-",
       })
     }
   })

    /* 生产去向：补品牌/生产日期/有效期至 */
    flow.outputs.forEach((o) => {
      const child = flows[`${o.code}|${o.batchNo}`]
      outputs.push({
        ...o,
        unit: normUnit(o.unit),
        qty: normQty(o.qty, o.unit),
        brand: child?.sku?.brand ?? "-",
        productionDate: o.date,
        expiryDate: child?.batch?.expiryDate ?? "-",
     })
   })

    flow.sales.forEach((s) => {
      sales.push({
        ...s,
        unit: normUnit(s.unit),
        qty: normQty(s.qty, s.unit),
     })
   })
 }

  /* 演示展示取前 12 条销售记录（真实订单数据量大，页面每节点控制在 10 条左右） */
  const cappedSales = sales.slice(0, 12)

  return {
    sku: normSku(sku),
    batches,
    deliveries,
    stockIns,
    stockOuts,
    issues,
    outputs,
    sales: cappedSales,
 }
}