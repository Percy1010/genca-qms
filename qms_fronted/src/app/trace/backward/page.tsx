"use client"

import React, { useState } from "react"
import {
  AlertTriangle,
  ArrowUpWideNarrow,
  Boxes,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  Layers,
  PackageSearch,
  Search,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RemoteCombobox, type ComboboxOption } from "@/components/trace/remote-combobox"
import { createColumnHelper } from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { TracePath } from "@/components/trace/trace-path"
import { PageBody, PageHeader } from "@/components/page-header"
import {
  InventorySection,
  categoryBadge,
  SectionCard,
  SkuSection,
  StockInSection,
} from "@/components/trace/trace-sections"
import {
  getReverseBatchStocks,
  isReverseLeaf,
  queryReverseTrace,
  type ReverseNode,
  type UpstreamMaterial,
} from "@/lib/mock-backward-trace"
import {
  getSpuSkus,
  searchSpusRemote,
  type SpuSku,
} from "@/lib/mock-spu"
import type { BatchStock } from "@/lib/mock-forward-trace"
import {
  useTraceSession,
  type BackwardTraceSession,
} from "@/lib/trace-session-store"

function UpstreamSection({
  node,
  onDrillUp,
  open,
  onToggle,
}: {
  node: ReverseNode
  onDrillUp: (u: UpstreamMaterial) => void
  open?: boolean
  onToggle?: () => void
}) {
  const upstream = node.upstream
  const leaf = isReverseLeaf(node)

  return (
    <SectionCard
      icon={<Layers className="size-4 text-muted-foreground" />}
      title="上游用料（来源）"
      badge={
        leaf
          ? "已追溯到采购来源"
          : `共 ${upstream.length} 个用料批次，点击查看其更上游`
      }
      open={open}
      onToggle={onToggle}
      contentClassName="overflow-x-auto"
    >
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead>上游物料</TableHead>
              <TableHead>物料类型</TableHead>
              <TableHead>物料批次</TableHead>
              <TableHead>用量 / 配方占比</TableHead>
              <TableHead>生产订单</TableHead>
              <TableHead>供应商 / 工厂</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {upstream.map((u, i) => (
              <TableRow key={`${u.code}-${u.batchNo}-${i}`}>
                <TableCell className="max-w-[220px]">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-semibold">{u.code}</span>
                    <span className="truncate text-xs text-muted-foreground">{u.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={categoryBadge[u.category]}>{u.category}</Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs">
                  {u.batchNo}
                </TableCell>
                <TableCell className="whitespace-nowrap">{u.usageRatio}</TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                  {u.orderNo}
                </TableCell>
                <TableCell className="max-w-[140px] truncate">{u.provider}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDrillUp(u)}
                  >
                    查看上一层
                    <ArrowUpWideNarrow />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {upstream.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  该批次为采购来源，无更上游生产记录
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
    </SectionCard>
  )
}

/** 一个 SPU 关联的某个 SKU 及其批次库存（用于 SPU 查询结果分组展示） */
interface SpuSkuSection {
  sku: SpuSku
  batches: BatchStock[]
}

function toColumns<TData>(cols: unknown): ColumnDef<TData, unknown>[] {
  return cols as ColumnDef<TData, unknown>[]
}

/** 以 SKU 维度分区的可折叠卡片：批次编号搜索 + 批次库存列表（无「批次信息」二级标题） */
function SpuSkuCard({
  section,
  open,
  onToggle,
  onSelectBatch,
}: {
  section: SpuSkuSection
  open: boolean
  onToggle: () => void
  onSelectBatch: (code: string, batchNo: string) => void
}) {
  const { sku, batches } = section
  const columnHelper = createColumnHelper<BatchStock>()
  const batchColumns = [
    columnHelper.accessor("batchNo", {
      header: "批次编号",
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap font-mono text-xs font-semibold">
          {getValue<string>()}
        </span>
      ),
    }),
    columnHelper.accessor("productionDate", {
      header: "生产日期",
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">{getValue<string>()}</span>
      ),
    }),
    columnHelper.accessor("expiryDate", {
      header: "有效期至",
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">{getValue<string>()}</span>
      ),
    }),
    columnHelper.accessor("warehouse", {
      header: "仓库",
      cell: ({ getValue }) => (
        <span className="block whitespace-normal break-words leading-snug">
          {getValue<string>()}
        </span>
      ),
    }),
    columnHelper.accessor("currentQty", {
      header: "当前库存",
      cell: ({ getValue }) => (getValue<number>() ?? 0).toLocaleString(),
    }),
    columnHelper.display({
      id: "actions",
      enableHiding: false,
      enableSorting: false,
      meta: { title: "操作" },
      header: () => <div className="text-right">操作</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <button
            type="button"
            onClick={() => onSelectBatch(sku.code, row.original.batchNo)}
            title="查看该批次的来源链"
            className="whitespace-nowrap font-medium text-primary transition-colors hover:underline"
          >
            查看
          </button>
        </div>
      ),
    }),
  ]
  return (
    <Card>
      <CardHeader className={cn(open ? "pb-3" : "pb-0")}>
        <button
          type="button"
          onClick={onToggle}
          title={open ? "收起模块" : "展开模块"}
          className="flex w-full items-center gap-2 text-left text-sm"
        >
          <Boxes className="size-4 shrink-0 text-muted-foreground" />
          <span className="shrink-0 font-mono text-xs font-semibold">{sku.code}</span>
          <span className="min-w-0 flex-1 truncate">{sku.name}</span>
          <span className="ml-auto shrink-0 text-xs font-normal text-muted-foreground">
            {batches.length} 个批次
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open ? "rotate-180" : "",
            )}
          />
        </button>
      </CardHeader>
      {open &&
        (batches.length ? (
          <CardContent>
            <DataTable
              columns={toColumns<BatchStock>(batchColumns)}
              data={batches}
              searchPlaceholder="批次编号"
              searchKey="batchNo"
              sortable={false}
              storageKey="backward.sku-batches"
            />
          </CardContent>
        ) : (
          <CardContent>
            <div className="rounded-lg border border-dashed px-3 py-5 text-center text-sm text-muted-foreground">
              该SKU暂无批次信息
            </div>
          </CardContent>
        ))}
    </Card>
  )
}

export default function BackwardTracePage() {
  /* 查询/结果状态统一来自应用级会话存储，跨页签切换自动保留 */
  const { backward, setBackward } = useTraceSession()
  const {
    spuOptions,
    spuSearching,
    selectedSpuNo,
    skuOptions,
    selectedSkuCode,
    selectedBatch,
    batchKeyword,
    path,
    node,
    searched,
    error,
  } = backward

  /** 合并式写入会话（保持其余字段） */
  const patch = (p: Partial<BackwardTraceSession>) =>
    setBackward((prev) => ({ ...prev, ...p }))

  /* SKU 分区卡片展开状态的统一控制（默认全部展开） */
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})
  const openOf = (code: string) => openMap[code] ?? true
  const toggleOpen = (code: string) =>
    setOpenMap((m) => ({ ...m, [code]: !(m[code] ?? true) }))

  /* 逆向节点视图分区展开状态的统一控制 */
  const nodeSectionKeys = ["sku", "inventory", "stockin", "upstream"]
  const [nodeOpenMap, setNodeOpenMap] = useState<Record<string, boolean>>({})
  const nodeOpenOf = (k: string) => nodeOpenMap[k] ?? true
  const toggleNode = (k: string) =>
    setNodeOpenMap((m) => ({ ...m, [k]: !(m[k] ?? true) }))

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

  /* 在所选 SPU 的关联 SKU 内做本地过滤 */
  function listSpuSkuOptions(spuNo: string, kw: string): ComboboxOption[] {
    const q = kw.trim().toLowerCase()
    const skus = getSpuSkus(spuNo)
    const filtered: SpuSku[] = q
      ? skus.filter(
          (s) =>
            s.code.toLowerCase().includes(q) ||
            s.spec.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q),
        )
      : skus
    return filtered.map((s) => ({
      value: s.code,
      label: "",
    }))
  }

  function handleSkuSearch(kw: string) {
    if (!selectedSpuNo) {
      patch({ skuOptions: [] })
      return
    }
    patch({ skuOptions: listSpuSkuOptions(selectedSpuNo, kw) })
  }

  /* 选中 SKU → 其批次来自该 SKU 的逆向链数据 */
  function handleSkuSelect(code: string | null) {
    patch({
      selectedSkuCode: code,
      selectedBatch: null,
      batchKeyword: "",
    })
  }

  /* 选中 SPU → 列出其关联 SKU，并清空 SKU/批次选择 */
  function handleSpuSelect(spuNo: string | null) {
    patch({
      selectedSpuNo: spuNo,
      skuOptions: spuNo ? listSpuSkuOptions(spuNo, "") : [],
      selectedSkuCode: null,
      selectedBatch: null,
      batchKeyword: "",
      node: null,
      path: [],
      searched: false,
      error: null,
    })
  }

  /** 选择 SPU 后点「查询」：按 SKU 维度分区展示该 SPU 关联的 SKU 及各自批次库存 */
  const handleSearch = () => {
    if (!selectedSpuNo) {
      patch({ error: "请先选择 SPU", searched: true })
      return
    }
    // 已选 SKU + 批次 → 直接进入该批次的来源链
    if (selectedSkuCode && selectedBatch) {
      doQuery(selectedSkuCode, selectedBatch)
      return
    }
    patch({
      error: null,
      node: null,
      path: [],
      searched: true,
    })
  }

  /** 从某个 SKU 的批次进入逆向追溯（上钻还原来源链） */
  const doQuery = (code: string, batchNo: string) => {
    const result = queryReverseTrace(code, batchNo)
    if (!result) {
      patch({
        node: null,
        path: [],
        error: `未查询到 成品 ${code} / 批次 ${batchNo} 的追溯数据`,
        searched: true,
      })
      return
    }
    patch({
      error: null,
      path: [
        {
          code: result.sku.code,
          batchNo: result.inventory.batchNo,
          name: result.sku.name,
          category: result.sku.category,
        },
      ],
      node: result,
    })
  }

  const handleDrillUp = (u: UpstreamMaterial) => {
    const result = queryReverseTrace(u.code, u.batchNo)
    if (!result) {
      patch({ error: `「${u.code} / ${u.batchNo}」暂无更上层数据`, searched: true })
      return
    }
    patch({ error: null, node: result })
    setBackward((prev) => ({
      ...prev,
      path: [
        ...prev.path,
        {
          code: result.sku.code,
          batchNo: result.inventory.batchNo,
          name: result.sku.name,
          category: result.sku.category,
        },
      ],
    }))
  }

  const jumpTo = (index: number) => {
    const step = path[index]
    if (!step) return
    doQuery(step.code, step.batchNo)
  }

  const backToListing = () => {
    patch({ node: null, path: [], error: null })
  }

  /* 所选 SKU 的批次选项（均来自该 SPU 关联数据） */
  const batchOptions: ComboboxOption[] =
    selectedSkuCode && selectedSpuNo
      ? getReverseBatchStocks(selectedSkuCode)
          .filter((b) => {
            const kw = batchKeyword.trim().toLowerCase()
            return !kw || b.batchNo.toLowerCase().includes(kw)
          })
          .map((b) => ({ value: b.batchNo, label: "" }))
      : []

  /** SPU 查询结果：按 SKU 维度分区；可选填 SKU 以仅展示该 SKU（由选中的 SPU 派生） */
  const skuSections: SpuSkuSection[] =
    selectedSpuNo && !node && searched
      ? getSpuSkus(selectedSpuNo)
          .filter((s) => !selectedSkuCode || s.code === selectedSkuCode)
          .map((s) => ({
            sku: s,
            batches: getReverseBatchStocks(s.code),
          }))
      : []

  const canQuery = Boolean(selectedSpuNo)

  return (
    <>
      <PageHeader title="逆向追溯" />
      <PageBody>
      {/* ===== 查询区：SPU（必选）→ 关联产品/批次（可选，SPU 为空则不展示） ===== */}
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
        {selectedSpuNo && (
          <div className="w-64 min-w-[200px]">
            <RemoteCombobox
              placeholder="关联产品"
              searchPlaceholder="请输入"
              options={skuOptions}
              value={selectedSkuCode}
              onSelect={handleSkuSelect}
              onSearch={handleSkuSearch}
            />
          </div>
        )}
        {selectedSpuNo && selectedSkuCode && (
          <div className="w-56 min-w-[180px]">
            <RemoteCombobox
              placeholder="批次编号"
              searchPlaceholder="请输入"
              options={batchOptions}
              value={selectedBatch}
              onSelect={(b) => patch({ selectedBatch: b })}
              onSearch={(kw) => patch({ batchKeyword: kw })}
            />
          </div>
        )}
        <Button type="submit" disabled={!canQuery}>
          <Search />
          查询
        </Button>
        {/* 全部展开/收起：与查询按钮同一栏（同正向追溯）；按当前视图渲染对应按钮 */}
        {node && nodeSectionKeys.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const all = nodeSectionKeys.every((k) => nodeOpenOf(k))
              const next: Record<string, boolean> = {}
              nodeSectionKeys.forEach((k) => {
                next[k] = !all
              })
              setNodeOpenMap(next)
            }}
            className="gap-1.5 border-primary bg-white text-primary hover:bg-primary/5 hover:text-primary"
          >
            {nodeSectionKeys.every((k) => nodeOpenOf(k)) ? (
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
        {!node && skuSections.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const all = skuSections.every((s) => openOf(s.sku.code))
              const next: Record<string, boolean> = {}
              skuSections.forEach((s) => {
                next[s.sku.code] = !all
              })
              setOpenMap(next)
            }}
            className="gap-1.5 border-primary bg-white text-primary hover:bg-primary/5 hover:text-primary"
          >
            {skuSections.every((s) => openOf(s.sku.code)) ? (
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

      {/* ===== SPU 查询结果：按 SKU 维度分区展示（每个 SKU 一个可折叠卡片） ===== */}
      {skuSections.length > 0 && (
        <div className="mt-4 space-y-4">
          {/* 追溯路径：起点为 SPU 编码 */}
          <TracePath
            direction="up"
            label="追溯路径"
            steps={selectedSpuNo ? [{ code: selectedSpuNo }] : []}
            onJumpTo={() => {}}
          />

          {/* 全部展开 / 全部收起 已移至查询按钮栏（与正向追溯一致） */}

          {skuSections.map((s) => (
            <SpuSkuCard
              key={s.sku.code}
              section={s}
              open={openOf(s.sku.code)}
              onToggle={() => toggleOpen(s.sku.code)}
              onSelectBatch={doQuery}
            />
          ))}
        </div>
      )}

      {/* ===== 逆向追溯视图（从某 SKU 的批次上钻其来源链） ===== */}
      {node && (
        <div className="space-y-4">
          {/* ===== 当前批次操作条 ===== */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <PackageSearch className="size-4 shrink-0" />
              <span className="whitespace-nowrap">当前批次</span>
              <span className="font-mono text-xs font-semibold text-foreground">
                {node.sku.code}
              </span>
              <span className="font-mono text-xs">/ {node.inventory.batchNo}</span>
            </div>
            <Button variant="outline" size="sm" onClick={backToListing}>
              ← 返回SPU查询结果
            </Button>
          </div>

          {/* ===== 追溯路径（面包屑，上钻方向） ===== */}
          <TracePath
            direction="up"
            steps={path}
            isLeafEnd={isReverseLeaf(node)}
            endBadge="采购来源"
            onJumpTo={jumpTo}
          />

          {/* 本节点 全部展开/收起 已移至查询按钮栏（与正向追溯一致） */}

          {/* ===== 当前层内容 ===== */}
          <div className="grid gap-4 xl:grid-cols-2">
            <SkuSection
              sku={node.sku}
              open={nodeOpenOf("sku")}
              onToggle={() => toggleNode("sku")}
            />
            <InventorySection
              inventory={node.inventory}
              open={nodeOpenOf("inventory")}
              onToggle={() => toggleNode("inventory")}
            />
          </div>
          <StockInSection
            records={node.stockInRecords}
            open={nodeOpenOf("stockin")}
            onToggle={() => toggleNode("stockin")}
          />
          <UpstreamSection
            node={node}
            onDrillUp={handleDrillUp}
            open={nodeOpenOf("upstream")}
            onToggle={() => toggleNode("upstream")}
          />

          <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            <ChevronsUp className="size-3.5" />
            {isReverseLeaf(node)
              ? "该批次为采购来源（原料/包材），逆向追溯到采购入库为止。"
              : "点击上方「上游用料」中任一「查看上一层」按钮，可继续上钻该用料批次的来源信息。"}
          </div>
        </div>
      )}

      </PageBody>
    </>
  )
}