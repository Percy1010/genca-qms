"use client"

import { ChevronRight, Route } from "lucide-react"

import { cn } from "@/lib/utils"

export interface TracePathStep {
  code: string
  batchNo?: string
}

export interface TracePathProps {
  /** 路径步骤（按追溯方向排列） */
  steps: TracePathStep[]
  /** 追溯方向：down=正向下钻 / up=逆向 */
  direction: "down" | "up"
  /** 自定义路径标题（默认「追溯路径」） */
  label?: string
  /** 点击历史步骤的回调（通常为回到该步骤的批次视图：出入库/产出物） */
  onJumpTo: (index: number) => void
  /** 点击历史步骤的物料编码回调（回到该物料基本信息 + 批次列表）；缺失时退回 onJumpTo */
  onJumpCode?: (index: number) => void
  /** 点击当前步骤的物料编码（用于回到批次列表选择其他批次） */
  onCurrentCodeClick?: () => void
  className?: string
}

/**
 * 追溯路径步骤条：每个步骤带层级序号圆点（当前层主色高亮），
 * 步骤间用连接线体现追溯链路，历史步骤可点击回溯。
 */
export function TracePath({
  steps,
  direction,
  label,
  onJumpTo,
  onJumpCode,
  onCurrentCodeClick,
  className,
}: TracePathProps) {
  const Icon = Route
  const defaultLabel = "追溯路径"

  return (
    <div
      className={cn(
        "no-print overflow-x-auto rounded-none border bg-muted/40 px-4 py-2.5",
        className,
      )}
    >
      <ol className="flex w-max items-center gap-0.5 text-sm">
        <li className="flex shrink-0 items-center gap-1.5 pr-2 text-muted-foreground">
          <Icon className="size-4" />
          <span className="whitespace-nowrap">{label ?? defaultLabel}：</span>
        </li>

        {steps.map((step, i) => {
          const isLast = i === steps.length - 1
          return (
            <li key={`${step.code}-${step.batchNo}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
              )}
              {/* 层级序号圆点 */}
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors",
                  isLast
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/15 text-muted-foreground",
                )}
              >
                {i + 1}
              </span>

              {isLast ? (
                <span className="flex items-center gap-1.5 font-bold">
                  {onCurrentCodeClick ? (
                    <button
                      type="button"
                      onClick={onCurrentCodeClick}
                      title="回到该节点对应结果"
                      className="font-mono text-xs text-primary transition-colors hover:underline"
                    >
                      {step.code}
                    </button>
                  ) : (
                    <span className="font-mono text-xs">
                      {step.code}
                    </span>
                  )}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onJumpTo(i)}
                  title="回到该节点对应结果"
                  className="group flex items-center rounded-none px-1 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-background hover:text-primary hover:underline"
                >
                  {step.code}
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}