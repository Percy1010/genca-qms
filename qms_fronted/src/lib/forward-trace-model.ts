/**
 * 正向追溯 · 四节点页面模型。
 *
 * 链路（按实际业务，不一定每次都走满 4 步）：
 *   原料 → 半成品 → 半制品 → 最终销售成品
 *   包材 → 半制品 / 成品
 *
 * 查询按节点逐层下钻：有生产去向才能进入下一节点；无下游产出即为终点。
 */

import {
  queryForwardTrace,
  type Category,
  type SkuInfo,
  type BatchStock,
  type DeliveryRecord,
  type StockInRecord,
  type StockOutRecord,
  type IssueRecord,
  type DownstreamProduct,
  type SalesRecord,
  type ForwardTraceResult,
} from "@/lib/mock-forward-trace"

export type ForwardNodeKind = "raw" | "semi" | "semiArticle" | "finished"

export interface ForwardPathStep {
  code: string
  name: string
  category: Category
  batchNo?: string
  nodeKind: ForwardNodeKind
}

export type CellValue = string | number
export type TraceRow = Record<string, CellValue>

/** 节点一 · 原料/包材 · 送货记录 */
export interface RawDeliveryRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  originPlace: string
  batchNo: string
  expiryDate: string
  deliveryNo: string
  deliveryDate: string
  deliveryQty: number
  orderNo: string
  orderQty: number
  unit: string
  price: number
  supplierCode: string
  supplierName: string
  contact: string
  contactEmail: string
  contactPhone: string
  supplierAddress: string
}

/** 节点一 · 工厂入库记录 */
export interface RawFactoryInRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  batchNo: string
  expiryDate: string
  stockInNo: string
  qty: number
  unit: string
  date: string
  warehouse: string
  businessType: string
  workType: string
  sourceOrder: string
  supplierName: string
}

/** 节点一 · 工厂出库记录 */
export interface RawFactoryOutRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  batchNo: string
  expiryDate: string
  stockOutNo: string
  qty: number
  unit: string
  date: string
  warehouse: string
  businessType: string
  workType: string
  sourceOrder: string
  deliveryNo: string
  supplierName: string
}

/** 节点一 · 工厂领料记录 */
export interface RawIssueRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  batchNo: string
  expiryDate: string
  issueNo: string
  warehouse: string
  qty: number
  unit: string
  provider: string
  productionDate: string
  workOrder: string
}

/** 留样记录（各节点字段一致） */
export interface RetainSampleRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  spec: string
  batchNo: string
  expiryDate: string
  stockInNo: string
  qty: number
  unit: string
  date: string
  warehouse: string
}

/** 生产去向（节点一/二/三） */
export interface ProductionOutputRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  brand: string
  batchNo: string
  expiryDate: string
  qty: number
  unit: string
}

/** 节点二 · 半成品 · 工厂入库 */
export interface SemiFactoryInRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  batchNo: string
  expiryDate: string
  stockInNo: string
  qty: number
  unit: string
  date: string
  warehouse: string
  businessType: string
  workType: string
  sourceOrder: string
  provider: string
  workOrder: string
  subcontractNo: string
}

/** 节点二 · 半成品 · 工厂出库 */
export interface SemiFactoryOutRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  batchNo: string
  expiryDate: string
  stockOutNo: string
  qty: number
  unit: string
  date: string
  warehouse: string
  businessType: string
  workType: string
  sourceOrder: string
  provider: string
  workOrder: string
  subcontractNo: string
}

/** 节点二 · 半成品 · 工厂领料 */
export interface SemiIssueRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  batchNo: string
  expiryDate: string
  issueNo: string
  warehouse: string
  qty: number
  unit: string
  productionDate: string
  provider: string
  workOrder: string
  subcontractNo: string
}

/** 节点三 · 半制品 · 工厂入库（比半成品多规格） */
export interface SemiArticleFactoryInRecord extends SemiFactoryInRecord {
  spec: string
}

export interface SemiArticleFactoryOutRecord extends SemiFactoryOutRecord {
  spec: string
}

export interface SemiArticleIssueRecord extends SemiIssueRecord {
  spec: string
}

/** 节点四 · 最终销售成品 · 工厂入库 */
export interface FinishedFactoryInRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  spec: string
  registrationName: string
  registrationNo: string
  batchNo: string
  expiryDate: string
  stockInNo: string
  qty: number
  unit: string
  date: string
  warehouse: string
  businessType: string
  workType: string
  sourceOrder: string
  provider: string
  workOrder: string
  subcontractNo: string
}

/** 节点四 · 工厂出库 */
export interface FinishedFactoryOutRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  spec: string
  registrationName: string
  registrationNo: string
  batchNo: string
  expiryDate: string
  stockOutNo: string
  qty: number
  unit: string
  date: string
  warehouse: string
  businessType: string
  workType: string
  sourceOrder: string
  provider: string
  workOrder: string
  subcontractNo: string
}

/** 节点四 · 大仓入库 */
export interface DcStockInRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  spec: string
  registrationName: string
  registrationNo: string
  batchNo: string
  expiryDate: string
  stockInNo: string
  qty: number
  unit: string
  date: string
  warehouse: string
  provider: string
  subcontractNo: string
}

/** 节点四 · 销售出库 */
export interface SalesStockOutRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  spec: string
  registrationName: string
  registrationNo: string
  batchNo: string
  expiryDate: string
  stockOutNo: string
  qty: number
  unit: string
  date: string
  warehouse: string
  originalOrderNo: string
  price: number
  buyerInfo: string
}

/** 节点四 · 销售退货 */
export interface SalesReturnRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  spec: string
  registrationName: string
  registrationNo: string
  batchNo: string
  expiryDate: string
  stockOutNo: string
  qty: number
  unit: string
  date: string
  warehouse: string
  remark: string
}

/** 节点四 · 大仓出库 */
export interface DcStockOutRecord extends TraceRow {
  materialCode: string
  materialName: string
  materialType: string
  spec: string
  registrationName: string
  registrationNo: string
  batchNo: string
  expiryDate: string
  stockOutNo: string
  qty: number
  unit: string
  date: string
  warehouse: string
  remark: string
}

export interface RawNode {
  kind: "raw"
  index: number
  title: "原料" | "包材"
  deliveries: RawDeliveryRecord[]
  factoryIns: RawFactoryInRecord[]
  factoryOuts: RawFactoryOutRecord[]
  issues: RawIssueRecord[]
  retains: RetainSampleRecord[]
  outputs: ProductionOutputRecord[]
}

export interface SemiNode {
  kind: "semi"
  index: number
  title: "半成品"
  factoryIns: SemiFactoryInRecord[]
  factoryOuts: SemiFactoryOutRecord[]
  issues: SemiIssueRecord[]
  retains: RetainSampleRecord[]
  outputs: ProductionOutputRecord[]
}

export interface SemiArticleNode {
  kind: "semiArticle"
  index: number
  title: "半制品"
  factoryIns: SemiArticleFactoryInRecord[]
  factoryOuts: SemiArticleFactoryOutRecord[]
  issues: SemiArticleIssueRecord[]
  retains: RetainSampleRecord[]
  outputs: ProductionOutputRecord[]
}

export interface FinishedNode {
  kind: "finished"
  index: number
  title: "最终销售成品"
  factoryIns: FinishedFactoryInRecord[]
  factoryOuts: FinishedFactoryOutRecord[]
  dcIns: DcStockInRecord[]
  salesOuts: SalesStockOutRecord[]
  salesReturns: SalesReturnRecord[]
  dcOuts: DcStockOutRecord[]
  retains: RetainSampleRecord[]
}

export type ForwardNode = RawNode | SemiNode | SemiArticleNode | FinishedNode

export interface ForwardChainResult {
  originCode: string
  originName: string
  originCategory: Category
  selectedBatches: string[]
  nodes: ForwardNode[]
}

export function nodeKindLabel(kind: ForwardNodeKind, category?: Category): string {
  if (kind === "raw") return category === "包材" ? "包材" : "原料"
  if (kind === "semi") return "半成品"
  if (kind === "semiArticle") return "半制品"
  return "最终销售成品"
}

/** 按物料类型 + 是否还有下游产出 决定该层节点种类 */
export function nodeKindFromCategory(
  category: Category,
  hasOutputs = false,
): ForwardNodeKind {
  if (category === "原料" || category === "包材") return "raw"
  if (category === "半成品") return "semi"
  if (category === "成品裸支" && hasOutputs) return "semiArticle"
  return "finished"
}

/** 该节点之后下一层的默认种类（无模拟数据时按业务骨架推断） */
export function nextNodeKind(
  kind: ForwardNodeKind,
  category?: Category,
): ForwardNodeKind | null {
  if (kind === "raw") return category === "包材" ? "semiArticle" : "semi"
  if (kind === "semi") return "semiArticle"
  if (kind === "semiArticle") return "finished"
  return null
}

export function createEmptyNode(
  kind: ForwardNodeKind,
  index: number,
  category?: Category,
): ForwardNode {
  if (kind === "raw") return emptyRaw(index, category === "包材" ? "包材" : "原料")
  if (kind === "semi") return emptySemi(index)
  if (kind === "semiArticle") return emptySemiArticle(index)
  return emptyFinished(index)
}

function emptyRaw(index: number, title: "原料" | "包材"): RawNode {
  return {
    kind: "raw",
    index,
    title,
    deliveries: [],
    factoryIns: [],
    factoryOuts: [],
    issues: [],
    retains: [],
    outputs: [],
  }
}

function emptySemi(index: number): SemiNode {
  return {
    kind: "semi",
    index,
    title: "半成品",
    factoryIns: [],
    factoryOuts: [],
    issues: [],
    retains: [],
    outputs: [],
  }
}

function emptySemiArticle(index: number): SemiArticleNode {
  return {
    kind: "semiArticle",
    index,
    title: "半制品",
    factoryIns: [],
    factoryOuts: [],
    issues: [],
    retains: [],
    outputs: [],
  }
}

function emptyFinished(index: number): FinishedNode {
  return {
    kind: "finished",
    index,
    title: "最终销售成品",
    factoryIns: [],
    factoryOuts: [],
    dcIns: [],
    salesOuts: [],
    salesReturns: [],
    dcOuts: [],
    retains: [],
  }
}

/**
 * 按起点物料类型决定展示哪些节点（结构骨架，记录暂空）：
 * - 原料：原料 → 半成品 → 半制品 → 成品
 * - 包材：包材 → 半制品 → 成品（第二节点可能是成品，后续按模拟数据裁剪）
 * - 半成品：半成品 → 半制品 → 成品
 * - 成品：仅最终销售成品
 */
export function buildEmptyForwardChain(
  category: Category,
): ForwardNode[] {
  if (category === "原料") {
    return [emptyRaw(1, "原料"), emptySemi(2), emptySemiArticle(3), emptyFinished(4)]
  }
  if (category === "包材") {
    return [emptyRaw(1, "包材"), emptySemiArticle(2), emptyFinished(3)]
  }
  if (category === "半成品") {
    return [emptySemi(1), emptySemiArticle(2), emptyFinished(3)]
  }
  return [emptyFinished(1)]
}

function dash(v: string | undefined): string {
  return v && v !== "-" ? v : "-"
}

function retainWarehouse(warehouse: string): string {
  return warehouse.includes("留样") ? warehouse : "留样仓库"
}

function mapRetain(
  sku: SkuInfo,
  ins: StockInRecord[],
  batches: BatchStock[],
): RetainSampleRecord[] {
  const batchMap = new Map(batches.map((b) => [b.batchNo, b]))
  return ins.slice(0, 1).map((r) => {
    const batch = batchMap.get(dash(r.batchNo))
    return {
      materialCode: sku.code,
      materialName: sku.name,
      materialType: sku.category,
      spec: sku.spec,
      batchNo: dash(r.batchNo),
      expiryDate: dash(r.expiryDate ?? batch?.expiryDate),
      stockInNo: r.stockInNo,
      qty: 1,
      unit: r.unit,
      date: r.date,
      warehouse: retainWarehouse(dash(r.warehouse ?? batch?.warehouse)),
    }
  })
}

function mapOutputs(rows: DownstreamProduct[]): ProductionOutputRecord[] {
  return rows.map((o) => ({
    materialCode: o.code,
    materialName: o.name,
    materialType: o.category,
    brand: dash(o.brand),
    batchNo: o.batchNo,
    expiryDate: dash(o.expiryDate),
    qty: o.qty,
    unit: o.unit,
  }))
}

function mapRawDeliveries(
  sku: SkuInfo,
  rows: DeliveryRecord[],
): RawDeliveryRecord[] {
  return rows.map((r) => ({
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    originPlace: r.supplierAddress?.split(" ")[0] || dash(r.supplierName),
    batchNo: r.batchNo,
    expiryDate: r.expiryDate,
    deliveryNo: r.deliveryNo,
    deliveryDate: r.deliveryDate,
    deliveryQty: r.deliveryQty,
    orderNo: r.orderNo,
    orderQty: r.orderQty,
    unit: r.unit,
    price: r.price,
    supplierCode: r.supplierCode,
    supplierName: r.supplierName,
    contact: r.contact,
    contactEmail: r.contactEmail,
    contactPhone: r.contactPhone,
    supplierAddress: r.supplierAddress,
  }))
}

function mapRawIns(sku: SkuInfo, rows: StockInRecord[]): RawFactoryInRecord[] {
  return rows.map((r) => ({
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    batchNo: dash(r.batchNo),
    expiryDate: dash(r.expiryDate),
    stockInNo: r.stockInNo,
    qty: r.qty,
    unit: r.unit,
    date: r.date,
    warehouse: dash(r.warehouse),
    businessType: r.businessType,
    workType: r.workType,
    sourceOrder: dash(r.sourceOrder),
    supplierName: dash(r.supplier),
  }))
}

function mapRawOuts(sku: SkuInfo, rows: StockOutRecord[]): RawFactoryOutRecord[] {
  return rows.map((r) => ({
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    batchNo: dash(r.batchNo),
    expiryDate: dash(r.expiryDate),
    stockOutNo: r.stockOutNo,
    qty: r.qty,
    unit: r.unit,
    date: r.date,
    warehouse: dash(r.warehouse),
    businessType: r.businessType,
    workType: r.workType,
    sourceOrder: dash(r.sourceOrder),
    deliveryNo: dash(r.deliveryNo),
    supplierName: dash(r.supplier),
  }))
}

function mapRawIssues(sku: SkuInfo, rows: IssueRecord[]): RawIssueRecord[] {
  return rows.map((r) => ({
    materialCode: r.materialCode || sku.code,
    materialName: r.materialName || sku.name,
    materialType: r.materialType || sku.category,
    batchNo: r.batchNo,
    expiryDate: r.expiryDate,
    issueNo: r.issueNo,
    warehouse: dash(r.warehouse),
    qty: r.issueQty,
    unit: r.unit,
    provider: dash(r.provider),
    productionDate: r.productionDate,
    workOrder: dash(r.workOrder),
  }))
}

function mapSemiIns(sku: SkuInfo, rows: StockInRecord[]): SemiFactoryInRecord[] {
  return rows.map((r) => ({
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    batchNo: dash(r.batchNo),
    expiryDate: dash(r.expiryDate),
    stockInNo: r.stockInNo,
    qty: r.qty,
    unit: r.unit,
    date: r.date,
    warehouse: dash(r.warehouse),
    businessType: r.businessType,
    workType: r.workType,
    sourceOrder: dash(r.sourceOrder),
    provider: dash(r.provider),
    workOrder: dash(r.orderNo),
    subcontractNo: dash(r.sourceOrder),
  }))
}

function mapSemiOuts(sku: SkuInfo, rows: StockOutRecord[]): SemiFactoryOutRecord[] {
  return rows.map((r) => ({
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    batchNo: dash(r.batchNo),
    expiryDate: dash(r.expiryDate),
    stockOutNo: r.stockOutNo,
    qty: r.qty,
    unit: r.unit,
    date: r.date,
    warehouse: dash(r.warehouse),
    businessType: r.businessType,
    workType: r.workType,
    sourceOrder: dash(r.sourceOrder),
    provider: dash(r.provider),
    workOrder: dash(r.orderNo),
    subcontractNo: dash(r.sourceOrder),
  }))
}

function mapSemiIssues(sku: SkuInfo, rows: IssueRecord[]): SemiIssueRecord[] {
  return rows.map((r) => ({
    materialCode: r.materialCode || sku.code,
    materialName: r.materialName || sku.name,
    materialType: r.materialType || sku.category,
    batchNo: r.batchNo,
    expiryDate: r.expiryDate,
    issueNo: r.issueNo,
    warehouse: dash(r.warehouse),
    qty: r.issueQty,
    unit: r.unit,
    productionDate: r.productionDate,
    provider: dash(r.provider),
    workOrder: dash(r.workOrder),
    subcontractNo: dash(r.workOrder),
  }))
}

function mapSemiArticleIns(
  sku: SkuInfo,
  rows: StockInRecord[],
): SemiArticleFactoryInRecord[] {
  return mapSemiIns(sku, rows).map((r) => ({ ...r, spec: sku.spec }))
}

function mapSemiArticleOuts(
  sku: SkuInfo,
  rows: StockOutRecord[],
): SemiArticleFactoryOutRecord[] {
  return mapSemiOuts(sku, rows).map((r) => ({ ...r, spec: sku.spec }))
}

function mapSemiArticleIssues(
  sku: SkuInfo,
  rows: IssueRecord[],
): SemiArticleIssueRecord[] {
  return mapSemiIssues(sku, rows).map((r) => ({ ...r, spec: sku.spec }))
}

function registrationName(sku: SkuInfo): string {
  return dash(sku.productRegistrationName) === "-" ? sku.name : dash(sku.productRegistrationName)
}

function mapFinishedIns(
  sku: SkuInfo,
  rows: StockInRecord[],
): FinishedFactoryInRecord[] {
  return rows.map((r) => ({
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    spec: sku.spec,
    registrationName: registrationName(sku),
    registrationNo: dash(sku.registrationNo),
    batchNo: dash(r.batchNo),
    expiryDate: dash(r.expiryDate),
    stockInNo: r.stockInNo,
    qty: r.qty,
    unit: r.unit,
    date: r.date,
    warehouse: dash(r.warehouse),
    businessType: r.businessType,
    workType: r.workType,
    sourceOrder: dash(r.sourceOrder),
    provider: dash(r.provider),
    workOrder: dash(r.orderNo),
    subcontractNo: dash(r.sourceOrder),
  }))
}

function mapFinishedOuts(
  sku: SkuInfo,
  rows: StockOutRecord[],
): FinishedFactoryOutRecord[] {
  return rows.map((r) => ({
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    spec: sku.spec,
    registrationName: registrationName(sku),
    registrationNo: dash(sku.registrationNo),
    batchNo: dash(r.batchNo),
    expiryDate: dash(r.expiryDate),
    stockOutNo: r.stockOutNo,
    qty: r.qty,
    unit: r.unit,
    date: r.date,
    warehouse: dash(r.warehouse),
    businessType: r.businessType,
    workType: r.workType,
    sourceOrder: dash(r.sourceOrder),
    provider: dash(r.provider),
    workOrder: dash(r.orderNo),
    subcontractNo: dash(r.sourceOrder),
  }))
}

function mapDcIns(sku: SkuInfo, rows: StockInRecord[]): DcStockInRecord[] {
  return rows.map((r) => ({
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    spec: sku.spec,
    registrationName: registrationName(sku),
    registrationNo: dash(sku.registrationNo),
    batchNo: dash(r.batchNo),
    expiryDate: dash(r.expiryDate),
    stockInNo: r.stockInNo,
    qty: r.qty,
    unit: r.unit,
    date: r.date,
    warehouse: dash(r.warehouse),
    provider: dash(r.provider),
    subcontractNo: dash(r.sourceOrder),
  }))
}

function mapSales(
  sku: SkuInfo,
  rows: SalesRecord[],
  batches: BatchStock[],
): SalesStockOutRecord[] {
  const first = batches[0]
  return rows.map((r, i) => ({
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    spec: sku.spec,
    registrationName: registrationName(sku),
    registrationNo: dash(sku.registrationNo),
    batchNo: first?.batchNo ?? "-",
    expiryDate: first?.expiryDate ?? "-",
    stockOutNo: `SO${r.date.replace(/-/g, "")}${String(i + 1).padStart(3, "0")}`,
    qty: r.qty,
    unit: r.unit,
    date: r.date,
    warehouse: first?.warehouse ?? "-",
    originalOrderNo: r.orderNo,
    price: r.price,
    buyerInfo: `${r.channel} / ${r.shopName} / ${r.customer}`,
  }))
}

function mapSalesReturns(
  sku: SkuInfo,
  rows: SalesRecord[],
  batches: BatchStock[],
): SalesReturnRecord[] {
  const first = batches[0]
  return rows.slice(0, Math.min(2, rows.length)).map((r, i) => {
    const returnDate = r.date.replace(
      /^(\d{4}-\d{2}-)(\d{2})$/,
      (_all, prefix: string, day: string) =>
        `${prefix}${String(Math.min(28, Number(day) + 3)).padStart(2, "0")}`,
    )
    return {
      materialCode: sku.code,
      materialName: sku.name,
      materialType: sku.category,
      spec: sku.spec,
      registrationName: registrationName(sku),
      registrationNo: dash(sku.registrationNo),
      batchNo: first?.batchNo ?? "-",
      expiryDate: first?.expiryDate ?? "-",
      stockOutNo: `SR${returnDate.replace(/-/g, "")}${String(i + 1).padStart(3, "0")}`,
      qty: r.qty,
      unit: r.unit,
      date: returnDate,
      warehouse: first?.warehouse ?? "品牌大仓",
      remark: `销售退货 / ${r.orderNo}`,
    }
  })
}

function mapDcOuts(
  sku: SkuInfo,
  rows: StockOutRecord[],
): DcStockOutRecord[] {
  return rows.map((r) => ({
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    spec: sku.spec,
    registrationName: registrationName(sku),
    registrationNo: dash(sku.registrationNo),
    batchNo: dash(r.batchNo),
    expiryDate: dash(r.expiryDate),
    stockOutNo: r.stockOutNo,
    qty: r.qty,
    unit: r.unit,
    date: r.date,
    warehouse: dash(r.warehouse),
    remark: r.docType || r.workType || "-",
  }))
}

function isFactoryIn(r: StockInRecord): boolean {
  return r.businessType.includes("生产") || r.workType.includes("生产") || r.workType.includes("组装")
}

function isFactoryOut(r: StockOutRecord): boolean {
  return r.businessType.includes("调拨") || r.workType.includes("调拨") || r.docType.includes("调拨")
}

function deriveDcInsFromFactoryOuts(
  sku: SkuInfo,
  rows: StockOutRecord[],
): DcStockInRecord[] {
  return rows.map((r) => ({
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    spec: sku.spec,
    registrationName: registrationName(sku),
    registrationNo: dash(sku.registrationNo),
    batchNo: dash(r.batchNo),
    expiryDate: dash(r.expiryDate),
    stockInNo: r.stockOutNo.replace(/^MCK|^PCK/, "MRK"),
    qty: r.qty,
    unit: r.unit,
    date: r.date,
    warehouse: "品牌大仓",
    provider: dash(r.provider),
    subcontractNo: dash(r.sourceOrder),
  }))
}

function buildNodeFromTrace(src: ForwardTraceResult, index: number): ForwardNode {
  const sku = src.sku
  const kind = nodeKindFromCategory(sku.category, src.outputs.length > 0)
  const retains = mapRetain(sku, src.stockIns, src.batches)
  if (kind === "raw") {
    return {
      kind: "raw",
      index,
      title: sku.category === "包材" ? "包材" : "原料",
      deliveries: mapRawDeliveries(sku, src.deliveries),
      factoryIns: mapRawIns(sku, src.stockIns),
      factoryOuts: mapRawOuts(sku, src.stockOuts),
      issues: mapRawIssues(sku, src.issues),
      retains,
      outputs: mapOutputs(src.outputs),
    }
  }
  if (kind === "semi") {
    return {
      kind: "semi",
      index,
      title: "半成品",
      factoryIns: mapSemiIns(sku, src.stockIns),
      factoryOuts: mapSemiOuts(sku, src.stockOuts),
      issues: mapSemiIssues(sku, src.issues),
      retains,
      outputs: mapOutputs(src.outputs),
    }
  }
  if (kind === "semiArticle") {
    return {
      kind: "semiArticle",
      index,
      title: "半制品",
      factoryIns: mapSemiArticleIns(sku, src.stockIns),
      factoryOuts: mapSemiArticleOuts(sku, src.stockOuts),
      issues: mapSemiArticleIssues(sku, src.issues),
      retains,
      outputs: mapOutputs(src.outputs),
    }
  }
  const factoryIns = src.stockIns.filter(isFactoryIn)
  const otherIns = src.stockIns.filter((r) => !isFactoryIn(r))
  const factoryOuts = src.stockOuts.filter(isFactoryOut)
  const otherOuts = src.stockOuts.filter((r) => !isFactoryOut(r))
  return {
    kind: "finished",
    index,
    title: "最终销售成品",
    factoryIns: mapFinishedIns(sku, factoryIns.length > 0 ? factoryIns : src.stockIns),
    factoryOuts: mapFinishedOuts(sku, factoryOuts),
    dcIns: mapDcIns(sku, otherIns).concat(deriveDcInsFromFactoryOuts(sku, factoryOuts)),
    salesOuts: mapSales(sku, src.sales, src.batches),
    salesReturns: mapSalesReturns(sku, src.sales, src.batches),
    dcOuts: mapDcOuts(sku, otherOuts),
    retains,
  }
}

/** 查询某一节点：按物料类型与是否还有下游产出决定模块，并用现有 mock 填充 */
export function queryForwardNode(
  code: string,
  batchNos: string[] = [],
): { sku: { code: string; name: string; category: Category }; node: ForwardNode } | null {
  const src = queryForwardTrace(code, batchNos)
  if (!src) return null
  return {
    sku: { code: src.sku.code, name: src.sku.name, category: src.sku.category },
    node: buildNodeFromTrace(src, 1),
  }
}

/** 收集当前节点模块 key，供「全部展开/收起」使用 */
export function collectForwardSectionKeys(node: ForwardNode): string[] {
  const p = `n${node.index}`
  if (node.kind === "raw") {
    return [
      `${p}-delivery`,
      `${p}-factory-in`,
      `${p}-factory-out`,
      `${p}-issue`,
      `${p}-retain`,
      `${p}-output`,
    ]
  }
  if (node.kind === "semi" || node.kind === "semiArticle") {
    return [
      `${p}-factory-in`,
      `${p}-factory-out`,
      `${p}-issue`,
      `${p}-retain`,
      `${p}-output`,
    ]
  }
  return [
    `${p}-factory-in`,
    `${p}-factory-out`,
    `${p}-dc-in`,
    `${p}-sales-out`,
    `${p}-sales-return`,
    `${p}-dc-out`,
    `${p}-retain`,
  ]
}
