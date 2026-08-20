"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertTriangle, ChevronLeft } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RawTreeNode } from "@/components/trace/raw-tree-node"
import { queryRawMaterial } from "@/lib/mock-raw-trace"

function TreeViewInner() {
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
          <h1 className="text-2xl font-semibold tracking-tight">
            方案一：逐层下钻树
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.name}（{data.code}）· 共 {data.summary.raw} 个原料批次
            · 波及 {data.summary.semi} 个半成品 · {data.summary.finishedUnique} 个成品
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/trace/raw?code=${encodeURIComponent(code)}`}>
            <ChevronLeft />
            返回选择
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-sky-500" /> 原料
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-amber-500" /> 半成品
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-emerald-500" /> 成品
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2.5 rounded-full bg-violet-500" /> 出货
            </span>
            <span className="ml-auto">点击批次左侧箭头展开下游，点击「详情」查看明细</span>
          </div>
          <div className="space-y-1.5">
            {data.rawBatches.map((node) => (
              <RawTreeNode key={node.id} node={node} depth={0} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TreeViewPage() {
  return (
    <Suspense fallback={null}>
      <TreeViewInner />
    </Suspense>
  )
}
