"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { RawItem, RawItemType } from "@/lib/mock-raw-trace"

const toneConfig: Record<RawItemType, { dot: string; border: string; badge: string }> = {
  raw: { dot: "bg-sky-500", border: "border-l-sky-500", badge: "bg-sky-100 text-sky-700  " },
  semi: { dot: "bg-amber-500", border: "border-l-amber-500", badge: "bg-amber-100 text-amber-700  " },
  finished: { dot: "bg-emerald-500", border: "border-l-emerald-500", badge: "bg-emerald-100 text-emerald-700  " },
  shipment: { dot: "bg-violet-500", border: "border-l-violet-500", badge: "bg-violet-100 text-violet-700  " },
}

const statusVariant: Record<RawItem["status"], "default" | "secondary" | "destructive"> = {
  合格: "default",
  待检: "secondary",
  不合格: "destructive",
}

export function RawLayerCard({
  node,
  onSelect,
  selected,
}: {
  node: RawItem
  onSelect?: (node: RawItem) => void
  selected?: boolean
}) {
  const tone = toneConfig[node.type]
  return (
    <button
      type="button"
      onClick={() => onSelect?.(node)}
      className={cn(
        "w-full cursor-pointer rounded-none border border-l-4 bg-card p-3 text-left transition-colors hover:bg-muted/50",
        tone.border,
        selected && "ring-2 ring-primary"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className={cn("font-mono", tone.badge)}>
          {node.batchNo}
        </Badge>
        <Badge variant={statusVariant[node.status]}>{node.status}</Badge>
      </div>
      <p className="mt-1.5 truncate text-sm font-semibold">{node.name}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {node.spec} · {node.date} · {node.quantity}
      </p>
    </button>
  )
}

/** 分层聚合卡片：顶部统计 + 各层可展开卡片列表 */
export function RawLayerView({ data }: { data: { raw: RawItem[]; semi: RawItem[]; finished: RawItem[]; shipment: RawItem[] } }) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({ raw: true })
  const [selected, setSelected] = React.useState<RawItem | null>(null)

  const layers = [
    { key: "raw", label: "原料批次", count: data.raw.length, items: data.raw, type: "raw" as const },
    { key: "semi", label: "半成品批次", count: data.semi.length, items: data.semi, type: "semi" as const },
    { key: "finished", label: "成品批次", count: data.finished.length, items: data.finished, type: "finished" as const },
    { key: "shipment", label: "出货去向", count: data.shipment.length, items: data.shipment, type: "shipment" as const },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* 各层卡片列表 */}
      <div className="space-y-4">
        {layers.map((layer) => (
          <Card key={layer.key}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2.5 rounded-full", toneConfig[layer.type].dot)} />
                  <span className="text-sm font-semibold">{layer.label}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    × {layer.count}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen((o) => ({ ...o, [layer.key]: !o[layer.key] }))}
                >
                  {open[layer.key] ? "收起" : "展开"}
                  <ChevronDown className={cn("size-3.5 transition-transform", open[layer.key] && "rotate-180")} />
                </Button>
              </div>

              {open[layer.key] && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {layer.items.map((item) => (
                    <RawLayerCard
                      key={item.id}
                      node={item}
                      selected={selected?.id === item.id}
                      onSelect={setSelected}
                    />
                  ))}
                  {layer.items.length === 0 && (
                    <p className="col-span-full py-2 text-center text-xs text-muted-foreground">
                      该层暂无批次
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 选中批次详情抽屉（右侧固定） */}
      <Card className="h-fit lg:sticky lg:top-20">
        <CardContent className="p-4">
          <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
            {selected ? "批次详情" : "选择批次查看详情"}
          </h4>
          {selected ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn("font-mono", toneConfig[selected.type].badge)}>
                  {selected.batchNo}
                </Badge>
                <Badge variant={statusVariant[selected.status]}>{selected.status}</Badge>
              </div>
              <div>
                <p className="text-base font-semibold">{selected.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selected.spec} · {selected.date} · {selected.quantity}
                </p>
              </div>
              <div className="space-y-1.5 border-t pt-3 text-sm">
                {selected.detail.map((d) => (
                  <div key={d.label} className="flex items-baseline justify-between gap-2">
                    <span className="shrink-0 text-muted-foreground">{d.label}</span>
                    <span className="truncate text-right font-medium">{d.value}</span>
                  </div>
                ))}
                {selected.detail.length === 0 && (
                  <p className="text-muted-foreground">无附加明细</p>
                )}
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              点击左侧任意批次卡片查看详情
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
