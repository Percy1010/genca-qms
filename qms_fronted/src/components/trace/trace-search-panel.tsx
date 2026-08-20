"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface TraceSearchPanelProps {
  /** 面板序号（如 1、2） */
  step?: number
  /** 面板标题 */
  title: string
  /** 面板说明 */
  description?: string
  /** 查询按钮文案 */
  submitText?: string
  /** 是否允许提交（未完成选择时为 false） */
  canSearch?: boolean
  /** 提交回调（Enter 或点击按钮触发） */
  onSearch: () => void
  /** 表单控件区（物料/批次选择器等） */
  children: React.ReactNode
  /** 外层容器渲染为 form 时的控件数目（用于布局） */
  className?: string
}

/**
 * 追溯查询面板：带图标标题 + 帮助说明，支持 Enter 提交，底部主色查询按钮。
 * 供正向/逆向/报告页共用，保证三页查询区视觉一致。
 */
export function TraceSearchPanel({
  step,
  title,
  description,
  submitText = "查询",
  canSearch,
  onSearch,
  children,
  className,
}: TraceSearchPanelProps) {
  return (
    <Card className="no-print">
      <CardContent className="p-4 md:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex items-center gap-2">
            {step !== undefined && (
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {step}
              </span>
            )}
            <Search className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{title}</p>
            {description && (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSearch()
          }}
        >
          <div
            className={cn(
              "grid items-end gap-3 md:grid-cols-[1fr_1fr_auto]",
              className,
            )}
          >
            {children}
            <div className="flex items-center">
              <Button
                type="submit"
                disabled={!canSearch}
                className="w-full rounded-none md:w-auto"
              >
                <Search />
                {submitText}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}