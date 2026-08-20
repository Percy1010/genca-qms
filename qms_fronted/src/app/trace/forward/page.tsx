"use client"

import React, { useMemo, useState } from "react"
import {
  AlertTriangle,
  ChevronsDown,
  ChevronsUp,
  Search,
} from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RemoteCombobox } from "@/components/trace/remote-combobox"
import { MultiSelectCombobox } from "@/components/trace/multi-select-combobox"
import type { ComboboxOption } from "@/components/trace/remote-combobox"
import { TracePath } from "@/components/trace/trace-path"
import { PageBody, PageHeader } from "@/components/page-header"
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
  SalesReturnSection,
  SalesStockOutSection,
  SemiArticleFactoryInSection,
  SemiArticleFactoryOutSection,
  SemiArticleIssueSection,
  SemiFactoryInSection,
  SemiFactoryOutSection,
  SemiIssueSection,
} from "@/components/trace/forward-node-sections"
import { getMaterial, getSku } from "@/lib/mock-forward-trace"
import {
  collectForwardSectionKeys,
  createEmptyNode,
  nextNodeKind,
  nodeKindFromCategory,
  nodeKindLabel,
  queryForwardNode,
  type ForwardNode,
  type ForwardPathStep,
  type ProductionOutputRecord,
} from "@/lib/forward-trace-model"
import { searchMaterialsRemote } from "@/lib/trace-api"
import {
  useTraceSession,
  type ForwardTraceSession,
} from "@/lib/trace-session-store"

function formatPathBatch(batches: string[]): string | undefined {
  if (batches.length === 0) return undefined
  if (batches.length === 1) return batches[0]
  return batches.join("、")
}

function loadNode(
  code: string,
  batches: string[],
  index: number,
): { step: ForwardPathStep; node: ForwardNode } | null {
  const queried = queryForwardNode(code, batches)
  const sku = queried?.sku ?? getSku(code)
  if (!sku) return null
  const kind = queried?.node.kind ?? nodeKindFromCategory(sku.category)
  const node = queried
    ? { ...queried.node, index }
    : createEmptyNode(kind, index, sku.category)
  return {
    step: {
      code: sku.code,
      name: sku.name,
      category: sku.category,
      batchNo: formatPathBatch(batches),
      nodeKind: kind,
    },
    node,
  }
}

function ForwardNodeBlock({
  node,
  openOf,
  toggle,
  onNext,
}: {
  node: ForwardNode
  openOf: (key: string) => boolean
  toggle: (key: string) => void
  onNext?: (row: ProductionOutputRecord) => void
}) {
  const p = `n${node.index}`
  const canGoNext =
    node.kind !== "finished" &&
    (node.kind === "raw" || node.kind === "semi" || node.kind === "semiArticle") &&
    node.outputs.length > 0
  return (
    <section className="space-y-3">
      {node.kind === "raw" && (
        <>
          <RawDeliverySection
            records={node.deliveries}
            open={openOf(`${p}-delivery`)}
            onToggle={() => toggle(`${p}-delivery`)}
          />
          <RawFactoryInSection
            records={node.factoryIns}
            open={openOf(`${p}-factory-in`)}
            onToggle={() => toggle(`${p}-factory-in`)}
          />
          <RawFactoryOutSection
            records={node.factoryOuts}
            open={openOf(`${p}-factory-out`)}
            onToggle={() => toggle(`${p}-factory-out`)}
          />
          <RawIssueSection
            records={node.issues}
            open={openOf(`${p}-issue`)}
            onToggle={() => toggle(`${p}-issue`)}
          />
          <RetainSampleSection
            records={node.retains}
            open={openOf(`${p}-retain`)}
            onToggle={() => toggle(`${p}-retain`)}
          />
          <ProductionOutputSection
            records={node.outputs}
            open={openOf(`${p}-output`)}
            onToggle={() => toggle(`${p}-output`)}
            onNext={canGoNext ? onNext : undefined}
          />
        </>
      )}

      {node.kind === "semi" && (
        <>
          <SemiFactoryInSection
            records={node.factoryIns}
            open={openOf(`${p}-factory-in`)}
            onToggle={() => toggle(`${p}-factory-in`)}
          />
          <SemiFactoryOutSection
            records={node.factoryOuts}
            open={openOf(`${p}-factory-out`)}
            onToggle={() => toggle(`${p}-factory-out`)}
          />
          <SemiIssueSection
            records={node.issues}
            open={openOf(`${p}-issue`)}
            onToggle={() => toggle(`${p}-issue`)}
          />
          <RetainSampleSection
            records={node.retains}
            open={openOf(`${p}-retain`)}
            onToggle={() => toggle(`${p}-retain`)}
          />
          <ProductionOutputSection
            records={node.outputs}
            open={openOf(`${p}-output`)}
            onToggle={() => toggle(`${p}-output`)}
            onNext={canGoNext ? onNext : undefined}
          />
        </>
      )}

      {node.kind === "semiArticle" && (
        <>
          <SemiArticleFactoryInSection
            records={node.factoryIns}
            open={openOf(`${p}-factory-in`)}
            onToggle={() => toggle(`${p}-factory-in`)}
          />
          <SemiArticleFactoryOutSection
            records={node.factoryOuts}
            open={openOf(`${p}-factory-out`)}
            onToggle={() => toggle(`${p}-factory-out`)}
          />
          <SemiArticleIssueSection
            records={node.issues}
            open={openOf(`${p}-issue`)}
            onToggle={() => toggle(`${p}-issue`)}
          />
          <RetainSampleSection
            records={node.retains}
            open={openOf(`${p}-retain`)}
            onToggle={() => toggle(`${p}-retain`)}
          />
          <ProductionOutputSection
            records={node.outputs}
            open={openOf(`${p}-output`)}
            onToggle={() => toggle(`${p}-output`)}
            onNext={canGoNext ? onNext : undefined}
          />
        </>
      )}

      {node.kind === "finished" && (
        <>
          <FinishedFactoryInSection
            records={node.factoryIns}
            open={openOf(`${p}-factory-in`)}
            onToggle={() => toggle(`${p}-factory-in`)}
          />
          <FinishedFactoryOutSection
            records={node.factoryOuts}
            open={openOf(`${p}-factory-out`)}
            onToggle={() => toggle(`${p}-factory-out`)}
          />
          <DcStockInSection
            records={node.dcIns}
            open={openOf(`${p}-dc-in`)}
            onToggle={() => toggle(`${p}-dc-in`)}
          />
          <SalesStockOutSection
            records={node.salesOuts}
            open={openOf(`${p}-sales-out`)}
            onToggle={() => toggle(`${p}-sales-out`)}
          />
          <SalesReturnSection
            records={node.salesReturns}
            open={openOf(`${p}-sales-return`)}
            onToggle={() => toggle(`${p}-sales-return`)}
          />
          <DcStockOutSection
            records={node.dcOuts}
            open={openOf(`${p}-dc-out`)}
            onToggle={() => toggle(`${p}-dc-out`)}
          />
          <RetainSampleSection
            records={node.retains}
            open={openOf(`${p}-retain`)}
            onToggle={() => toggle(`${p}-retain`)}
          />
        </>
      )}
    </section>
  )
}

export default function ForwardTracePage() {
  const { forward, setForward } = useTraceSession()
  const {
    originCode,
    skuOptions,
    searching,
    selectedBatches,
    path,
    result,
    error,
  } = forward

  const patch = (p: Partial<ForwardTraceSession>) =>
    setForward((prev) => ({ ...prev, ...p }))

  const current = path[path.length - 1]
  const atOrigin = path.length <= 1
  const queryCode = atOrigin ? originCode : (current?.code ?? originCode)

  const sectionKeys = useMemo(
    () => (result ? collectForwardSectionKeys(result) : []),
    [result],
  )
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})
  const openOf = (k: string) => openMap[k] ?? true
  const toggle = (k: string) =>
    setOpenMap((m) => ({ ...m, [k]: !(m[k] ?? true) }))
  const toggleAll = (keys: string[]) => {
    const all = keys.every((k) => openOf(k))
    setOpenMap((m) => {
      const next = { ...m }
      keys.forEach((k) => {
        next[k] = !all
      })
      return next
    })
  }

  async function handleMaterialSearch(kw: string) {
    patch({ searching: true })
    try {
      const rows = await searchMaterialsRemote(kw)
      patch({
        skuOptions: rows.map((m) => ({
          value: m.code,
          label: m.name,
        })),
        error: null,
      })
    } catch (err) {
      patch({
        skuOptions: [],
        error: err instanceof Error ? err.message : "物料主数据查询失败",
      })
    } finally {
      patch({ searching: false })
    }
  }

  function handleMaterialSelect(code: string | null) {
    if (!code) {
      patch({
        originCode: null,
        selectedBatches: [],
        path: [],
        result: null,
        error: null,
      })
      return
    }
    patch({
      originCode: code,
      selectedBatches: [],
      path: [],
      result: null,
      error: null,
    })
  }

  function applyOriginResult(code: string, batches: string[]) {
    const loaded = loadNode(code, batches, 1)
    if (!loaded) {
      patch({ error: `未找到物料主数据：${code}`, result: null, path: [] })
      return
    }
    patch({
      originCode: code,
      selectedBatches: batches,
      path: [loaded.step],
      result: loaded.node,
      error: null,
    })
    setOpenMap({})
  }

  function handleSearch() {
    if (!originCode) return
    applyOriginResult(originCode, selectedBatches)
  }

  function handleBatchChange(next: string[]) {
    patch({ selectedBatches: next })
    if (!originCode || !atOrigin || !result) return
    applyOriginResult(originCode, next)
  }

  function handleNext(row: ProductionOutputRecord) {
    if (!current) return
    const code = String(row.materialCode || "")
    const batchNo = String(row.batchNo || "")
    if (!code) return
    const nextKind =
      nextNodeKind(current.nodeKind, current.category) ??
      nodeKindFromCategory((row.materialType as ForwardPathStep["category"]) || "成品组合")
    const sku = getSku(code)
    const loaded = loadNode(code, batchNo ? [batchNo] : [], path.length + 1)
    const node: ForwardNode = loaded?.node ?? createEmptyNode(nextKind, path.length + 1)
    const step: ForwardPathStep = {
      code,
      name: sku?.name ?? String(row.materialName || code),
      category: sku?.category ?? current.category,
      batchNo: batchNo || undefined,
      nodeKind: loaded?.step.nodeKind ?? nextKind,
    }
    patch({
      path: [...path, step],
      result: node,
      error: null,
    })
    setOpenMap({})
  }

  function jumpTo(index: number) {
    const step = path[index]
    if (!step) return
    const batches = step.batchNo ? [step.batchNo] : []
    const loaded = loadNode(step.code, batches, index + 1)
    if (!loaded) return
    patch({
      path: path.slice(0, index + 1),
      result: loaded.node,
      originCode: index === 0 ? step.code : originCode,
      selectedBatches: index === 0 ? (step.batchNo ? step.batchNo.split("、") : []) : selectedBatches,
      error: null,
    })
    setOpenMap({})
  }

  const batchOptions: ComboboxOption[] = useMemo(() => {
    if (!queryCode) return []
    const detail = getMaterial(queryCode)
    return (detail?.batches ?? []).map((b) => ({
      value: b.batchNo,
      label: b.batchNo,
    }))
  }, [queryCode])

  return (
    <>
      <PageHeader title="正向追溯" />

      <PageBody>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSearch()
          }}
          className="mt-6 flex flex-wrap items-center gap-2"
        >
          <div className="min-w-[300px] max-w-2xl flex-1">
            <RemoteCombobox
              placeholder="物料编码或名称"
              searchPlaceholder="请输入"
              emptyText="暂无结果"
              options={skuOptions}
              value={originCode}
              onSelect={handleMaterialSelect}
              onSearch={handleMaterialSearch}
              loading={searching}
            />
          </div>
          {originCode && (
            <div className="w-80 min-w-[240px]">
              <MultiSelectCombobox
                placeholder="批次编号"
                searchPlaceholder="请输入"
                options={batchOptions}
                value={atOrigin ? selectedBatches : []}
                onChange={handleBatchChange}
                disabled={!atOrigin}
                emptyText="该物料暂无批次"
              />
            </div>
          )}
          <Button type="submit" disabled={!originCode}>
            <Search />
            查询
          </Button>
          {result && sectionKeys.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => toggleAll(sectionKeys)}
              className="gap-1.5 border-primary bg-white text-primary hover:bg-primary/5 hover:text-primary"
            >
              {sectionKeys.every((k) => openOf(k)) ? (
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

        {error && (
          <Alert variant="destructive" className="mb-4 mt-4">
            <AlertTriangle className="size-4" />
            <AlertTitle>查询失败</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="mt-4 space-y-4">
            <TracePath
              direction="down"
              steps={path}
              onJumpTo={jumpTo}
              onJumpCode={jumpTo}
            />

            <ForwardNodeBlock
              node={result}
              openOf={openOf}
              toggle={toggle}
              onNext={handleNext}
            />
          </div>
        )}
      </PageBody>
    </>
  )
}
