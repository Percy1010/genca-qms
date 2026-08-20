"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle, ChevronRight, Workflow } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageShell } from "@/components/page-shell"
import { RawMaterialSearch } from "@/components/trace/raw-material-search"
import { RawLayerView } from "@/components/trace/raw-layer-view"
import { queryRawMaterial, rawMaterialOptions, type RawItem } from "@/lib/mock-raw-trace"

/** 把树形数据按层摊平，供聚合卡片视图使用 */
function flattenLayers(rawBatches: RawItem[]) {
  const semi: RawItem[] = []
  const finished: RawItem[] = []
  const shipment: RawItem[] = []
  const walk = (nodes: RawItem[]) => {
    for (const n of nodes) {
      if (n.type === "semi") semi.push(n)
      if (n.type === "finished") finished.push(n)
      if (n.type === "shipment") shipment.push(n)
      if (n.children) walk(n.children)
    }
  }
  walk(rawBatches)
  return { raw: rawBatches, semi, finished, shipment }
}

export default function RawMaterialTracePage() {
  const [query, setQuery] = useState("")
  const [data, setData] = useState<ReturnType<typeof queryRawMaterial>>(null)
  const [searched, setSearched] = useState(false)

  const onSearch = () => {
    setData(queryRawMaterial(query))
    setSearched(true)
  }

  return (
    <PageShell
      title="原料追溯（多对多）"
    >
      <RawMaterialSearch
        query={query}
        setQuery={setQuery}
        onSearch={onSearch}
        options={rawMaterialOptions}
      />

      {searched && !data && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>未找到原料</AlertTitle>
          <AlertDescription>
            未匹配到原料编码「{query}」。请使用上方示例原料，或核对编码后重试。
          </AlertDescription>
        </Alert>
      )}

      {data && (
        <div className="space-y-6">
          {/* 波及统计 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: "原料批次", value: data.summary.raw },
              { label: "半成品批次", value: data.summary.semi },
              { label: "成品批次（去重）", value: data.summary.finishedUnique },
              { label: "成品批次（含重复）", value: data.summary.finished },
              { label: "出货记录", value: data.summary.shipment },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border bg-card p-3 text-center">
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {/* 方案入口 */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Workflow className="size-4" />
            {data.name}（{data.code}）波及 {data.summary.finishedUnique} 个成品批次、涉及{" "}
            {data.summary.raw} 个原料批次。请选择查看方式：
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button asChild variant="outline" className="h-auto flex-col items-start gap-1 py-4">
              <Link href={`/trace/raw/tree?code=${encodeURIComponent(data.code)}`}>
                <span className="flex items-center gap-1 font-semibold">
                  方案一：逐层下钻树 <ChevronRight className="size-4" />
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  原料→半成品→成品→出货，一屏看全链路，可展开/收起
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col items-start gap-1 py-4">
              <Link href={`/trace/raw/layers?code=${encodeURIComponent(data.code)}`}>
                <span className="flex items-center gap-1 font-semibold">
                  方案二：分层聚合卡片 <ChevronRight className="size-4" />
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  各层批次独立展开，右侧显示选中批次详情
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col items-start gap-1 py-4">
              <Link href={`/trace/raw/matrix?code=${encodeURIComponent(data.code)}`}>
                <span className="flex items-center gap-1 font-semibold">
                  方案三：批次矩阵清单 <ChevronRight className="size-4" />
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  横向列出各层批次，一眼看多对多对应关系
                </span>
              </Link>
            </Button>
          </div>

          {/* 预演：默认展开分层聚合（仅展示用，正式决策后替换） */}
          <div className="rounded-lg border border-dashed p-3">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="text-muted-foreground">
                预演 · 方案二
              </Badge>
              <span className="text-xs text-muted-foreground">
                下方为分层聚合视图，另两个方案点上方按钮查看
              </span>
            </div>
            <RawLayerView data={flattenLayers(data.rawBatches)} />
          </div>
        </div>
      )}
    </PageShell>
  )
}
