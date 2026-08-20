"use client"

import * as React from "react"
import { PackageSearch } from "lucide-react"

import { cn } from "@/lib/utils"

export interface TraceEmptyStateProps {
  /** 图标（默认 PackageSearch） */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  /** 主标题 */
  title?: string
  /** 副标题说明 */
  description?: string
  /** 操作步骤列表 */
  steps?: string[]
  className?: string
}

/**
 * 追溯空态引导：未查询/无数据时展示操作指引，
 * 提升初始页与空结果的可用性。
 */
export function TraceEmptyState({
  icon: Icon = PackageSearch,
  title,
  description,
  steps,
  className,
}: TraceEmptyStateProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-md flex-col items-center rounded-none border border-dashed bg-muted/20 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {steps && steps.length > 0 && (
        <ol className="mt-6 w-full space-y-2 text-left">
          {steps.map((s, i) => (
            <li
              key={i}
              className="flex items-center gap-2.5 rounded-none bg-background px-3 py-2 text-sm ring-1 ring-foreground/5"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{s}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}