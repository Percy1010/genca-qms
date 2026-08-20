/**
 * 逆向追溯页面模型。
 * 节点二对齐正向成品；节点三/四对齐正向半制品；节点五对齐正向原料/包材。
 * 「物料生产来源」来自逆向投料链，操作列为「查看」。
 */

import {
  queryForwardNode,
  type DcStockInRecord,
  type DcStockOutRecord,
  type FinishedFactoryInRecord,
  type FinishedFactoryOutRecord,
  type FinishedNode,
  type ProductionOutputRecord,
  type RawDeliveryRecord,
  type RawFactoryInRecord,
  type RawFactoryOutRecord,
  type RawIssueRecord,
  type RawNode,
  type RetainSampleRecord,
  type SalesStockOutRecord,
  type SemiArticleFactoryInRecord,
  type SemiArticleFactoryOutRecord,
  type SemiArticleIssueRecord,
  type SemiArticleNode,
  type SemiNode,
} from "@/lib/forward-trace-model"
import {
  getReverseBatchStocks,
  queryReverseTrace,
} from "@/lib/mock-backward-trace"
import { getMaterial, type SkuInfo } from "@/lib/mock-forward-trace"
import { findSpuSku } from "@/lib/mock-spu"

export interface ReverseProductNode {
  kind: "product"
  sku: SkuInfo
  batchNo: string
  factoryIns: FinishedFactoryInRecord[]
  factoryOuts: FinishedFactoryOutRecord[]
  dcIns: DcStockInRecord[]
  salesOuts: SalesStockOutRecord[]
  dcOuts: DcStockOutRecord[]
  retains: RetainSampleRecord[]
  sources: ProductionOutputRecord[]
}

export interface ReverseSemiArticleLayer {
  kind: "semiArticle"
  sku: SkuInfo
  batchNo: string
  factoryIns: SemiArticleFactoryInRecord[]
  factoryOuts: SemiArticleFactoryOutRecord[]
  issues: SemiArticleIssueRecord[]
  retains: RetainSampleRecord[]
  sources: ProductionOutputRecord[]
}

export interface ReverseRawLayer {
  kind: "raw"
  sku: SkuInfo
  batchNo: string
  deliveries: RawDeliveryRecord[]
  factoryIns: RawFactoryInRecord[]
  factoryOuts: RawFactoryOutRecord[]
  issues: RawIssueRecord[]
  retains: RetainSampleRecord[]
}

export type ReverseMaterialNode = ReverseSemiArticleLayer | ReverseRawLayer

function dash(v: string | undefined): string {
  return v && v !== "" ? v : "-"
}

function overlaySku(base?: Partial<SkuInfo> | null, code?: string): SkuInfo {
  const extra = code ? findSpuSku(code) : undefined
  const resolvedCode = extra?.code ?? base?.code ?? code ?? "-"
  return {
    code: resolvedCode,
    name: extra?.name ?? base?.name ?? resolvedCode,
    category: base?.category ?? (extra?.isFinished === false ? "半成品" : "成品裸支"),
    spec: extra?.spec ?? base?.spec ?? "-",
    unit: base?.unit ?? "PCS",
    validityDays: base?.validityDays ?? 0,
    purchaseFlag: base?.purchaseFlag ?? false,
    salesFlag: base?.salesFlag ?? true,
    isWip: base?.isWip ?? true,
    defaultProvider: base?.defaultProvider ?? "-",
    brand: extra?.brand ?? base?.brand,
    registrationNo: extra?.registrationNo ?? base?.registrationNo,
    productRegistrationName: extra?.registrationName ?? base?.productRegistrationName,
  }
}

function registrationName(sku: SkuInfo): string {
  return dash(sku.productRegistrationName) === "-" ? sku.name : dash(sku.productRegistrationName)
}

function applySku<T extends Record<string, unknown>>(
  sku: SkuInfo,
  rows: T[],
  extra: Partial<T> = {},
): T[] {
  return rows.map((r) => ({
    ...r,
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    ...("spec" in r ? { spec: sku.spec } : {}),
    ...("registrationName" in r
      ? {
          registrationName: registrationName(sku),
          registrationNo: dash(sku.registrationNo),
        }
      : {}),
    ...extra,
  }))
}

function withBatch<T extends { batchNo: string; expiryDate: string }>(
  rows: T[],
  batchNo: string,
  expiryDate: string,
): T[] {
  return rows.map((r) => ({
    ...r,
    batchNo,
    expiryDate: expiryDate === "-" ? r.expiryDate : expiryDate,
  }))
}

function mapSources(code: string, batchNo: string): ProductionOutputRecord[] {
  const reverse = queryReverseTrace(code, batchNo)
  if (!reverse) return []
  return reverse.upstream.map((u) => {
    const child = queryReverseTrace(u.code, u.batchNo)
    const material = getMaterial(u.code)?.material
    return {
      materialCode: u.code,
      materialName: u.name,
      materialType: u.category,
      brand: dash(material?.brand),
      batchNo: u.batchNo,
      expiryDate: dash(child?.inventory.expiryDate),
      qty: u.qty,
      unit: u.unit,
    }
  })
}

function syntheticRetain(sku: SkuInfo, batchNo: string, expiryDate: string, stockInNo = "-", unit = "PCS", date = "-", warehouse = "留样仓库"): RetainSampleRecord[] {
  return [
    {
      materialCode: sku.code,
      materialName: sku.name,
      materialType: sku.category,
      spec: sku.spec,
      batchNo,
      expiryDate,
      stockInNo,
      qty: 1,
      unit,
      date,
      warehouse: warehouse.includes("留样") ? warehouse : "留样仓库",
    },
  ]
}

function hasFinishedRows(node: FinishedNode): boolean {
  return (
    node.factoryIns.length +
      node.factoryOuts.length +
      node.dcIns.length +
      node.salesOuts.length +
      node.dcOuts.length +
      node.retains.length >
    0
  )
}

function fromFinished(
  sku: SkuInfo,
  batchNo: string,
  node: FinishedNode,
  expiryDate: string,
): ReverseProductNode {
  return {
    kind: "product",
    sku,
    batchNo,
    factoryIns: withBatch(applySku(sku, node.factoryIns), batchNo, expiryDate),
    factoryOuts: withBatch(applySku(sku, node.factoryOuts), batchNo, expiryDate),
    dcIns: withBatch(applySku(sku, node.dcIns), batchNo, expiryDate),
    salesOuts: withBatch(applySku(sku, node.salesOuts), batchNo, expiryDate),
    dcOuts: withBatch(applySku(sku, node.dcOuts), batchNo, expiryDate),
    retains: withBatch(applySku(sku, node.retains), batchNo, expiryDate),
    sources: mapSources(sku.code, batchNo),
  }
}

function syntheticProductIns(sku: SkuInfo, batchNo: string): FinishedFactoryInRecord[] {
  const reverse = queryReverseTrace(sku.code, batchNo)
  const stock =
    reverse?.inventory ??
    getReverseBatchStocks(sku.code).find((b) => b.batchNo === batchNo)
  const ins = reverse?.stockInRecords ?? []
  if (ins.length > 0) {
    return ins.map((r) => ({
      materialCode: sku.code,
      materialName: sku.name,
      materialType: sku.category,
      spec: sku.spec,
      registrationName: registrationName(sku),
      registrationNo: dash(sku.registrationNo),
      batchNo,
      expiryDate: dash(r.expiryDate ?? stock?.expiryDate),
      stockInNo: r.stockInNo,
      qty: r.qty,
      unit: r.unit,
      date: r.date,
      warehouse: dash(r.warehouse ?? stock?.warehouse),
      businessType: r.businessType,
      workType: r.workType,
      sourceOrder: dash(r.sourceOrder),
      provider: dash(r.provider),
      workOrder: dash(r.orderNo),
      subcontractNo: dash(r.sourceOrder),
    }))
  }
  if (!stock) return []
  return [
    {
      materialCode: sku.code,
      materialName: sku.name,
      materialType: sku.category,
      spec: sku.spec,
      registrationName: registrationName(sku),
      registrationNo: dash(sku.registrationNo),
      batchNo: stock.batchNo,
      expiryDate: dash(stock.expiryDate),
      stockInNo: "-",
      qty: stock.currentQty,
      unit: stock.unit,
      date: stock.productionDate,
      warehouse: dash(stock.warehouse),
      businessType: "生产入库",
      workType: "生产完工入库",
      sourceOrder: "-",
      provider: dash(sku.defaultProvider),
      workOrder: "-",
      subcontractNo: "-",
    },
  ]
}

function pickForward(code: string, batchNo: string) {
  const exact = queryForwardNode(code, [batchNo])
  if (exact) return exact
  return queryForwardNode(code)
}

function resolveContext(code: string, batchNo: string) {
  const reverse = queryReverseTrace(code, batchNo)
  const extra = findSpuSku(code)
  const stock =
    reverse?.inventory ??
    getReverseBatchStocks(code).find((b) => b.batchNo === batchNo)
  const forward = pickForward(code, batchNo)
  const sku = overlaySku(
    forward?.sku ?? reverse?.sku ?? getMaterial(code)?.material,
    extra?.code ?? code,
  )
  return {
    reverse,
    stock,
    forward,
    sku,
    expiryDate: dash(stock?.expiryDate),
  }
}

function fromSemi(
  sku: SkuInfo,
  batchNo: string,
  expiryDate: string,
  node: SemiNode | SemiArticleNode,
): ReverseSemiArticleLayer {
  const ins = "spec" in (node.factoryIns[0] ?? {})
    ? (node.factoryIns as SemiArticleFactoryInRecord[])
    : node.factoryIns.map((r) => ({ ...r, spec: sku.spec }))
  const outs = "spec" in (node.factoryOuts[0] ?? {})
    ? (node.factoryOuts as SemiArticleFactoryOutRecord[])
    : node.factoryOuts.map((r) => ({ ...r, spec: sku.spec }))
  const issues = "spec" in (node.issues[0] ?? {})
    ? (node.issues as SemiArticleIssueRecord[])
    : node.issues.map((r) => ({ ...r, spec: sku.spec }))
  return {
    kind: "semiArticle",
    sku,
    batchNo,
    factoryIns: withBatch(applySku(sku, ins), batchNo, expiryDate),
    factoryOuts: withBatch(applySku(sku, outs), batchNo, expiryDate),
    issues: withBatch(applySku(sku, issues), batchNo, expiryDate),
    retains: withBatch(applySku(sku, node.retains), batchNo, expiryDate),
    sources: mapSources(sku.code, batchNo),
  }
}

function fromRaw(
  sku: SkuInfo,
  batchNo: string,
  expiryDate: string,
  node: RawNode,
): ReverseRawLayer {
  return {
    kind: "raw",
    sku,
    batchNo,
    deliveries: withBatch(applySku(sku, node.deliveries), batchNo, expiryDate),
    factoryIns: withBatch(applySku(sku, node.factoryIns), batchNo, expiryDate),
    factoryOuts: withBatch(applySku(sku, node.factoryOuts), batchNo, expiryDate),
    issues: withBatch(applySku(sku, node.issues), batchNo, expiryDate),
    retains: withBatch(applySku(sku, node.retains), batchNo, expiryDate),
  }
}

function syntheticSemi(sku: SkuInfo, batchNo: string, expiryDate: string): ReverseSemiArticleLayer {
  const reverse = queryReverseTrace(sku.code, batchNo)
  const ins: SemiArticleFactoryInRecord[] = (reverse?.stockInRecords ?? []).map((r) => ({
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    spec: sku.spec,
    batchNo,
    expiryDate: dash(r.expiryDate ?? expiryDate),
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
  const first = ins[0]
  return {
    kind: "semiArticle",
    sku,
    batchNo,
    factoryIns: ins,
    factoryOuts: [],
    issues: [],
    retains: first
      ? syntheticRetain(sku, batchNo, first.expiryDate, first.stockInNo, first.unit, first.date, first.warehouse)
      : syntheticRetain(sku, batchNo, expiryDate),
    sources: mapSources(sku.code, batchNo),
  }
}

function syntheticRaw(sku: SkuInfo, batchNo: string, expiryDate: string): ReverseRawLayer {
  const reverse = queryReverseTrace(sku.code, batchNo)
  const ins: RawFactoryInRecord[] = (reverse?.stockInRecords ?? []).map((r) => ({
    materialCode: sku.code,
    materialName: sku.name,
    materialType: sku.category,
    batchNo,
    expiryDate: dash(r.expiryDate ?? expiryDate),
    stockInNo: r.stockInNo,
    qty: r.qty,
    unit: r.unit,
    date: r.date,
    warehouse: dash(r.warehouse),
    businessType: r.businessType,
    workType: r.workType,
    sourceOrder: dash(r.sourceOrder),
    supplierName: dash(r.supplier ?? r.provider),
  }))
  const first = ins[0]
  return {
    kind: "raw",
    sku,
    batchNo,
    deliveries: [],
    factoryIns: ins,
    factoryOuts: [],
    issues: [],
    retains: first
      ? syntheticRetain(sku, batchNo, first.expiryDate, first.stockInNo, first.unit, first.date, first.warehouse)
      : syntheticRetain(sku, batchNo, expiryDate),
  }
}

function isRawCategory(category: string): boolean {
  return category === "原料" || category === "包材"
}

/** 节点二：选中产品 + 批次后的出入库/留样/生产来源 */
export function queryReverseProductNode(
  code: string,
  batchNo: string,
): ReverseProductNode | null {
  if (!code.trim() || !batchNo.trim() || batchNo === "-") return null
  const { sku, expiryDate, forward } = resolveContext(code, batchNo)
  if (forward?.node.kind === "finished" && hasFinishedRows(forward.node)) {
    return fromFinished(sku, batchNo, forward.node, expiryDate)
  }
  const factoryIns = syntheticProductIns(sku, batchNo)
  const first = factoryIns[0]
  return {
    kind: "product",
    sku,
    batchNo,
    factoryIns,
    factoryOuts: [],
    dcIns: [],
    salesOuts: [],
    dcOuts: [],
    retains: first
      ? syntheticRetain(sku, batchNo, first.expiryDate, first.stockInNo, first.unit, first.date, first.warehouse)
      : [],
    sources: mapSources(sku.code, batchNo),
  }
}

/** 节点三/四（半制品口径）或节点五（原料/包材口径） */
export function queryReverseMaterialNode(
  code: string,
  batchNo: string,
): ReverseMaterialNode | null {
  if (!code.trim() || !batchNo.trim() || batchNo === "-") return null
  const { sku, expiryDate, forward } = resolveContext(code, batchNo)
  if (isRawCategory(sku.category) || forward?.node.kind === "raw") {
    if (forward?.node.kind === "raw") {
      return fromRaw(sku, batchNo, expiryDate, forward.node)
    }
    return syntheticRaw(sku, batchNo, expiryDate)
  }
  if (forward?.node.kind === "semi" || forward?.node.kind === "semiArticle") {
    return fromSemi(sku, batchNo, expiryDate, forward.node)
  }
  return syntheticSemi(sku, batchNo, expiryDate)
}

export function collectReverseProductSectionKeys(): string[] {
  return [
    "factory-in",
    "factory-out",
    "dc-in",
    "sales-out",
    "dc-out",
    "retain",
    "source",
  ]
}

export function collectReverseMaterialSectionKeys(node: ReverseMaterialNode): string[] {
  if (node.kind === "raw") {
    return ["delivery", "factory-in", "factory-out", "issue", "retain"]
  }
  return ["factory-in", "factory-out", "issue", "retain", "source"]
}
