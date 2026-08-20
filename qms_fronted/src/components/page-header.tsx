"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface PageHeaderProps {
  /** 当前页面名称 */
  title: string
  /** 右侧操作按钮内容（JSX） */
  actions?: ReactNode
  /** 顶部栏 className */
  className?: string
}

/**
 * 页面标题行（与其他模块统一规范）：
 * 流式标题，字号与占位页一致；右侧为可选操作按钮。
 */
export function PageHeader({ title, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight">{title}</h1>
      {actions ? (
        <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
      ) : null}
    </div>
  )
}

/** 页面容器：需全屏的内容用它包裹 */
export function PageBody({
  children,
  className,
  ref,
}: {
  children: ReactNode
  className?: string
  ref?: React.Ref<HTMLDivElement>
}) {
  return (
    <div ref={ref} className={cn("flex flex-1 flex-col", className)}>
      {children}
    </div>
  )
}
