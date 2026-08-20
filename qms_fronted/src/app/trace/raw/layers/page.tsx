"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertTriangle, ChevronLeft } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RawLayerView } from "@/components/trace/raw-layer-view"
import { queryRawMaterial, type RawItem } from "@/lib/mock-raw-trace"

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

function LayersViewInner() {
  const searchParams = useSearchParams()
  const code = searchParams.get("code") ?? ""
  const data = queryRawMaterial(code)

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertTitle>未找到原料</AlertTitle>
        <AlertDescription>
          原料编码「{code}」无追溯数据，请返回重新查询。
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">方案二：分层聚合卡片</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.name}（{data.code}）· 各层批次独立展开，点击卡片在右侧查看详情
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/trace/raw?code=${encodeURIComponent(code)}`}>
            <ChevronLeft />
            返回选择
          </Link>
        </Button>
      </div>

      <RawLayerView data={flattenLayers(data.rawBatches)} />
    </div>
  )
}

export default function LayersViewPage() {
  return (
    <Suspense fallback={null}>
      <LayersViewInner />
    </Suspense>
  )
}
