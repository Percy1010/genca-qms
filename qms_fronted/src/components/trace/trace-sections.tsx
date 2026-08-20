"use client"

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import {
  Boxes,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileCheck2,
  Layers,
  PackageMinus,
  PackageSearch,
  Truck,
  Warehouse,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/data-table/data-table"
import { cn } from "@/lib/utils"
import type {
  BatchStock,
  Category,
  DeliveryRecord,
  DownstreamProduct,
  IssueRecord,
  SalesRecord,
  SkuInfo,
  StockInRecord,
  StockOutRecord,
} from "@/lib/mock-forward-trace"

/**
 * TanStack 8.21 下 `ColumnDef<TData, unknown>[]` 因 cell 对 TValue 逆变无法直接承接
 * columnHelper.accessor 返回的异构列定义，这里做一次显式拓宽。
 */
function toColumns<TData>(cols: unknown): ColumnDef<TData, unknown>[] {
  return cols as ColumnDef<TData, unknown>[]
}

/** 从仓库串（如 "u8-30009 原料仓"）提取仓库名称，去掉编码前缀；无前缀原样返回。 */
function warehouseName(raw: string): string {
  const m = /^([A-Za-z0-9][A-Za-z0-9_-]*)[\s-]+(.*)$/.exec(raw)
  return m ? m[2] : raw
}

/** 可折叠卡片：标题 + 条数徽标 + 收起/展开按钮；折叠后仅显示标题 */
export function SectionCard({
  icon,
  title,
  badge,
  contentClassName,
  children,
  open: openProp,
  onToggle,
}: {
  icon: React.ReactNode
  title: string
  badge?: React.ReactNode
  contentClassName?: string
  children: React.ReactNode
  open?: boolean
  onToggle?: () => void
}) {
  /* 受控模式下由父级统一管理展开状态；否则卡片自管理 */
  const [internalOpen, setInternalOpen] = useState(true)
  const controlled = openProp !== undefined && onToggle !== undefined
  const open = controlled ? openProp : internalOpen
  const handleToggle = controlled
    ? onToggle
    : () => setInternalOpen((o) => !o)
  return (
    <Card>
      <CardHeader className={cn(open ? "pb-3" : "pb-0")}>
        <button
          type="button"
          onClick={handleToggle}
          title={open ? "收起模块" : "展开模块"}
          className="flex w-full items-center gap-2 text-sm"
        >
          {icon}
          <span>{title}</span>
          {open ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
          {badge && (
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {badge}
            </span>
          )}
        </button>
      </CardHeader>
      {open && <CardContent className={contentClassName}>{children}</CardContent>}
    </Card>
  )
}

/** 物料类型的 Badge 配色 */
export const categoryBadge: Record<
  Category,
  "outline" | "secondary" | "default" | "destructive"
> = {
  原料: "outline",
  包材: "secondary",
  半成品: "default",
  成品裸支: "secondary",
  成品组合: "default",
}

/** SKU 基本信息卡片 */
export function SkuSection({
  sku,
  open,
  onToggle,
}: {
  sku: SkuInfo
  open?: boolean
  onToggle?: () => void
}) {
  return (
    <SectionCard
      icon={<PackageSearch className="size-4 text-muted-foreground" />}
      title="物料信息"
      open={open}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
        {[
          ["物料编码", sku.code],
          ["物料名称", sku.name],
          ["物料类型", sku.category],
          ["品牌", sku.brand ?? ""],
          ["单位", sku.unit],
          ["保质期", sku.validityDays ? `${sku.validityDays} 天` : ""],
          ["注册/备案号", sku.registrationNo ?? ""],
          ["产品备案名称", sku.productRegistrationName ?? ""],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-2"
          >
            <span className="shrink-0 text-muted-foreground">{label}</span>
            <span className="truncate text-right font-medium">{value}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

/** 批次库存卡片 */
export function InventorySection({
  inventory,
  open,
  onToggle,
}: {
  inventory: BatchStock
  open?: boolean
  onToggle?: () => void
}) {
  const inv = inventory
  const statusVariant =
    inv.status === "正常"
      ? "default"
      : inv.status === "待检"
        ? "secondary"
        : "destructive"
  return (
    <SectionCard
      icon={<Warehouse className="size-4 text-muted-foreground" />}
      title="批次库存"
      open={open}
      onToggle={onToggle}
    >
      <CardContent className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
        {[
          ["库存批次", inv.batchNo],
          ["仓库", inv.warehouse],
          ["当前库存", inv.currentQty.toLocaleString()],
          ["生产日期", inv.productionDate],
          ["有效期至", inv.expiryDate],
          ["库存状态", ""],
        ].map(([label, value]) =>
          label === "库存状态" ? (
            <div
              key={label}
              className="flex items-baseline justify-between gap-2"
            >
              <span className="text-muted-foreground">{label}</span>
              <Badge variant={statusVariant}>{inv.status}</Badge>
            </div>
          ) : (
            <div
              key={label}
              className="flex items-baseline justify-between gap-2"
            >
              <span className="shrink-0 text-muted-foreground">{label}</span>
              <span className="truncate text-right font-medium">{value}</span>
            </div>
          ),
        )}
      </CardContent>
    </SectionCard>
  )
}

const columnHelper = createColumnHelper<StockInRecord>()

const stockInColumns = [
  columnHelper.accessor("batchNo", {
    header: "批次编号",
    meta: { title: "批次编号" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">
        {getValue<string>()}
      </span>
    ),
  }),
  columnHelper.accessor("productionDate", {
    header: "生产日期",
    meta: { title: "生产日期" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  columnHelper.accessor("expiryDate", {
    header: "有效期至",
    meta: { title: "有效期至" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  columnHelper.accessor("stockInNo", {
    header: "入库单号",
    meta: { title: "入库单号" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">
        {getValue<string>()}
      </span>
    ),
  }),
  columnHelper.accessor("qty", {
    header: "入库数量",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">
        {(getValue<number>() ?? 0).toLocaleString()}
      </span>
    ),
    meta: { title: "入库数量" },
  }),
  columnHelper.accessor("unit", {
    header: "单位",
    meta: { title: "单位" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  columnHelper.accessor("date", {
    header: "入库日期",
    meta: { title: "入库日期" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  columnHelper.accessor("warehouse", {
    header: "入库仓库",
    meta: { title: "入库仓库" },
    cell: ({ getValue }) => (
      <span className="max-w-[180px] truncate">
        {getValue<string>() || "-"}
      </span>
    ),
  }),
  columnHelper.accessor("businessType", {
    header: "业务类型",
    meta: { title: "业务类型" },
    cell: ({ getValue }) => <span>{getValue<string>()}</span>,
  }),
  columnHelper.accessor("workType", {
    header: "作业类型",
    meta: { title: "作业类型" },
    cell: ({ getValue }) => <span>{getValue<string>()}</span>,
  }),
  columnHelper.accessor("sourceOrder", {
    header: "源单单号",
    meta: { title: "源单单号" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">
        {getValue<string>()}
      </span>
    ),
  }),
  columnHelper.accessor("supplier", {
    header: "供应商名称",
    meta: { title: "供应商名称" },
    cell: ({ getValue }) => (
      <span className="max-w-[200px] truncate">{getValue<string>() || "-"}</span>
    ),
  }),
]

/** 入库记录卡片（送货收货/生产入库）——支持分页 */
export function StockInSection({
  records,
  open,
  onToggle,
}: {
  records: StockInRecord[]
  open?: boolean
  onToggle?: () => void
}) {
  const facetOptions = (
    key: "businessType" | "workType" | "supplier",
  ) =>
    [
      ...new Set(
        records.map((r) => r[key]).filter((v): v is string => !!v),
      ),
    ].map((v) => ({ label: v, value: v }))
  return (
    <SectionCard
      icon={<FileCheck2 className="size-4 text-muted-foreground" />}
      title="入库记录"
      badge={<span>{records.length} 条</span>}
      open={open}
      onToggle={onToggle}
    >
      <DataTable
        storageKey="trace.stock-in"
        columns={toColumns<StockInRecord>(stockInColumns)}
        data={records}
        searchPlaceholder="入库单号"
        searchKey="stockInNo"
        sortable={false}
        filters={[
          {
            columnId: "businessType",
            title: "业务类型",
            options: facetOptions("businessType"),
          },
          {
            columnId: "workType",
            title: "作业类型",
            options: facetOptions("workType"),
          },
          {
            columnId: "supplier",
            title: "供应商名称",
            options: facetOptions("supplier"),
          },
        ]}
      />
    </SectionCard>
  )
}

/** 生产去向（下游）卡片——支持排序、筛选、分页、下钻 */
export function DownstreamSection({
  downstream,
  onDrill,
  open,
  onToggle,
}: {
  downstream: DownstreamProduct[]
  onDrill: (d: { code: string; batchNo: string }) => void
  open?: boolean
  onToggle?: () => void
}) {
  const [productQuery, setProductQuery] = useState("")
  const [batchQuery, setBatchQuery] = useState("")
  const filtered = useMemo(() => {
    const p = productQuery.trim()
    const b = batchQuery.trim()
    return downstream.filter((d) => {
      const okP =
        !p ||
        d.code.toUpperCase() === p.toUpperCase() ||
        d.name.toLowerCase().includes(p.toLowerCase())
      const okB = !b || d.batchNo.toLowerCase().includes(b.toLowerCase())
      return okP && okB
    })
  }, [downstream, productQuery, batchQuery])

  const downstreamHelper = createColumnHelper<DownstreamProduct>()
  const columns = [
    downstreamHelper.accessor("code", {
      header: "物料编码",
      meta: { title: "物料编码" },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs whitespace-nowrap">
          {getValue<string>()}
        </span>
      ),
    }),
    downstreamHelper.accessor("name", {
      header: "物料名称",
      meta: { title: "物料名称" },
      cell: ({ getValue }) => (
        <span className="max-w-[240px] truncate">
          {getValue<string>() || "-"}
        </span>
      ),
    }),
    downstreamHelper.accessor("category", {
      header: "物料类型",
      meta: { title: "物料类型" },
      cell: ({ getValue }) => <span>{getValue<string>()}</span>,
    }),
    downstreamHelper.accessor("brand", {
      header: "品牌",
      meta: { title: "品牌" },
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">{getValue<string>() || "-"}</span>
      ),
    }),
    downstreamHelper.accessor("batchNo", {
      header: "批次编号",
      meta: { title: "批次编号" },
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap font-mono text-xs">
          {getValue<string>()}
        </span>
      ),
    }),
    downstreamHelper.accessor("productionDate", {
      header: "生产日期",
      meta: { title: "生产日期" },
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">{getValue<string>() || "-"}</span>
      ),
    }),
    downstreamHelper.accessor("expiryDate", {
      header: "有效期至",
      meta: { title: "有效期至" },
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">{getValue<string>() || "-"}</span>
      ),
    }),
    downstreamHelper.accessor("qty", {
      header: "生产数量",
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">
          {(getValue<number>() ?? 0).toLocaleString()}
        </span>
      ),
      meta: { title: "生产数量" },
    }),
    downstreamHelper.accessor("unit", {
      header: "单位",
      meta: { title: "单位" },
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">{getValue<string>()}</span>
      ),
    }),
    downstreamHelper.display({
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      meta: { title: "操作" },
      header: () => <div className="text-right">操作</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <button
            type="button"
            onClick={() =>
              onDrill({
                code: row.original.code,
                batchNo: row.original.batchNo,
              })
            }
            className="font-medium text-primary whitespace-nowrap transition-colors hover:underline"
          >
            查看
          </button>
        </div>
      ),
    }),
  ]

  return (
    <SectionCard
      icon={<Layers className="size-4 text-muted-foreground" />}
      title="生产去向"
      badge={<span>{downstream.length} 条</span>}
      contentClassName="flex flex-col gap-0"
      open={open}
      onToggle={onToggle}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="产品编码或名称"
          value={productQuery}
          onChange={(event) => setProductQuery(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Input
          placeholder="批次编号"
          value={batchQuery}
          onChange={(event) => setBatchQuery(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
      </div>
      <DataTable
        storageKey="trace.downstream"
        columns={toColumns<DownstreamProduct>(columns)}
        data={filtered}
        hideSearch
        sortable={false}
      />
    </SectionCard>
  )
}

/* ==================== 批次信息列表（可点选批次；当前库存可点查看明细） ==================== */

export function BatchStocksSection({
  batches,
  activeBatchNo,
  onSelectBatch,
  open,
  onToggle,
}: {
  batches: BatchStock[]
  activeBatchNo?: string
  onSelectBatch: (batchNo: string) => void
  open?: boolean
  onToggle?: () => void
}) {
  const helper = createColumnHelper<BatchStock>()
  const [stockDetail, setStockDetail] = useState<BatchStock | null>(null)
  const columns = [
    helper.accessor("batchNo", {
      header: "批次编号",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-semibold whitespace-nowrap">
          {getValue<string>()}
        </span>
      ),
    }),
    helper.accessor("productionDate", {
      header: "生产日期",
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">{getValue<string>()}</span>
      ),
    }),
    helper.accessor("expiryDate", {
      header: "有效期至",
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">{getValue<string>()}</span>
      ),
    }),
    helper.accessor("currentQty", {
      header: "当前库存",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => setStockDetail(row.original)}
          title="查看库存明细"
          className="font-medium text-primary whitespace-nowrap transition-colors hover:underline"
        >
          {(row.original.currentQty ?? 0).toLocaleString()}
        </button>
      ),
    }),
    helper.display({
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      meta: { title: "操作" },
      header: () => <div className="text-right">操作</div>,
      cell: ({ row }) =>
        row.original.batchNo === activeBatchNo ? (
          <div className="text-right">
            <Badge variant="outline">当前批次</Badge>
          </div>
        ) : (
          <div className="text-right">
            <button
              type="button"
              onClick={() => onSelectBatch(row.original.batchNo)}
              title="查看该批次入库/出库与生产去向"
              className="font-medium text-primary whitespace-nowrap transition-colors hover:underline"
            >
              查看
            </button>
          </div>
        ),
    }),
  ]

  return (
    <>
      <SectionCard
        icon={<Boxes className="size-4 text-muted-foreground" />}
        title="批次信息"
        badge={<span>{batches.length} 条</span>}
        open={open}
        onToggle={onToggle}
      >
        <DataTable
        storageKey="trace.batch-stocks"
          columns={toColumns<BatchStock>(columns)}
          data={batches}
          searchPlaceholder="批次编号"
          searchKey="batchNo"
          sortable={false}
        />
      </SectionCard>

      <Dialog
        open={!!stockDetail}
        onOpenChange={(open) => {
          if (!open) setStockDetail(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>库存明细</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            {(stockDetail?.stockByWarehouse?.length
              ? stockDetail.stockByWarehouse
              : stockDetail
                ? [
                    {
                      warehouse: stockDetail.warehouse,
                      currentQty: stockDetail.currentQty,
                    },
                  ]
                : []
            ).map((stock, i) => (
              <div
                key={i}
                className="rounded-md border p-3"
              >
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium">
                    {warehouseName(stock.warehouse)}
                  </span>
                  <span className="tabular-nums">
                    {stock.currentQty.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ==================== 出库记录 ==================== */

const stockOutHelper = createColumnHelper<StockOutRecord>()

const stockOutColumns = [
  stockOutHelper.accessor("expiryDate", {
    header: "有效期至",
    meta: { title: "有效期至" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  stockOutHelper.accessor("stockOutNo", {
    header: "出库单号",
    meta: { title: "出库单号" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">{getValue<string>()}</span>
    ),
  }),
  stockOutHelper.accessor("qty", {
    header: "出库数量",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">
        {(getValue<number>() ?? 0).toLocaleString()}
      </span>
    ),
    meta: { title: "出库数量" },
  }),
  stockOutHelper.accessor("unit", {
    header: "单位",
    meta: { title: "单位" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  stockOutHelper.accessor("date", {
    header: "出库日期",
    meta: { title: "出库日期" },
    cell: ({ getValue }) => <span className="whitespace-nowrap">{getValue<string>()}</span>,
  }),
  stockOutHelper.accessor("warehouse", {
    header: "出库仓库",
    meta: { title: "出库仓库" },
    cell: ({ getValue }) => (
      <span className="max-w-[180px] truncate">
        {getValue<string>() || "-"}
      </span>
    ),
  }),
  stockOutHelper.accessor("businessType", {
    header: "业务类型",
    meta: { title: "业务类型" },
    cell: ({ getValue }) => <span>{getValue<string>()}</span>,
  }),
  stockOutHelper.accessor("workType", {
    header: "作业类型",
    meta: { title: "作业类型" },
    cell: ({ getValue }) => <span>{getValue<string>()}</span>,
  }),
  stockOutHelper.accessor("sourceOrder", {
    header: "源单单号",
    meta: { title: "源单单号" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">
        {getValue<string>()}
      </span>
    ),
  }),
  stockOutHelper.accessor("deliveryNo", {
    header: "送货单号",
    meta: { title: "送货单号" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">
        {getValue<string>() || "-"}
      </span>
    ),
  }),
  stockOutHelper.accessor("supplier", {
    header: "供应商名称",
    meta: { title: "供应商名称" },
    cell: ({ getValue }) => (
      <span className="max-w-[200px] truncate">{getValue<string>() || "-"}</span>
    ),
  }),
]

export function StockOutSection({
  records,
  open,
  onToggle,
}: {
  records: StockOutRecord[]
  open?: boolean
  onToggle?: () => void
}) {
  const facetOptions = (
    key: "businessType" | "workType" | "supplier",
  ) =>
    [
      ...new Set(
        records.map((r) => r[key]).filter((v): v is string => !!v),
      ),
    ].map((v) => ({ label: v, value: v }))
  return (
    <SectionCard
      icon={<PackageMinus className="size-4 text-muted-foreground" />}
      title="出库记录"
      badge={<span>{records.length} 条</span>}
      open={open}
      onToggle={onToggle}
    >
      <DataTable
        storageKey="trace.stock-out"
        columns={toColumns<StockOutRecord>(stockOutColumns)}
        data={records}
        searchPlaceholder="出库单号"
        searchKey="stockOutNo"
        sortable={false}
        filters={[
          {
            columnId: "businessType",
            title: "业务类型",
            options: facetOptions("businessType"),
          },
          {
            columnId: "workType",
            title: "作业类型",
            options: facetOptions("workType"),
          },
          {
            columnId: "supplier",
            title: "供应商名称",
            options: facetOptions("supplier"),
          },
        ]}
      />
    </SectionCard>
  )
}

/* ==================== 销售记录 ==================== */

const salesHelper = createColumnHelper<SalesRecord>()

const salesColumns = [
  salesHelper.accessor("orderNo", {
    header: "订单编号",
    meta: { title: "订单编号" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">{getValue<string>()}</span>
    ),
  }),
  salesHelper.accessor("channel", {
    header: "渠道",
    meta: { title: "渠道" },
    cell: ({ getValue }) => <Badge variant="outline">{getValue<string>()}</Badge>,
  }),
  salesHelper.accessor("shopName", {
    header: "店铺",
    meta: { title: "店铺" },
    cell: ({ getValue }) => (
      <span className="max-w-[160px] truncate">{getValue<string>() || "-"}</span>
    ),
  }),
  salesHelper.accessor("goodsName", {
    header: "平台货品",
    meta: { title: "平台货品" },
    cell: ({ getValue }) => (
      <span className="max-w-[260px] truncate">{getValue<string>()}</span>
    ),
  }),
  salesHelper.accessor("specName", {
    header: "规格",
    meta: { title: "规格" },
    cell: ({ getValue }) => (
      <span className="max-w-[200px] truncate">{getValue<string>() || "-"}</span>
    ),
  }),
  salesHelper.accessor("date", {
    header: "交易日期",
    meta: { title: "交易日期" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  salesHelper.accessor("qty", {
    header: "数量",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{(getValue<number>() ?? 0).toLocaleString()}</span>
    ),
    meta: { title: "数量" },
  }),
  salesHelper.accessor("price", {
    header: "单价",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{(getValue<number>() ?? 0).toLocaleString()}</span>
    ),
    meta: { title: "单价" },
  }),
  salesHelper.accessor("amount", {
    header: "金额",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{(getValue<number>() ?? 0).toLocaleString()}</span>
    ),
    meta: { title: "金额" },
  }),
  salesHelper.accessor("customer", {
    header: "客户地区",
    meta: { title: "客户地区" },
    cell: ({ getValue }) => (
      <span className="max-w-[200px] truncate">{getValue<string>()}</span>
    ),
  }),
]

export function SalesSection({
  records,
  open,
  onToggle,
}: {
  records: SalesRecord[]
  open?: boolean
  onToggle?: () => void
}) {
  const facetOptions = (
    key: "channel" | "shopName",
  ) =>
    [
      ...new Set(
        records.map((r) => r[key]).filter((v): v is string => !!v),
      ),
    ].map((v) => ({ label: v, value: v }))

  return (
    <SectionCard
      icon={<Layers className="size-4 text-muted-foreground" />}
      title="销售去向"
      badge={<span>{records.length} 条</span>}
      open={open}
      onToggle={onToggle}
    >
      <DataTable
        storageKey="trace.sales"
        columns={toColumns<SalesRecord>(salesColumns)}
        data={records}
        searchPlaceholder="订单编号"
        searchKey="orderNo"
        sortable={false}
        tableClassName="min-w-[1280px]"
        filters={[
          {
            columnId: "channel",
            title: "渠道",
            options: facetOptions("channel"),
          },
          {
            columnId: "shopName",
            title: "店铺",
            options: facetOptions("shopName"),
          },
        ]}
      />
    </SectionCard>
  )
}

/* ==================== 送货记录（供应商送货 → 收货入库） ==================== */

const deliveryHelper = createColumnHelper<DeliveryRecord>()

const deliveryColumns = [
  deliveryHelper.accessor("batchNo", {
    header: "批次编号",
    meta: { title: "批次编号" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">{getValue<string>()}</span>
    ),
  }),
  deliveryHelper.accessor("productionDate", {
    header: "生产日期",
    meta: { title: "生产日期" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  deliveryHelper.accessor("expiryDate", {
    header: "有效期至",
    meta: { title: "有效期至" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  deliveryHelper.accessor("deliveryNo", {
    header: "送货单号",
    meta: { title: "送货单号" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">{getValue<string>()}</span>
    ),
  }),
  deliveryHelper.accessor("deliveryDate", {
    header: "送货日期",
    meta: { title: "送货日期" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  deliveryHelper.accessor("deliveryQty", {
    header: "送货数量",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">
        {(getValue<number>() ?? 0).toLocaleString()}
      </span>
    ),
    meta: { title: "送货数量" },
  }),
  deliveryHelper.accessor("orderNo", {
    header: "订单编号",
    meta: { title: "订单编号" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">{getValue<string>()}</span>
    ),
  }),
  deliveryHelper.accessor("orderLineNo", {
    header: "订单行号",
    meta: { title: "订单行号" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">{getValue<string>()}</span>
    ),
  }),
  deliveryHelper.accessor("orderQty", {
    header: "订单数量",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">
        {(getValue<number>() ?? 0).toLocaleString()}
      </span>
    ),
    meta: { title: "订单数量" },
  }),
  deliveryHelper.accessor("unit", {
    header: "单位",
    meta: { title: "单位" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  deliveryHelper.accessor("price", {
    header: "单价",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">
        {(getValue<number>() ?? 0).toFixed(2)}
      </span>
    ),
    meta: { title: "单价" },
  }),
  deliveryHelper.accessor("supplierCode", {
    header: "供应商编码",
    meta: { title: "供应商编码" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">{getValue<string>()}</span>
    ),
  }),
  deliveryHelper.accessor("supplierName", {
    header: "供应商名称",
    meta: { title: "供应商名称" },
    cell: ({ getValue }) => (
      <span className="max-w-[200px] truncate">{getValue<string>() || "-"}</span>
    ),
  }),
  deliveryHelper.accessor("contact", {
    header: "联系人",
    meta: { title: "联系人" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>() || "-"}</span>
    ),
  }),
  deliveryHelper.accessor("contactEmail", {
    header: "联系邮箱",
    meta: { title: "联系邮箱" },
    cell: ({ getValue }) => (
      <span className="max-w-[180px] truncate">{getValue<string>() || "-"}</span>
    ),
  }),
  deliveryHelper.accessor("contactPhone", {
    header: "联系电话",
    meta: { title: "联系电话" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>() || "-"}</span>
    ),
  }),
  deliveryHelper.accessor("supplierAddress", {
    header: "供应商地址",
    meta: { title: "供应商地址" },
    cell: ({ getValue }) => (
      <span className="max-w-[220px] truncate">{getValue<string>() || "-"}</span>
    ),
  }),
]

/** 送货记录卡片（供应商送货 → 收货）——支持分页、列设置 */
export function DeliverySection({
  records,
  open,
  onToggle,
}: {
  records: DeliveryRecord[]
  open?: boolean
  onToggle?: () => void
}) {
  const facetOptions = (
    key: "supplierName" | "orderNo" | "deliveryNo",
  ) =>
    [
      ...new Set(
        records.map((r) => r[key]).filter((v): v is string => !!v),
      ),
    ].map((v) => ({ label: v, value: v }))
  return (
    <SectionCard
      icon={<Truck className="size-4 text-muted-foreground" />}
      title="送货记录"
      badge={<span>{records.length} 条</span>}
      open={open}
      onToggle={onToggle}
    >
      <DataTable
        storageKey="trace.delivery"
        columns={toColumns<DeliveryRecord>(deliveryColumns)}
        data={records}
        searchPlaceholder="送货单号"
        searchKey="deliveryNo"
        sortable={false}
        tableClassName="min-w-[1440px]"
        filters={[
          {
            columnId: "supplierName",
            title: "供应商",
            options: facetOptions("supplierName"),
          },
        ]}
      />
    </SectionCard>
  )
}

/* ==================== 领用记录（生产领用/耗用出库） ==================== */

const issueHelper = createColumnHelper<IssueRecord>()

const issueColumns = [
  issueHelper.accessor("materialCode", {
    header: "物料编码",
    meta: { title: "物料编码" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">{getValue<string>()}</span>
    ),
  }),
  issueHelper.accessor("materialName", {
    header: "物料名称",
    meta: { title: "物料名称" },
    cell: ({ getValue }) => (
      <span className="max-w-[240px] truncate">{getValue<string>() || "-"}</span>
    ),
  }),
  issueHelper.accessor("materialType", {
    header: "物料类型",
    meta: { title: "物料类型" },
    cell: ({ getValue }) => <span>{getValue<string>()}</span>,
  }),
  issueHelper.accessor("batchNo", {
    header: "批次编号",
    meta: { title: "批次编号" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">{getValue<string>()}</span>
    ),
  }),
  issueHelper.accessor("productionDate", {
    header: "生产日期",
    meta: { title: "生产日期" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  issueHelper.accessor("expiryDate", {
    header: "有效期至",
    meta: { title: "有效期至" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  issueHelper.accessor("issueNo", {
    header: "领用单号",
    meta: { title: "领用单号" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">{getValue<string>()}</span>
    ),
  }),
  issueHelper.accessor("issueQty", {
    header: "领用数量",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">
        {(getValue<number>() ?? 0).toLocaleString()}
      </span>
    ),
    meta: { title: "领用数量" },
  }),
  issueHelper.accessor("unit", {
    header: "单位",
    meta: { title: "单位" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  issueHelper.accessor("issueDate", {
    header: "领用日期",
    meta: { title: "领用日期" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap">{getValue<string>()}</span>
    ),
  }),
  issueHelper.accessor("provider", {
    header: "委外加工商",
    meta: { title: "委外加工商" },
    cell: ({ getValue }) => (
      <span className="max-w-[200px] truncate">{getValue<string>() || "-"}</span>
    ),
  }),
  issueHelper.accessor("workOrder", {
    header: "生产工单",
    meta: { title: "生产工单" },
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-xs">{getValue<string>()}</span>
    ),
  }),
]

/** 领用记录卡片（生产领用/耗用出库）——支持分页 */
export function IssueSection({
  records,
  open,
  onToggle,
}: {
  records: IssueRecord[]
  open?: boolean
  onToggle?: () => void
}) {
  const facetOptions = (
    key: "materialType" | "provider" | "batchNo",
  ) =>
    [
      ...new Set(
        records.map((r) => r[key]).filter((v): v is string => !!v),
      ),
    ].map((v) => ({ label: v, value: v }))
  return (
    <SectionCard
      icon={<ClipboardList className="size-4 text-muted-foreground" />}
      title="领用记录"
      badge={<span>{records.length} 条</span>}
      open={open}
      onToggle={onToggle}
    >
      <DataTable
        storageKey="trace.issue"
        columns={toColumns<IssueRecord>(issueColumns)}
        data={records}
        searchPlaceholder="领用单号"
        searchKey="issueNo"
        sortable={false}
        tableClassName="min-w-[1280px]"
        filters={[
          {
            columnId: "materialType",
            title: "物料类型",
            options: facetOptions("materialType"),
          },
          {
            columnId: "provider",
            title: "委外加工商",
            options: facetOptions("provider"),
          },
        ]}
      />
    </SectionCard>
  )
}
