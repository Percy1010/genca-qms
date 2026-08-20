"use client"

import type { ReactNode } from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import {
  ClipboardList,
  Archive,
  FileCheck2,
  Layers,
  PackageMinus,
  Truck,
} from "lucide-react"

import { DataTable } from "@/components/data-table/data-table"
import { SectionCard } from "@/components/trace/trace-sections"
import type {
  DcStockInRecord,
  DcStockOutRecord,
  FinishedFactoryInRecord,
  FinishedFactoryOutRecord,
  ProductionOutputRecord,
  RawDeliveryRecord,
  RawFactoryInRecord,
  RawFactoryOutRecord,
  RawIssueRecord,
  RetainSampleRecord,
  SalesReturnRecord,
  SalesStockOutRecord,
  SemiArticleFactoryInRecord,
  SemiArticleFactoryOutRecord,
  SemiArticleIssueRecord,
  SemiFactoryInRecord,
  SemiFactoryOutRecord,
  SemiIssueRecord,
  TraceRow,
} from "@/lib/forward-trace-model"

function toColumns<TData>(cols: unknown): ColumnDef<TData, unknown>[] {
  return cols as ColumnDef<TData, unknown>[]
}

function mono(value: unknown) {
  return (
    <span className="whitespace-nowrap font-mono text-xs">
      {value == null || value === "" ? "-" : String(value)}
    </span>
  )
}

function text(value: unknown, className = "whitespace-nowrap") {
  return (
    <span className={className}>
      {value == null || value === "" ? "-" : String(value)}
    </span>
  )
}

function qty(value: unknown) {
  const n = typeof value === "number" ? value : Number(value)
  return (
    <span className="whitespace-nowrap">
      {Number.isFinite(n) ? n.toLocaleString() : "-"}
    </span>
  )
}

function money(value: unknown) {
  const n = typeof value === "number" ? value : Number(value)
  return (
    <span className="whitespace-nowrap">
      {Number.isFinite(n) ? n.toFixed(2) : "-"}
    </span>
  )
}

function col<T extends TraceRow>(
  helper: ReturnType<typeof createColumnHelper<T>>,
  key: string,
  header: string,
  kind: "text" | "mono" | "qty" | "money" | "clip" = "text",
) {
  return helper.accessor((row) => row[key], {
    id: key,
    header,
    meta: { title: header },
    cell: ({ getValue }) => {
      const v = getValue()
      if (kind === "mono") return mono(v)
      if (kind === "qty") return qty(v)
      if (kind === "money") return money(v)
      if (kind === "clip") return text(v, "max-w-[220px] truncate")
      return text(v)
    },
  })
}

function facetOptions<T extends TraceRow>(records: T[], key: string) {
  return [
    ...new Set(
      records
        .map((r) => r[key])
        .filter((v): v is string => typeof v === "string" && !!v),
    ),
  ].map((v) => ({ label: v, value: v }))
}

function RecordTable<T extends TraceRow>({
  columns,
  data,
  searchPlaceholder,
  searchKey,
  filters = [],
  minWidth = "min-w-[1440px]",
  storageKey,
}: {
  columns: ColumnDef<T, unknown>[]
  data: T[]
  searchPlaceholder: string
  searchKey: string
  filters?: { columnId: string; title: string; options: { label: string; value: string }[] }[]
  minWidth?: string
  storageKey: string
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder={searchPlaceholder}
      searchKey={searchKey}
      sortable={false}
      tableClassName={minWidth}
      filters={filters}
      storageKey={storageKey}
    />
  )
}

/* ==================== 通用卡片包装 ==================== */

function ModuleCard({
  icon,
  title,
  count,
  open,
  onToggle,
  children,
}: {
  icon: ReactNode
  title: string
  count: number
  open?: boolean
  onToggle?: () => void
  children: React.ReactNode
}) {
  return (
    <SectionCard
      icon={icon}
      title={title}
      badge={<span>{count} 条</span>}
      open={open}
      onToggle={onToggle}
    >
      {children}
    </SectionCard>
  )
}

/* ==================== 节点一 · 原料/包材 ==================== */

const rawDeliveryHelper = createColumnHelper<RawDeliveryRecord>()
const rawDeliveryColumns = toColumns<RawDeliveryRecord>([
  col(rawDeliveryHelper, "materialCode", "物料编码", "mono"),
  col(rawDeliveryHelper, "materialName", "物料名称", "clip"),
  col(rawDeliveryHelper, "materialType", "物料类型"),
  col(rawDeliveryHelper, "originPlace", "产地", "clip"),
  col(rawDeliveryHelper, "batchNo", "批次编号", "mono"),
  col(rawDeliveryHelper, "expiryDate", "有效期至"),
  col(rawDeliveryHelper, "deliveryNo", "送货单号", "mono"),
  col(rawDeliveryHelper, "deliveryDate", "送货日期"),
  col(rawDeliveryHelper, "deliveryQty", "送货数量", "qty"),
  col(rawDeliveryHelper, "orderNo", "订单编号", "mono"),
  col(rawDeliveryHelper, "orderQty", "订单数量", "qty"),
  col(rawDeliveryHelper, "unit", "单位"),
  col(rawDeliveryHelper, "price", "单价", "money"),
  col(rawDeliveryHelper, "supplierCode", "供应商编码", "mono"),
  col(rawDeliveryHelper, "supplierName", "供应商名称", "clip"),
  col(rawDeliveryHelper, "contact", "联系人"),
  col(rawDeliveryHelper, "contactEmail", "联系邮箱", "clip"),
  col(rawDeliveryHelper, "contactPhone", "联系电话"),
  col(rawDeliveryHelper, "supplierAddress", "供应商地址", "clip"),
])

export function RawDeliverySection({
  records,
  open,
  onToggle,
  storageKey = "forward.raw.delivery",
}: {
  records: RawDeliveryRecord[]
  open?: boolean
  onToggle?: () => void
  storageKey?: string
}) {
  return (
    <ModuleCard
      icon={<Truck className="size-4 text-muted-foreground" />}
      title="物料送货记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey={storageKey}
        columns={rawDeliveryColumns}
        data={records}
        searchPlaceholder="送货单号"
        searchKey="deliveryNo"
        filters={[
          {
            columnId: "supplierName",
            title: "供应商",
            options: facetOptions(records, "supplierName"),
          },
        ]}
        minWidth="min-w-[1880px]"
      />
    </ModuleCard>
  )
}

const rawInHelper = createColumnHelper<RawFactoryInRecord>()
const rawInColumns = toColumns<RawFactoryInRecord>([
  col(rawInHelper, "materialCode", "物料编码", "mono"),
  col(rawInHelper, "materialName", "物料名称", "clip"),
  col(rawInHelper, "materialType", "物料类型"),
  col(rawInHelper, "batchNo", "批次编号", "mono"),
  col(rawInHelper, "expiryDate", "有效期至"),
  col(rawInHelper, "stockInNo", "入库单号", "mono"),
  col(rawInHelper, "qty", "入库数量", "qty"),
  col(rawInHelper, "unit", "单位"),
  col(rawInHelper, "date", "入库日期"),
  col(rawInHelper, "warehouse", "入库仓库", "clip"),
  col(rawInHelper, "businessType", "业务类型"),
  col(rawInHelper, "workType", "作业类型"),
  col(rawInHelper, "sourceOrder", "源单单号", "mono"),
  col(rawInHelper, "supplierName", "供应商名称", "clip"),
])

export function RawFactoryInSection({
  records,
  open,
  onToggle,
  storageKey = "forward.raw.factory-in",
}: {
  records: RawFactoryInRecord[]
  open?: boolean
  onToggle?: () => void
  storageKey?: string
}) {
  return (
    <ModuleCard
      icon={<FileCheck2 className="size-4 text-muted-foreground" />}
      title="工厂入库记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey={storageKey}
        columns={rawInColumns}
        data={records}
        searchPlaceholder="入库单号"
        searchKey="stockInNo"
        filters={[
          {
            columnId: "businessType",
            title: "业务类型",
            options: facetOptions(records, "businessType"),
          },
          {
            columnId: "workType",
            title: "作业类型",
            options: facetOptions(records, "workType"),
          },
        ]}
        minWidth="min-w-[1600px]"
      />
    </ModuleCard>
  )
}

const rawOutHelper = createColumnHelper<RawFactoryOutRecord>()
const rawOutColumns = toColumns<RawFactoryOutRecord>([
  col(rawOutHelper, "materialCode", "物料编码", "mono"),
  col(rawOutHelper, "materialName", "物料名称", "clip"),
  col(rawOutHelper, "materialType", "物料类型"),
  col(rawOutHelper, "batchNo", "批次编号", "mono"),
  col(rawOutHelper, "expiryDate", "有效期至"),
  col(rawOutHelper, "stockOutNo", "出库单号", "mono"),
  col(rawOutHelper, "qty", "出库数量", "qty"),
  col(rawOutHelper, "unit", "单位"),
  col(rawOutHelper, "date", "出库日期"),
  col(rawOutHelper, "warehouse", "出库仓库", "clip"),
  col(rawOutHelper, "businessType", "业务类型"),
  col(rawOutHelper, "workType", "作业类型"),
  col(rawOutHelper, "sourceOrder", "源单单号", "mono"),
  col(rawOutHelper, "deliveryNo", "送货单号", "mono"),
  col(rawOutHelper, "supplierName", "供应商名称", "clip"),
])

export function RawFactoryOutSection({
  records,
  open,
  onToggle,
  storageKey = "forward.raw.factory-out",
}: {
  records: RawFactoryOutRecord[]
  open?: boolean
  onToggle?: () => void
  storageKey?: string
}) {
  return (
    <ModuleCard
      icon={<PackageMinus className="size-4 text-muted-foreground" />}
      title="工厂出库记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey={storageKey}
        columns={rawOutColumns}
        data={records}
        searchPlaceholder="出库单号"
        searchKey="stockOutNo"
        filters={[
          {
            columnId: "businessType",
            title: "业务类型",
            options: facetOptions(records, "businessType"),
          },
          {
            columnId: "workType",
            title: "作业类型",
            options: facetOptions(records, "workType"),
          },
        ]}
        minWidth="min-w-[1680px]"
      />
    </ModuleCard>
  )
}

const rawIssueHelper = createColumnHelper<RawIssueRecord>()
const rawIssueColumns = toColumns<RawIssueRecord>([
  col(rawIssueHelper, "materialCode", "物料编码", "mono"),
  col(rawIssueHelper, "materialName", "物料名称", "clip"),
  col(rawIssueHelper, "materialType", "物料类型"),
  col(rawIssueHelper, "batchNo", "批次编号", "mono"),
  col(rawIssueHelper, "expiryDate", "有效期至"),
  col(rawIssueHelper, "issueNo", "生产领料单号", "mono"),
  col(rawIssueHelper, "warehouse", "领料仓库", "clip"),
  col(rawIssueHelper, "qty", "领料数量", "qty"),
  col(rawIssueHelper, "unit", "单位"),
  col(rawIssueHelper, "provider", "委外加工商", "clip"),
  col(rawIssueHelper, "productionDate", "生产日期"),
  col(rawIssueHelper, "workOrder", "生产工单", "mono"),
])

export function RawIssueSection({
  records,
  open,
  onToggle,
  storageKey = "forward.raw.issue",
}: {
  records: RawIssueRecord[]
  open?: boolean
  onToggle?: () => void
  storageKey?: string
}) {
  return (
    <ModuleCard
      icon={<ClipboardList className="size-4 text-muted-foreground" />}
      title="工厂领料记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey={storageKey}
        columns={rawIssueColumns}
        data={records}
        searchPlaceholder="生产领料单号"
        searchKey="issueNo"
        filters={[
          {
            columnId: "provider",
            title: "委外加工商",
            options: facetOptions(records, "provider"),
          },
        ]}
        minWidth="min-w-[1480px]"
      />
    </ModuleCard>
  )
}

/* ==================== 留样 / 生产去向 ==================== */

const retainHelper = createColumnHelper<RetainSampleRecord>()
const retainColumns = toColumns<RetainSampleRecord>([
  col(retainHelper, "materialCode", "物料编码", "mono"),
  col(retainHelper, "materialName", "物料名称", "clip"),
  col(retainHelper, "materialType", "物料类型"),
  col(retainHelper, "spec", "规格", "clip"),
  col(retainHelper, "batchNo", "批次编号", "mono"),
  col(retainHelper, "expiryDate", "有效期至"),
  col(retainHelper, "stockInNo", "入库单号", "mono"),
  col(retainHelper, "qty", "入库数量", "qty"),
  col(retainHelper, "unit", "单位"),
  col(retainHelper, "date", "入库日期"),
  col(retainHelper, "warehouse", "入库仓库", "clip"),
])

export function RetainSampleSection({
  records,
  open,
  onToggle,
  storageKey = "forward.retain-sample",
}: {
  records: RetainSampleRecord[]
  open?: boolean
  onToggle?: () => void
  storageKey?: string
}) {
  return (
    <ModuleCard
      icon={<Archive className="size-4 text-muted-foreground" />}
      title="物料留样记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey={storageKey}
        columns={retainColumns}
        data={records}
        searchPlaceholder="入库单号"
        searchKey="stockInNo"
        minWidth="min-w-[1360px]"
      />
    </ModuleCard>
  )
}

const outputHelper = createColumnHelper<ProductionOutputRecord>()

function buildOutputColumns(
  onNext?: (row: ProductionOutputRecord) => void,
) {
  const columns = [
    col(outputHelper, "materialCode", "物料编码", "mono"),
    col(outputHelper, "materialName", "物料名称", "clip"),
    col(outputHelper, "materialType", "物料类型"),
    col(outputHelper, "brand", "品牌"),
    col(outputHelper, "batchNo", "批次编号", "mono"),
    col(outputHelper, "expiryDate", "有效期至"),
    col(outputHelper, "unit", "单位"),
  ]
  if (!onNext) return toColumns<ProductionOutputRecord>(columns)
  return toColumns<ProductionOutputRecord>([
    ...columns,
    outputHelper.display({
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      meta: { title: "操作" },
      header: () => <div className="text-right">操作</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <button
            type="button"
            onClick={() => onNext(row.original)}
            className="font-medium text-primary whitespace-nowrap transition-colors hover:underline"
          >
            查看
          </button>
        </div>
      ),
    }),
  ])
}

export function ProductionOutputSection({
  records,
  open,
  onToggle,
  onNext,
  title = "物料生产去向",
  storageKey = "forward.production-output",
}: {
  records: ProductionOutputRecord[]
  open?: boolean
  onToggle?: () => void
  onNext?: (row: ProductionOutputRecord) => void
  title?: string
  storageKey?: string
}) {
  const columns = buildOutputColumns(onNext)
  return (
    <ModuleCard
      icon={<Layers className="size-4 text-muted-foreground" />}
      title={title}
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey={storageKey}
        columns={columns}
        data={records}
        searchPlaceholder="物料编码"
        searchKey="materialCode"
        filters={[
          {
            columnId: "materialType",
            title: "物料类型",
            options: facetOptions(records, "materialType"),
          },
        ]}
        minWidth="w-full"
      />
    </ModuleCard>
  )
}

/* ==================== 节点二 · 半成品 ==================== */

const semiInHelper = createColumnHelper<SemiFactoryInRecord>()
const semiInColumns = toColumns<SemiFactoryInRecord>([
  col(semiInHelper, "materialCode", "物料编码", "mono"),
  col(semiInHelper, "materialName", "物料名称", "clip"),
  col(semiInHelper, "materialType", "物料类型"),
  col(semiInHelper, "batchNo", "批次编号", "mono"),
  col(semiInHelper, "expiryDate", "有效期至"),
  col(semiInHelper, "stockInNo", "入库单号", "mono"),
  col(semiInHelper, "qty", "入库数量", "qty"),
  col(semiInHelper, "unit", "单位"),
  col(semiInHelper, "date", "入库日期"),
  col(semiInHelper, "warehouse", "入库仓库", "clip"),
  col(semiInHelper, "businessType", "业务类型"),
  col(semiInHelper, "workType", "作业类型"),
  col(semiInHelper, "sourceOrder", "源单单号", "mono"),
  col(semiInHelper, "provider", "委外加工商", "clip"),
  col(semiInHelper, "workOrder", "生产工单", "mono"),
  col(semiInHelper, "subcontractNo", "委外单号", "mono"),
])

export function SemiFactoryInSection({
  records,
  open,
  onToggle,
}: {
  records: SemiFactoryInRecord[]
  open?: boolean
  onToggle?: () => void
}) {
  return (
    <ModuleCard
      icon={<FileCheck2 className="size-4 text-muted-foreground" />}
      title="工厂入库记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey="forward.semi.factory-in"
        columns={semiInColumns}
        data={records}
        searchPlaceholder="入库单号"
        searchKey="stockInNo"
        filters={[
          {
            columnId: "businessType",
            title: "业务类型",
            options: facetOptions(records, "businessType"),
          },
          {
            columnId: "workType",
            title: "作业类型",
            options: facetOptions(records, "workType"),
          },
        ]}
        minWidth="min-w-[1760px]"
      />
    </ModuleCard>
  )
}

const semiOutHelper = createColumnHelper<SemiFactoryOutRecord>()
const semiOutColumns = toColumns<SemiFactoryOutRecord>([
  col(semiOutHelper, "materialCode", "物料编码", "mono"),
  col(semiOutHelper, "materialName", "物料名称", "clip"),
  col(semiOutHelper, "materialType", "物料类型"),
  col(semiOutHelper, "batchNo", "批次编号", "mono"),
  col(semiOutHelper, "expiryDate", "有效期至"),
  col(semiOutHelper, "stockOutNo", "出库单号", "mono"),
  col(semiOutHelper, "qty", "出库数量", "qty"),
  col(semiOutHelper, "unit", "单位"),
  col(semiOutHelper, "date", "出库日期"),
  col(semiOutHelper, "warehouse", "出库仓库", "clip"),
  col(semiOutHelper, "businessType", "业务类型"),
  col(semiOutHelper, "workType", "作业类型"),
  col(semiOutHelper, "sourceOrder", "源单单号", "mono"),
  col(semiOutHelper, "provider", "委外加工商", "clip"),
  col(semiOutHelper, "workOrder", "生产工单", "mono"),
  col(semiOutHelper, "subcontractNo", "委外单号", "mono"),
])

export function SemiFactoryOutSection({
  records,
  open,
  onToggle,
}: {
  records: SemiFactoryOutRecord[]
  open?: boolean
  onToggle?: () => void
}) {
  return (
    <ModuleCard
      icon={<PackageMinus className="size-4 text-muted-foreground" />}
      title="工厂出库记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey="forward.semi.factory-out"
        columns={semiOutColumns}
        data={records}
        searchPlaceholder="出库单号"
        searchKey="stockOutNo"
        filters={[
          {
            columnId: "businessType",
            title: "业务类型",
            options: facetOptions(records, "businessType"),
          },
          {
            columnId: "workType",
            title: "作业类型",
            options: facetOptions(records, "workType"),
          },
        ]}
        minWidth="min-w-[1760px]"
      />
    </ModuleCard>
  )
}

const semiIssueHelper = createColumnHelper<SemiIssueRecord>()
const semiIssueColumns = toColumns<SemiIssueRecord>([
  col(semiIssueHelper, "materialCode", "物料编码", "mono"),
  col(semiIssueHelper, "materialName", "物料名称", "clip"),
  col(semiIssueHelper, "materialType", "物料类型"),
  col(semiIssueHelper, "batchNo", "批次编号", "mono"),
  col(semiIssueHelper, "expiryDate", "有效期至"),
  col(semiIssueHelper, "issueNo", "生产领料单号", "mono"),
  col(semiIssueHelper, "warehouse", "领料仓库", "clip"),
  col(semiIssueHelper, "qty", "领料数量", "qty"),
  col(semiIssueHelper, "unit", "单位"),
  col(semiIssueHelper, "productionDate", "生产日期"),
  col(semiIssueHelper, "provider", "委外加工商", "clip"),
  col(semiIssueHelper, "workOrder", "生产工单", "mono"),
  col(semiIssueHelper, "subcontractNo", "委外单号", "mono"),
])

export function SemiIssueSection({
  records,
  open,
  onToggle,
}: {
  records: SemiIssueRecord[]
  open?: boolean
  onToggle?: () => void
}) {
  return (
    <ModuleCard
      icon={<ClipboardList className="size-4 text-muted-foreground" />}
      title="工厂领料记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey="forward.semi.issue"
        columns={semiIssueColumns}
        data={records}
        searchPlaceholder="生产领料单号"
        searchKey="issueNo"
        filters={[
          {
            columnId: "provider",
            title: "委外加工商",
            options: facetOptions(records, "provider"),
          },
        ]}
        minWidth="min-w-[1600px]"
      />
    </ModuleCard>
  )
}

/* ==================== 节点三 · 半制品（比半成品多规格） ==================== */

const semiArtInHelper = createColumnHelper<SemiArticleFactoryInRecord>()
const semiArtInColumns = toColumns<SemiArticleFactoryInRecord>([
  col(semiArtInHelper, "materialCode", "物料编码", "mono"),
  col(semiArtInHelper, "materialName", "物料名称", "clip"),
  col(semiArtInHelper, "materialType", "物料类型"),
  col(semiArtInHelper, "spec", "规格", "clip"),
  col(semiArtInHelper, "batchNo", "批次编号", "mono"),
  col(semiArtInHelper, "expiryDate", "有效期至"),
  col(semiArtInHelper, "stockInNo", "入库单号", "mono"),
  col(semiArtInHelper, "qty", "入库数量", "qty"),
  col(semiArtInHelper, "unit", "单位"),
  col(semiArtInHelper, "date", "入库日期"),
  col(semiArtInHelper, "warehouse", "入库仓库", "clip"),
  col(semiArtInHelper, "businessType", "业务类型"),
  col(semiArtInHelper, "workType", "作业类型"),
  col(semiArtInHelper, "sourceOrder", "源单单号", "mono"),
  col(semiArtInHelper, "provider", "委外加工商", "clip"),
  col(semiArtInHelper, "workOrder", "生产工单", "mono"),
  col(semiArtInHelper, "subcontractNo", "委外单号", "mono"),
])

export function SemiArticleFactoryInSection({
  records,
  open,
  onToggle,
  storageKey = "forward.semi-article.factory-in",
}: {
  records: SemiArticleFactoryInRecord[]
  open?: boolean
  onToggle?: () => void
  storageKey?: string
}) {
  return (
    <ModuleCard
      icon={<FileCheck2 className="size-4 text-muted-foreground" />}
      title="工厂入库记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey={storageKey}
        columns={semiArtInColumns}
        data={records}
        searchPlaceholder="入库单号"
        searchKey="stockInNo"
        filters={[
          {
            columnId: "businessType",
            title: "业务类型",
            options: facetOptions(records, "businessType"),
          },
          {
            columnId: "workType",
            title: "作业类型",
            options: facetOptions(records, "workType"),
          },
        ]}
        minWidth="min-w-[1840px]"
      />
    </ModuleCard>
  )
}

const semiArtOutHelper = createColumnHelper<SemiArticleFactoryOutRecord>()
const semiArtOutColumns = toColumns<SemiArticleFactoryOutRecord>([
  col(semiArtOutHelper, "materialCode", "物料编码", "mono"),
  col(semiArtOutHelper, "materialName", "物料名称", "clip"),
  col(semiArtOutHelper, "materialType", "物料类型"),
  col(semiArtOutHelper, "spec", "规格", "clip"),
  col(semiArtOutHelper, "batchNo", "批次编号", "mono"),
  col(semiArtOutHelper, "expiryDate", "有效期至"),
  col(semiArtOutHelper, "stockOutNo", "出库单号", "mono"),
  col(semiArtOutHelper, "qty", "出库数量", "qty"),
  col(semiArtOutHelper, "unit", "单位"),
  col(semiArtOutHelper, "date", "出库日期"),
  col(semiArtOutHelper, "warehouse", "出库仓库", "clip"),
  col(semiArtOutHelper, "businessType", "业务类型"),
  col(semiArtOutHelper, "workType", "作业类型"),
  col(semiArtOutHelper, "sourceOrder", "源单单号", "mono"),
  col(semiArtOutHelper, "provider", "委外加工商", "clip"),
  col(semiArtOutHelper, "workOrder", "生产工单", "mono"),
  col(semiArtOutHelper, "subcontractNo", "委外单号", "mono"),
])

export function SemiArticleFactoryOutSection({
  records,
  open,
  onToggle,
  storageKey = "forward.semi-article.factory-out",
}: {
  records: SemiArticleFactoryOutRecord[]
  open?: boolean
  onToggle?: () => void
  storageKey?: string
}) {
  return (
    <ModuleCard
      icon={<PackageMinus className="size-4 text-muted-foreground" />}
      title="工厂出库记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey={storageKey}
        columns={semiArtOutColumns}
        data={records}
        searchPlaceholder="出库单号"
        searchKey="stockOutNo"
        filters={[
          {
            columnId: "businessType",
            title: "业务类型",
            options: facetOptions(records, "businessType"),
          },
          {
            columnId: "workType",
            title: "作业类型",
            options: facetOptions(records, "workType"),
          },
        ]}
        minWidth="min-w-[1840px]"
      />
    </ModuleCard>
  )
}

const semiArtIssueHelper = createColumnHelper<SemiArticleIssueRecord>()
const semiArtIssueColumns = toColumns<SemiArticleIssueRecord>([
  col(semiArtIssueHelper, "materialCode", "物料编码", "mono"),
  col(semiArtIssueHelper, "materialName", "物料名称", "clip"),
  col(semiArtIssueHelper, "materialType", "物料类型"),
  col(semiArtIssueHelper, "spec", "规格", "clip"),
  col(semiArtIssueHelper, "batchNo", "批次编号", "mono"),
  col(semiArtIssueHelper, "expiryDate", "有效期至"),
  col(semiArtIssueHelper, "issueNo", "生产领料单号", "mono"),
  col(semiArtIssueHelper, "warehouse", "领料仓库", "clip"),
  col(semiArtIssueHelper, "qty", "领料数量", "qty"),
  col(semiArtIssueHelper, "unit", "单位"),
  col(semiArtIssueHelper, "productionDate", "生产日期"),
  col(semiArtIssueHelper, "provider", "委外加工商", "clip"),
  col(semiArtIssueHelper, "workOrder", "生产工单", "mono"),
  col(semiArtIssueHelper, "subcontractNo", "委外单号", "mono"),
])

export function SemiArticleIssueSection({
  records,
  open,
  onToggle,
  storageKey = "forward.semi-article.issue",
}: {
  records: SemiArticleIssueRecord[]
  open?: boolean
  onToggle?: () => void
  storageKey?: string
}) {
  return (
    <ModuleCard
      icon={<ClipboardList className="size-4 text-muted-foreground" />}
      title="工厂领料记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey={storageKey}
        columns={semiArtIssueColumns}
        data={records}
        searchPlaceholder="生产领料单号"
        searchKey="issueNo"
        filters={[
          {
            columnId: "provider",
            title: "委外加工商",
            options: facetOptions(records, "provider"),
          },
        ]}
        minWidth="min-w-[1680px]"
      />
    </ModuleCard>
  )
}

/* ==================== 节点四 · 最终销售成品 ==================== */

const finInHelper = createColumnHelper<FinishedFactoryInRecord>()
const finInColumns = toColumns<FinishedFactoryInRecord>([
  col(finInHelper, "materialCode", "物料编码", "mono"),
  col(finInHelper, "materialName", "物料名称", "clip"),
  col(finInHelper, "materialType", "物料类型"),
  col(finInHelper, "spec", "规格", "clip"),
  col(finInHelper, "registrationName", "注册备案名称", "clip"),
  col(finInHelper, "registrationNo", "注册备案编号", "mono"),
  col(finInHelper, "batchNo", "批次编号", "mono"),
  col(finInHelper, "expiryDate", "有效期至"),
  col(finInHelper, "stockInNo", "入库单号", "mono"),
  col(finInHelper, "qty", "入库数量", "qty"),
  col(finInHelper, "unit", "单位"),
  col(finInHelper, "date", "入库日期"),
  col(finInHelper, "warehouse", "入库仓库", "clip"),
  col(finInHelper, "businessType", "业务类型"),
  col(finInHelper, "workType", "作业类型"),
  col(finInHelper, "sourceOrder", "源单单号", "mono"),
  col(finInHelper, "provider", "委外加工商", "clip"),
  col(finInHelper, "workOrder", "生产工单", "mono"),
  col(finInHelper, "subcontractNo", "委外单号", "mono"),
])

export function FinishedFactoryInSection({
  records,
  open,
  onToggle,
  storageKey = "forward.finished.factory-in",
}: {
  records: FinishedFactoryInRecord[]
  open?: boolean
  onToggle?: () => void
  storageKey?: string
}) {
  return (
    <ModuleCard
      icon={<FileCheck2 className="size-4 text-muted-foreground" />}
      title="工厂入库记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey={storageKey}
        columns={finInColumns}
        data={records}
        searchPlaceholder="入库单号"
        searchKey="stockInNo"
        filters={[
          {
            columnId: "businessType",
            title: "业务类型",
            options: facetOptions(records, "businessType"),
          },
          {
            columnId: "workType",
            title: "作业类型",
            options: facetOptions(records, "workType"),
          },
        ]}
        minWidth="min-w-[2080px]"
      />
    </ModuleCard>
  )
}

const finOutHelper = createColumnHelper<FinishedFactoryOutRecord>()
const finOutColumns = toColumns<FinishedFactoryOutRecord>([
  col(finOutHelper, "materialCode", "物料编码", "mono"),
  col(finOutHelper, "materialName", "物料名称", "clip"),
  col(finOutHelper, "materialType", "物料类型"),
  col(finOutHelper, "spec", "规格", "clip"),
  col(finOutHelper, "registrationName", "注册备案名称", "clip"),
  col(finOutHelper, "registrationNo", "注册备案编号", "mono"),
  col(finOutHelper, "batchNo", "批次编号", "mono"),
  col(finOutHelper, "expiryDate", "有效期至"),
  col(finOutHelper, "stockOutNo", "出库单号", "mono"),
  col(finOutHelper, "qty", "出库数量", "qty"),
  col(finOutHelper, "unit", "单位"),
  col(finOutHelper, "date", "出库日期"),
  col(finOutHelper, "warehouse", "出库仓库", "clip"),
  col(finOutHelper, "businessType", "业务类型"),
  col(finOutHelper, "workType", "作业类型"),
  col(finOutHelper, "sourceOrder", "源单单号", "mono"),
  col(finOutHelper, "provider", "委外加工商", "clip"),
  col(finOutHelper, "workOrder", "生产工单", "mono"),
  col(finOutHelper, "subcontractNo", "委外单号", "mono"),
])

export function FinishedFactoryOutSection({
  records,
  open,
  onToggle,
  storageKey = "forward.finished.factory-out",
}: {
  records: FinishedFactoryOutRecord[]
  open?: boolean
  onToggle?: () => void
  storageKey?: string
}) {
  return (
    <ModuleCard
      icon={<PackageMinus className="size-4 text-muted-foreground" />}
      title="工厂出库记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey={storageKey}
        columns={finOutColumns}
        data={records}
        searchPlaceholder="出库单号"
        searchKey="stockOutNo"
        filters={[
          {
            columnId: "businessType",
            title: "业务类型",
            options: facetOptions(records, "businessType"),
          },
          {
            columnId: "workType",
            title: "作业类型",
            options: facetOptions(records, "workType"),
          },
        ]}
        minWidth="min-w-[2080px]"
      />
    </ModuleCard>
  )
}

const dcInHelper = createColumnHelper<DcStockInRecord>()
const dcInColumns = toColumns<DcStockInRecord>([
  col(dcInHelper, "materialCode", "物料编码", "mono"),
  col(dcInHelper, "materialName", "物料名称", "clip"),
  col(dcInHelper, "materialType", "物料类型"),
  col(dcInHelper, "spec", "规格", "clip"),
  col(dcInHelper, "registrationName", "注册备案名称", "clip"),
  col(dcInHelper, "registrationNo", "注册备案编号", "mono"),
  col(dcInHelper, "batchNo", "批次编号", "mono"),
  col(dcInHelper, "expiryDate", "有效期至"),
  col(dcInHelper, "stockInNo", "入库单号", "mono"),
  col(dcInHelper, "qty", "入库数量", "qty"),
  col(dcInHelper, "unit", "单位"),
  col(dcInHelper, "date", "入库日期"),
  col(dcInHelper, "warehouse", "入库仓库", "clip"),
  col(dcInHelper, "provider", "委外加工商", "clip"),
  col(dcInHelper, "subcontractNo", "委外单号", "mono"),
])

export function DcStockInSection({
  records,
  open,
  onToggle,
  storageKey = "forward.dc.stock-in",
}: {
  records: DcStockInRecord[]
  open?: boolean
  onToggle?: () => void
  storageKey?: string
}) {
  return (
    <ModuleCard
      icon={<FileCheck2 className="size-4 text-muted-foreground" />}
      title="大仓入库记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey={storageKey}
        columns={dcInColumns}
        data={records}
        searchPlaceholder="入库单号"
        searchKey="stockInNo"
        minWidth="min-w-[1760px]"
      />
    </ModuleCard>
  )
}

const salesOutHelper = createColumnHelper<SalesStockOutRecord>()
const salesOutColumns = toColumns<SalesStockOutRecord>([
  col(salesOutHelper, "materialCode", "物料编码", "mono"),
  col(salesOutHelper, "materialName", "物料名称", "clip"),
  col(salesOutHelper, "materialType", "物料类型"),
  col(salesOutHelper, "spec", "规格", "clip"),
  col(salesOutHelper, "registrationName", "注册备案名称", "clip"),
  col(salesOutHelper, "registrationNo", "注册备案编号", "mono"),
  col(salesOutHelper, "batchNo", "批次编号", "mono"),
  col(salesOutHelper, "expiryDate", "有效期至"),
  col(salesOutHelper, "stockOutNo", "出库单号", "mono"),
  col(salesOutHelper, "qty", "出库数量", "qty"),
  col(salesOutHelper, "unit", "单位"),
  col(salesOutHelper, "date", "出库日期"),
  col(salesOutHelper, "warehouse", "出库仓库", "clip"),
  col(salesOutHelper, "originalOrderNo", "原始单号", "mono"),
  col(salesOutHelper, "price", "单价", "money"),
  col(salesOutHelper, "buyerInfo", "购买用户信息", "clip"),
])

export function SalesStockOutSection({
  records,
  open,
  onToggle,
  storageKey = "forward.sales.stock-out",
}: {
  records: SalesStockOutRecord[]
  open?: boolean
  onToggle?: () => void
  storageKey?: string
}) {
  return (
    <ModuleCard
      icon={<PackageMinus className="size-4 text-muted-foreground" />}
      title="销售出库记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey={storageKey}
        columns={salesOutColumns}
        data={records}
        searchPlaceholder="出库单号"
        searchKey="stockOutNo"
        minWidth="min-w-[1880px]"
      />
    </ModuleCard>
  )
}

const salesReturnHelper = createColumnHelper<SalesReturnRecord>()
const salesReturnColumns = toColumns<SalesReturnRecord>([
  col(salesReturnHelper, "materialCode", "物料编码", "mono"),
  col(salesReturnHelper, "materialName", "物料名称", "clip"),
  col(salesReturnHelper, "materialType", "物料类型"),
  col(salesReturnHelper, "spec", "规格", "clip"),
  col(salesReturnHelper, "registrationName", "注册备案名称", "clip"),
  col(salesReturnHelper, "registrationNo", "注册备案编号", "mono"),
  col(salesReturnHelper, "batchNo", "批次编号", "mono"),
  col(salesReturnHelper, "expiryDate", "有效期至"),
  col(salesReturnHelper, "stockOutNo", "出库单号", "mono"),
  col(salesReturnHelper, "qty", "出库数量", "qty"),
  col(salesReturnHelper, "unit", "单位"),
  col(salesReturnHelper, "date", "出库日期"),
  col(salesReturnHelper, "warehouse", "出库仓库", "clip"),
  col(salesReturnHelper, "remark", "出库备注", "clip"),
])

export function SalesReturnSection({
  records,
  open,
  onToggle,
}: {
  records: SalesReturnRecord[]
  open?: boolean
  onToggle?: () => void
}) {
  return (
    <ModuleCard
      icon={<PackageMinus className="size-4 text-muted-foreground" />}
      title="销售退货记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey="forward.sales.return"
        columns={salesReturnColumns}
        data={records}
        searchPlaceholder="出库单号"
        searchKey="stockOutNo"
        minWidth="min-w-[1760px]"
      />
    </ModuleCard>
  )
}

const dcOutHelper = createColumnHelper<DcStockOutRecord>()
const dcOutColumns = toColumns<DcStockOutRecord>([
  col(dcOutHelper, "materialCode", "物料编码", "mono"),
  col(dcOutHelper, "materialName", "物料名称", "clip"),
  col(dcOutHelper, "materialType", "物料类型"),
  col(dcOutHelper, "spec", "规格", "clip"),
  col(dcOutHelper, "registrationName", "注册备案名称", "clip"),
  col(dcOutHelper, "registrationNo", "注册备案编号", "mono"),
  col(dcOutHelper, "batchNo", "批次编号", "mono"),
  col(dcOutHelper, "expiryDate", "有效期至"),
  col(dcOutHelper, "stockOutNo", "出库单号", "mono"),
  col(dcOutHelper, "qty", "出库数量", "qty"),
  col(dcOutHelper, "unit", "单位"),
  col(dcOutHelper, "date", "出库日期"),
  col(dcOutHelper, "warehouse", "出库仓库", "clip"),
  col(dcOutHelper, "remark", "出库备注", "clip"),
])

export function DcStockOutSection({
  records,
  open,
  onToggle,
  storageKey = "forward.dc.stock-out",
}: {
  records: DcStockOutRecord[]
  open?: boolean
  onToggle?: () => void
  storageKey?: string
}) {
  return (
    <ModuleCard
      icon={<PackageMinus className="size-4 text-muted-foreground" />}
      title="大仓出库记录"
      count={records.length}
      open={open}
      onToggle={onToggle}
    >
      <RecordTable
        storageKey={storageKey}
        columns={dcOutColumns}
        data={records}
        searchPlaceholder="出库单号"
        searchKey="stockOutNo"
        minWidth="min-w-[1760px]"
      />
    </ModuleCard>
  )
}
