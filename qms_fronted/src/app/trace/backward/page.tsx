"use client"

import React, { useState } from "react"
import {
  AlertTriangle,
  ChevronsDown,
  ChevronsUp,
  ClipboardList,
  Search,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RemoteCombobox } from "@/components/trace/remote-combobox"
import { createColumnHelper } from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { TracePath } from "@/components/trace/trace-path"
import { PageBody, PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/trace/trace-sections"
import {
  DcStockInSection,
  DcStockOutSection,
  FinishedFactoryInSection,
  FinishedFactoryOutSection,
  ProductionOutputSection,
  RawDeliverySection,
  RawFactoryInSection,
  RawFactoryOutSection,
  RawIssueSection,
  RetainSampleSection,
  SalesStockOutSection,
  SemiArticleFactoryInSection,
  SemiArticleFactoryOutSection,
  SemiArticleIssueSection,
} from "@/components/trace/forward-node-sections"
import { getReverseBatchStocks } from "@/lib/mock-backward-trace"
import {
  collectReverseMaterialSectionKeys,
  collectReverseProductSectionKeys,
  queryReverseMaterialNode,
  queryReverseProductNode,
  type ReverseMaterialNode,
  type ReverseProductNode,
} from "@/lib/reverse-trace-model"
import type { ProductionOutputRecord } from "@/lib/forward-trace-model"
import {
  getSpuSkus,
  searchSpusRemote,
  type SpuSku,
} from "@/lib/mock-spu"
import {
  useTraceSession,
  type BackwardTraceSession,
} from "@/lib/trace-session-store"

interface ProductBatchRow {
  productCode: string
  productName: string
  brand: string
  spec: string
  registrationName: string
  registrationNo: string
  batchNo: string
  expiryDate: string
}

function toColumns<TData>(cols: unknown): ColumnDef<TData, unknown>[] {
  return cols as ColumnDef<TData, unknown>[]
}

function dash(v: string | undefined): string {
  return v && v !== "" ? v : "-"
}

function collectProductBatchRows(
  skus: SpuSku[],
  skuFilter?: string | null,
): ProductBatchRow[] {
  return skus
    .filter((s) => !skuFilter || s.code === skuFilter)
    .flatMap((sku) => {
      const batches = getReverseBatchStocks(sku.code)
      if (batches.length === 0) {
        return [
          {
            productCode: sku.code,
            productName: sku.name,
            brand: dash(sku.brand),
            spec: dash(sku.spec),
            registrationName: dash(sku.registrationName),
            registrationNo: dash(sku.registrationNo),
            batchNo: "-",
            expiryDate: "-",
          },
        ]
      }
      return batches.map((b) => ({
        productCode: sku.code,
        productName: sku.name,
        brand: dash(sku.brand),
        spec: dash(sku.spec),
        registrationName: dash(sku.registrationName),
        registrationNo: dash(sku.registrationNo),
        batchNo: b.batchNo,
        expiryDate: dash(b.expiryDate),
      }))
    })
}

function ProductBatchSection({
  records,
  open,
  onToggle,
  onView,
}: {
  records: ProductBatchRow[]
  open: boolean
  onToggle: () => void
  onView: (row: ProductBatchRow) => void
}) {
  const helper = createColumnHelper<ProductBatchRow>()
  const columns = toColumns<ProductBatchRow>([
    helper.accessor("productCode", {
      header: "产品编码",
      meta: { title: "产品编码" },
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap font-mono text-xs">{getValue()}</span>
      ),
    }),
    helper.accessor("productName", {
      header: "产品名称",
      meta: { title: "产品名称" },
      cell: ({ getValue }) => (
        <span className="max-w-[220px] truncate">{getValue()}</span>
      ),
    }),
    helper.accessor("brand", {
      header: "品牌",
      meta: { title: "品牌" },
    }),
    helper.accessor("spec", {
      header: "规格",
      meta: { title: "规格" },
      cell: ({ getValue }) => (
        <span className="max-w-[220px] truncate">{getValue()}</span>
      ),
    }),
    helper.accessor("registrationName", {
      header: "注册备案名称",
      meta: { title: "注册备案名称" },
      cell: ({ getValue }) => (
        <span className="max-w-[220px] truncate">{getValue()}</span>
      ),
    }),
    helper.accessor("registrationNo", {
      header: "注册备案编号",
      meta: { title: "注册备案编号" },
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap font-mono text-xs">{getValue()}</span>
      ),
    }),
    helper.accessor("batchNo", {
      header: "批次编号",
      meta: { title: "批次编号" },
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap font-mono text-xs">{getValue()}</span>
      ),
    }),
    helper.accessor("expiryDate", {
      header: "有效期至",
      meta: { title: "有效期至" },
    }),
    helper.display({
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      meta: { title: "操作" },
      header: () => <div className="text-right">操作</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.batchNo === "-" ? (
            <span className="text-muted-foreground">-</span>
          ) : (
            <button
              type="button"
              onClick={() => onView(row.original)}
              className="whitespace-nowrap font-medium text-primary transition-colors hover:underline"
            >
              查看
            </button>
          )}
        </div>
      ),
    }),
  ])
  return (
    <SectionCard
      icon={<ClipboardList className="size-4 text-muted-foreground" />}
      title="产品批次信息"
      badge={<span>{records.length} 条</span>}
      open={open}
      onToggle={onToggle}
    >
      <DataTable
        columns={columns}
        data={records}
        searchPlaceholder="产品编码或名称"
        searchKeys={["productCode", "productName"]}
        extraSearchKey="batchNo"
        extraSearchPlaceholder="批次编号"
        sortable={false}
        tableClassName="min-w-[1440px]"
        storageKey="backward.product-batches"
      />
    </SectionCard>
  )
}

function ReverseProductBlock({
  node,
  openOf,
  toggle,
  onViewSource,
}: {
  node: ReverseProductNode
  openOf: (key: string) => boolean
  toggle: (key: string) => void
  onViewSource: (row: ProductionOutputRecord) => void
}) {
  const canView = node.sources.length > 0
  return (
    <section className="space-y-3">
      <FinishedFactoryInSection
        records={node.factoryIns}
        open={openOf("factory-in")}
        onToggle={() => toggle("factory-in")}
        storageKey="backward.product.factory-in"
      />
      <FinishedFactoryOutSection
        records={node.factoryOuts}
        open={openOf("factory-out")}
        onToggle={() => toggle("factory-out")}
        storageKey="backward.product.factory-out"
      />
      <DcStockInSection
        records={node.dcIns}
        open={openOf("dc-in")}
        onToggle={() => toggle("dc-in")}
        storageKey="backward.product.dc-in"
      />
      <SalesStockOutSection
        records={node.salesOuts}
        open={openOf("sales-out")}
        onToggle={() => toggle("sales-out")}
        storageKey="backward.product.sales-out"
      />
      <DcStockOutSection
        records={node.dcOuts}
        open={openOf("dc-out")}
        onToggle={() => toggle("dc-out")}
        storageKey="backward.product.dc-out"
      />
      <RetainSampleSection
        records={node.retains}
        open={openOf("retain")}
        onToggle={() => toggle("retain")}
        storageKey="backward.product.retain"
      />
      <ProductionOutputSection
        records={node.sources}
        open={openOf("source")}
        onToggle={() => toggle("source")}
        onNext={canView ? onViewSource : undefined}
        title="物料生产来源"
        storageKey="backward.product.source"
      />
    </section>
  )
}

function ReverseMaterialBlock({
  node,
  openOf,
  toggle,
  onViewSource,
}: {
  node: ReverseMaterialNode
  openOf: (key: string) => boolean
  toggle: (key: string) => void
  onViewSource: (row: ProductionOutputRecord) => void
}) {
  if (node.kind === "raw") {
    return (
      <section className="space-y-3">
        <RawDeliverySection
          records={node.deliveries}
          open={openOf("delivery")}
          onToggle={() => toggle("delivery")}
          storageKey="backward.raw.delivery"
        />
        <RawFactoryInSection
          records={node.factoryIns}
          open={openOf("factory-in")}
          onToggle={() => toggle("factory-in")}
          storageKey="backward.raw.factory-in"
        />
        <RawFactoryOutSection
          records={node.factoryOuts}
          open={openOf("factory-out")}
          onToggle={() => toggle("factory-out")}
          storageKey="backward.raw.factory-out"
        />
        <RawIssueSection
          records={node.issues}
          open={openOf("issue")}
          onToggle={() => toggle("issue")}
          storageKey="backward.raw.issue"
        />
        <RetainSampleSection
          records={node.retains}
          open={openOf("retain")}
          onToggle={() => toggle("retain")}
          storageKey="backward.raw.retain"
        />
      </section>
    )
  }
  const canView = node.sources.length > 0
  return (
    <section className="space-y-3">
      <SemiArticleFactoryInSection
        records={node.factoryIns}
        open={openOf("factory-in")}
        onToggle={() => toggle("factory-in")}
        storageKey="backward.semi.factory-in"
      />
      <SemiArticleFactoryOutSection
        records={node.factoryOuts}
        open={openOf("factory-out")}
        onToggle={() => toggle("factory-out")}
        storageKey="backward.semi.factory-out"
      />
      <SemiArticleIssueSection
        records={node.issues}
        open={openOf("issue")}
        onToggle={() => toggle("issue")}
        storageKey="backward.semi.issue"
      />
      <RetainSampleSection
        records={node.retains}
        open={openOf("retain")}
        onToggle={() => toggle("retain")}
        storageKey="backward.semi.retain"
      />
      <ProductionOutputSection
        records={node.sources}
        open={openOf("source")}
        onToggle={() => toggle("source")}
        onNext={canView ? onViewSource : undefined}
        title="物料生产来源"
        storageKey="backward.semi.source"
      />
    </section>
  )
}

export default function BackwardTracePage() {
  /* 查询/结果状态统一来自应用级会话存储，跨页签切换自动保留 */
  const { backward, setBackward } = useTraceSession()
  const {
    spuOptions,
    spuSearching,
    selectedSpuNo,
    path,
    productNode,
    materialNode,
    searched,
    error,
  } = backward

  /** 合并式写入会话（保持其余字段） */
  const patch = (p: Partial<BackwardTraceSession>) =>
    setBackward((prev) => ({ ...prev, ...p }))

  /* 节点一「产品批次信息」模块展开状态 */
  const [listingOpen, setListingOpen] = useState(true)

  /* 节点二 / 更深节点的分区展开状态 */
  const productSectionKeys = collectReverseProductSectionKeys()
  const materialSectionKeys = materialNode
    ? collectReverseMaterialSectionKeys(materialNode)
    : []
  const [nodeOpenMap, setNodeOpenMap] = useState<Record<string, boolean>>({})
  const nodeOpenOf = (k: string) => nodeOpenMap[k] ?? true
  const toggleNode = (k: string) =>
    setNodeOpenMap((m) => ({ ...m, [k]: !(m[k] ?? true) }))
  const expandKeys = productNode
    ? productSectionKeys
    : materialNode
      ? materialSectionKeys
      : []

  /* SPU 主数据远程搜索：基于 SPU 编码 / 名称模糊匹配 */
  async function handleSpuSearch(kw: string) {
    patch({ spuSearching: true })
    try {
      const res = await searchSpusRemote(kw)
      patch({
        spuOptions: res.map((s) => ({
          value: s.spuNo,
          label: s.name,
        })),
      })
    } catch {
      patch({ spuOptions: [] })
    } finally {
      patch({ spuSearching: false })
    }
  }

  /* 选中 SPU 后点「查询」：查询框仅保留 SPU，展开该 SPU 关联产品的批次分区列表；并清空旧的追溯节点与选择 */
  function handleSpuSelect(spuNo: string | null) {
    patch({
      selectedSpuNo: spuNo,
      selectedSkuCode: null,
      selectedBatch: null,
      batchKeyword: "",
      productNode: null,
      materialNode: null,
      path: [],
      searched: false,
      error: null,
    })
  }

  /** 点「查询」：进入节点一，列出该 SPU 关联产品的批次信息 */
  const handleSearch = () => {
    if (!selectedSpuNo) {
      patch({ error: "请先选择 SPU", searched: true })
      return
    }
    patch({
      error: null,
      materialNode: null,
      productNode: null,
      path: [{ code: selectedSpuNo }],
      searched: true,
    })
  }

  /** 从某个产品批次进入节点二 */
  const doQuery = (code: string, batchNo: string) => {
    const result = queryReverseProductNode(code, batchNo)
    if (!result) {
      patch({
        materialNode: null,
        productNode: null,
        path: selectedSpuNo ? [{ code: selectedSpuNo }] : [],
        error: `未查询到 成品 ${code} / 批次 ${batchNo} 的追溯数据`,
        searched: true,
      })
      return
    }
    patch({
      error: null,
      searched: true,
      materialNode: null,
      productNode: result,
      path: [
        ...(selectedSpuNo ? [{ code: selectedSpuNo }] : []),
        {
          code: result.sku.code,
          batchNo: result.batchNo,
          name: result.sku.name,
          category: result.sku.category,
        },
      ],
    })
  }

  const jumpTo = (index: number) => {
    const step = path[index]
    if (!step) return
    if (index === 0 || !step.batchNo) {
      backToListing()
      return
    }
    if (index === 1) {
      const product = queryReverseProductNode(step.code, step.batchNo)
      if (!product) {
        patch({ error: `未查询到 ${step.code} / ${step.batchNo} 的追溯数据` })
        return
      }
      patch({
        error: null,
        productNode: product,
        materialNode: null,
        path: path.slice(0, index + 1),
      })
      return
    }
    const result = queryReverseMaterialNode(step.code, step.batchNo)
    if (!result) {
      patch({ error: `未查询到 ${step.code} / ${step.batchNo} 的追溯数据` })
      return
    }
    patch({
      error: null,
      materialNode: result,
      productNode: null,
      path: path.slice(0, index + 1),
    })
  }

  const backToListing = () => {
    patch({
      materialNode: null,
      productNode: null,
      error: null,
      path: selectedSpuNo ? [{ code: selectedSpuNo }] : [],
    })
  }

  const handleViewSource = (row: ProductionOutputRecord) => {
    const result = queryReverseMaterialNode(row.materialCode, row.batchNo)
    if (!result) {
      patch({ error: `「${row.materialCode} / ${row.batchNo}」暂无更上层数据`, searched: true })
      return
    }
    patch({ error: null, materialNode: result, productNode: null })
    setBackward((prev) => ({
      ...prev,
      path: [
        ...prev.path,
        {
          code: result.sku.code,
          batchNo: result.batchNo,
          name: result.sku.name,
          category: result.sku.category,
        },
      ],
    }))
  }

  const showListing = Boolean(selectedSpuNo && !materialNode && !productNode && searched)
  const productBatchRows: ProductBatchRow[] = showListing
    ? collectProductBatchRows(getSpuSkus(selectedSpuNo!))
    : []

  const canQuery = Boolean(selectedSpuNo)

  return (
    <>
      <PageHeader title="逆向追溯" />
      <PageBody>
      {/* ===== 查询区：SPU（必选）→ 关联产品（可选，SPU 为空则不展示） ===== */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch()
        }}
        className="mt-6 flex flex-wrap items-center gap-2"
      >
        <div className="min-w-[300px] max-w-2xl flex-1">
          <RemoteCombobox
            placeholder="SPU编码或名称"
            searchPlaceholder="请输入"
            emptyText="暂无结果"
            options={spuOptions}
            value={selectedSpuNo}
            onSelect={handleSpuSelect}
            onSearch={handleSpuSearch}
            loading={spuSearching}
          />
        </div>
        <Button type="submit" disabled={!canQuery}>
          <Search />
          查询
        </Button>
        {/* 全部展开/收起：与查询按钮同一栏（同正向追溯）；按当前视图渲染对应按钮 */}
        {expandKeys.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const all = expandKeys.every((k) => nodeOpenOf(k))
              const next: Record<string, boolean> = {}
              expandKeys.forEach((k) => {
                next[k] = !all
              })
              setNodeOpenMap(next)
            }}
            className="gap-1.5 border-primary bg-white text-primary hover:bg-primary/5 hover:text-primary"
          >
            {expandKeys.every((k) => nodeOpenOf(k)) ? (
              <>
                <ChevronsUp className="size-4" />
                全部收起
              </>
            ) : (
              <>
                <ChevronsDown className="size-4" />
                全部展开
              </>
            )}
          </Button>
        )}
      </form>

      {searched && error && (
        <Alert variant="destructive" className="mb-4 mt-4">
          <AlertTriangle className="size-4" />
          <AlertTitle>查询失败</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ===== 节点一：SPU 关联产品批次信息 ===== */}
      {showListing && (
        <div className="mt-4 space-y-4">
          <TracePath
            direction="up"
            label="追溯路径"
            steps={path.length ? path : selectedSpuNo ? [{ code: selectedSpuNo }] : []}
            onJumpTo={jumpTo}
          />
          <ProductBatchSection
            records={productBatchRows}
            open={listingOpen}
            onToggle={() => setListingOpen((o) => !o)}
            onView={(row) => doQuery(row.productCode, row.batchNo)}
          />
        </div>
      )}

      {productNode && (
        <div className="mt-4 space-y-4">
          <TracePath
            direction="up"
            label="追溯路径"
            steps={path}
            onJumpTo={jumpTo}
          />
          <ReverseProductBlock
            node={productNode}
            openOf={nodeOpenOf}
            toggle={toggleNode}
            onViewSource={handleViewSource}
          />
        </div>
      )}

      {materialNode && (
        <div className="mt-4 space-y-4">
          <TracePath
            direction="up"
            label="追溯路径"
            steps={path}
            onJumpTo={jumpTo}
          />
          <ReverseMaterialBlock
            node={materialNode}
            openOf={nodeOpenOf}
            toggle={toggleNode}
            onViewSource={handleViewSource}
          />
        </div>
      )}

      </PageBody>
    </>
  )
}