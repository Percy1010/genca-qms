"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RawItem, RawItemType } from "@/lib/mock-raw-trace"

const toneClass: Record<RawItemType, { dot: string; badge: string }> = {
  raw: { dot: "bg-sky-500", badge: "bg-sky-100 text-sky-700  " },
  semi: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700  " },
  finished: { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700  " },
  shipment: { dot: "bg-violet-500", badge: "bg-violet-100 text-violet-700  " },
}

const statusVariant: Record<RawItem["status"], "default" | "secondary" | "destructive"> = {
  合格: "default",
  待检: "secondary",
  不合格: "destructive",
}

const stageLabels: Record<RawItemType, string> = {
  raw: "原料",
  semi: "半成品",
  finished: "成品",
  shipment: "出货",
}

/** 单个树节点：可展开下游，展示批次摘要 */
export function RawTreeNode({
  node,
  depth,
}: {
  node: RawItem
  depth: number
}) {
  const [open, setOpen] = React.useState(depth < 1)
  const hasChildren = (node.children?.length ?? 0) > 0
  const tone = toneClass[node.type]
  const childCount = node.children?.length ?? 0

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center gap-2 rounded-none border bg-card py-2 pl-2 pr-3 transition-colors hover:bg-muted/50",
          depth > 0 && "ml-5"
        )}
      >
        {/* 展开开关 */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-6 shrink-0"
            aria-label="展开/收起"
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronRight
              className={cn("size-4 transition-transform", open && "rotate-90")}
            />
          </Button>
        ) : (
          <span className="size-6 shrink-0" />
        )}

        <span className={cn("size-2.5 shrink-0 rounded-full", tone.dot)} />
        <Badge variant="outline" className={cn("shrink-0 font-mono", tone.badge)}>
          {node.batchNo}
        </Badge>
        <span className="min-w-0 truncate text-sm font-medium">{node.name}</span>
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
          {node.spec}
        </span>

        <span className="ml-auto flex shrink-0 items-center gap-2">
          {hasChildren && (
            <span className="hidden text-xs text-muted-foreground md:inline">
              {childCount} 个{stageLabels[node.type] === "原料" ? "下游" : "下游"}
            </span>
          )}
          {node.detail.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "收起" : "详情"}
            </Button>
          )}
          <Badge variant={statusVariant[node.status]}>{node.status}</Badge>
        </span>
      </div>

      {open && hasChildren && (
        <div className="relative mt-1 space-y-1">
          {/* 左侧引导线 */}
          <div className="absolute bottom-1 left-2 top-1 w-px bg-border" />
          {node.children!.map((child) => (
            <RawTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}

      {open && node.detail.length > 0 && (
        <div className={cn("mt-1 grid gap-x-6 gap-y-1 rounded-none border bg-muted/30 p-3 text-sm", depth > 0 && "ml-5")}>
          {node.detail.map((d) => (
            <div key={d.label} className="flex items-baseline justify-between gap-2">
              <span className="shrink-0 text-muted-foreground">{d.label}</span>
              <span className="truncate text-right font-medium">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
