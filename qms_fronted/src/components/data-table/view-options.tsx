"use client"

import * as React from "react"
import {
  GripVertical,
  MoreHorizontal,
  PanelLeft,
  PanelRight,
  Settings2,
  X,
} from "lucide-react"
import type { Column, Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

const LOCKED_HEAD = new Set(["select"])
const LOCKED_TAIL = new Set(["actions"])

function columnTitle<TData>(column: Column<TData, unknown>) {
  const title = column.columnDef.meta?.title
  if (title) return title
  const header = column.columnDef.header
  return typeof header === "string" ? header : column.id
}

function isLocked(id: string) {
  return LOCKED_HEAD.has(id) || LOCKED_TAIL.has(id)
}

function pinColumn<TData>(
  table: Table<TData>,
  column: Column<TData, unknown>,
  side: "left" | "right" | false,
) {
  const current = table.getState().columnPinning
  const left = (current.left ?? []).filter((id) => id !== column.id)
  const right = (current.right ?? []).filter((id) => id !== column.id)
  if (side === "left") left.push(column.id)
  if (side === "right") right.push(column.id)
  table.setColumnPinning({ left, right })

  const all = table.getAllLeafColumns().map((item) => item.id)
  const middle = all.filter((id) => !left.includes(id) && !right.includes(id))
  table.setColumnOrder([...left, ...middle, ...right])
}

/** 列显隐 + 拖拽排序 + 左固定 / 中间列 / 右固定 分区 */
export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [overId, setOverId] = React.useState<string | null>(null)

  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.id !== "select")

  const currentOrder = () => {
    const ordered = table.getState().columnOrder
    const ids = table.getAllLeafColumns().map((column) => column.id)
    return ordered.length ? ordered.filter((id) => ids.includes(id)) : ids
  }

  /** 分区内列（按当前顺序） */
  const sectionColumns = (side: "left" | "middle" | "right") => {
    const order = currentOrder()
    const pinning = table.getState().columnPinning
    if (side === "left")
      return order.filter((id) => (pinning.left ?? []).includes(id))
    if (side === "right")
      return order.filter((id) => (pinning.right ?? []).includes(id))
    return order.filter(
      (id) =>
        !(pinning.left ?? []).includes(id) && !(pinning.right ?? []).includes(id),
    )
  }

  const moveColumn = (fromId: string, toId: string) => {
    if (fromId === toId) return
    const fromCol = table.getColumn(fromId)
    const toCol = table.getColumn(toId)
    if (!fromCol || !toCol) return
    if (fromCol.getIsPinned() !== toCol.getIsPinned()) return
    const next = currentOrder()
    const from = next.indexOf(fromId)
    const to = next.indexOf(toId)
    if (from < 0 || to < 0) return
    next.splice(from, 1)
    next.splice(to, 0, fromId)
    table.setColumnOrder(next)
    const pinning = table.getState().columnPinning
    if (fromCol.getIsPinned() === "left") {
      table.setColumnPinning({
        ...pinning,
        left: next.filter((id) => (pinning.left ?? []).includes(id)),
      })
    }
    if (fromCol.getIsPinned() === "right") {
      table.setColumnPinning({
        ...pinning,
        right: next.filter((id) => (pinning.right ?? []).includes(id)),
      })
    }
  }

  const reset = () => {
    table.resetColumnVisibility()
    table.resetColumnOrder()
    table.resetColumnPinning()
    table.resetColumnSizing()
  }

  /** 渲染一个分区（左固定/中间列/右固定） */
  const renderSection = (
    title: string,
    side: "left" | "middle" | "right",
  ) => {
    const ids = sectionColumns(side)
    const sectionCols = ids
      .map((id) => table.getColumn(id))
      .filter((c): c is Column<TData, unknown> => Boolean(c))
    return (
      <div className="rounded-md border">
        <div className="border-b px-2 py-1 text-xs font-medium text-muted-foreground">
          {title}
          <span className="ml-1 text-muted-foreground/70">({sectionCols.length})</span>
        </div>
        <div className="min-h-8 p-1">
          {sectionCols.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground/60">
              暂无列
            </p>
          ) : (
            sectionCols.map((column) => {
              const locked = isLocked(column.id)
              const dragging = dragId === column.id
              const dropping =
                overId === column.id && dragId && dragId !== column.id
              const pinned = column.getIsPinned()
              return (
                <div
                  key={column.id}
                  onDragOver={
                    locked
                      ? undefined
                      : (event) => {
                          event.preventDefault()
                          setOverId(column.id)
                        }
                  }
                  onDrop={
                    locked
                      ? undefined
                      : (event) => {
                          event.preventDefault()
                          const fromId =
                            dragId ?? event.dataTransfer.getData("text/plain")
                          moveColumn(fromId, column.id)
                          setDragId(null)
                          setOverId(null)
                        }
                  }
                  onDragLeave={() => {
                    if (overId === column.id) setOverId(null)
                  }}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-1 py-0.5",
                    dropping && "bg-primary/10",
                    dragging && "opacity-50",
                  )}
                >
                  <button
                    type="button"
                    draggable={!locked}
                    disabled={locked}
                    onDragStart={(event) => {
                      if (locked) return
                      setDragId(column.id)
                      event.dataTransfer.effectAllowed = "move"
                      event.dataTransfer.setData("text/plain", column.id)
                    }}
                    onDragEnd={() => {
                      setDragId(null)
                      setOverId(null)
                    }}
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground",
                      locked
                        ? "cursor-not-allowed opacity-30"
                        : "cursor-grab active:cursor-grabbing hover:bg-muted hover:text-foreground",
                    )}
                    aria-label={`拖动${columnTitle(column)}`}
                  >
                    <GripVertical className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={!column.getCanHide()}
                    onClick={() => {
                      if (!column.getCanHide()) return
                      column.toggleVisibility(!column.getIsVisible())
                    }}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-2 py-0.5 text-left text-sm",
                      column.getCanHide()
                        ? "cursor-pointer"
                        : "cursor-default opacity-80",
                    )}
                  >
                    <Checkbox
                      checked={column.getIsVisible()}
                      disabled={!column.getCanHide()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                      onClick={(event) => event.stopPropagation()}
                    />
                    <span className="truncate">{columnTitle(column)}</span>
                  </button>
                  {/* 固定/取消固定操作 */}
                  {side === "middle" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          title="更多操作"
                          aria-label={`更多操作${columnTitle(column)}`}
                          className="flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <MoreHorizontal className="size-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-28">
                        <DropdownMenuItem
                          onClick={() => pinColumn(table, column, "left")}
                          className="gap-2"
                        >
                          <PanelLeft className="size-3.5" />
                          左侧固定
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => pinColumn(table, column, "right")}
                          className="gap-2"
                        >
                          <PanelRight className="size-3.5" />
                          右侧固定
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <button
                      type="button"
                      title="取消固定"
                      aria-label={`取消固定${columnTitle(column)}`}
                      onClick={() => pinColumn(table, column, false)}
                      className="flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="ms-auto"
          title="列表设置"
          aria-label="列表设置"
        >
          <Settings2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-2 p-2">
        <div className="flex items-center justify-between px-1">
          <div className="text-sm font-medium">列表设置</div>
          <button
            type="button"
            onClick={reset}
            className="text-xs font-medium text-primary transition-colors hover:underline"
          >
            恢复默认
          </button>
        </div>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {renderSection("左固定", "left")}
          {renderSection("中间列", "middle")}
          {renderSection("右固定", "right")}
        </div>
      </PopoverContent>
    </Popover>
  )
}
