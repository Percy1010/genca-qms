"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertTriangle, ChevronLeft } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { queryRawMaterial, type RawItem } from "@/lib/mock-raw-trace"

const statusVariant: Record<RawItem["status"], "default" | "secondary" | "destructive"> = {
  合格: "default",
  待检: "secondary",
  不合格: "destructive",
}

function MatrixViewInner() {
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

  // 遍历树：为每条「原料批次 → 半成品 → 成品 → 出货」路径生成一行
  interface Row {
    raw: RawItem
    semi?: RawItem
    finished?: RawItem
    shipment?: RawItem
  }
  const rows: Row[] = []
  const walk = (r: RawItem, semi?: RawItem, fin?: RawItem) => {
    if (!r.children || r.children.length === 0) {
      rows.push({ raw: r, semi, finished: fin })
      return
    }
    for (const c of r.children) {
      if (c.type === "semi") walk(c, c, fin)
      else if (c.type === "finished") {
        if (!c.children || c.children.length === 0) {
          rows.push({ raw: r, semi, finished: c })
        } else {
          for (const s of c.children) walk(s as RawItem, semi, c)
        }
      } else {
        rows.push({ raw: r, semi, finished: fin, shipment: c })
      }
    }
  }
  data.rawBatches.forEach((r) => walk(r))

  // 去重统计：唯一原料/半成品/成品批次数
  const uniq = (arr: (RawItem | undefined)[]) =>
    new Set(arr.filter(Boolean).map((x) => x!.batchNo)).size

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">方案三：批次矩阵清单</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.name}（{data.code}）· 每条「原料→半成品→成品→出货」路径一行，横向对照
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/trace/raw?code=${encodeURIComponent(code)}`}>
            <ChevronLeft />
            返回选择
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        {[
          { label: "唯一原料批次", value: uniq(rows.map((r) => r.raw)) },
          { label: "唯一半成品批次", value: uniq(rows.map((r) => r.semi)) },
          { label: "唯一成品批次", value: uniq(rows.map((r) => r.finished)) },
          { label: "追溯路径数", value: rows.length },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card px-4 py-2">
            <span className="font-bold">{s.value}</span>
            <span className="ml-1.5 text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table className="min-w-[880px]">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-sky-50 text-sky-900  ">
                原料批次
              </TableHead>
              <TableHead className="bg-amber-50 text-amber-900  ">
                半成品批次
              </TableHead>
              <TableHead className="bg-emerald-50 text-emerald-900  ">
                成品批次
              </TableHead>
              <TableHead className="bg-violet-50 text-violet-900  ">
                出货去向
              </TableHead>
              <TableHead className="text-right">成品数量</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i} className={cn(i % 2 === 1 && "bg-muted/30")}>
                <TableCell>
                  <BatchCell node={row.raw} />
                </TableCell>
                <TableCell>
                  {row.semi ? <BatchCell node={row.semi} /> : <Dash />}
                </TableCell>
                <TableCell>
                  {row.finished ? <BatchCell node={row.finished} /> : <Dash />}
                </TableCell>
                <TableCell>
                  {row.shipment ? <BatchCell node={row.shipment} /> : <Dash />}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {row.finished?.quantity ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function BatchCell({ node }: { node: RawItem }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-xs font-semibold">{node.batchNo}</span>
        <Badge variant={statusVariant[node.status]}>{node.status}</Badge>
      </div>
      <span className="truncate text-xs text-muted-foreground">{node.name}</span>
      <span className="truncate text-xs text-muted-foreground/70">{node.quantity}</span>
    </div>
  )
}

function Dash() {
  return <span className="text-muted-foreground/50">—</span>
}

export default function MatrixViewPage() {
  return (
    <Suspense fallback={null}>
      <MatrixViewInner />
    </Suspense>
  )
}
