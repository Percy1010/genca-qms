"use client"

import * as React from "react"
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnPinningState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination, DataTableToolbar } from "@/components/data-table"
import { loadTablePrefs, saveTablePrefs, tablePrefsKey } from "./column-prefs"

export interface DataTableFilter {
  columnId: string
  title: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** 全局搜索占位文案；不传则显示筛选输入框 */
  searchPlaceholder?: string
  /** 指定按某一列过滤（替代全局搜索） */
  searchKey?: string
  /** 第一个查询框同时匹配的列（如产品编码+产品名称） */
  searchKeys?: string[]
  /** 第二个查询框对应列 */
  extraSearchKey?: string
  /** 第二个查询框占位文案 */
  extraSearchPlaceholder?: string
  /** 隐藏内置搜索框（用于外部自定义搜索） */
  hideSearch?: boolean
  /** 列级多面筛选 */
  filters?: DataTableFilter[]
  /** 是否启用行选择 */
  enableRowSelection?: boolean
  /** 表容器额外样式 */
  className?: string
  /** 内部 <Table> 的最小宽度（用于列多/内容宽时在该模块内左右滚动，避免顶宽页面） */
  tableClassName?: string
  /** 是否启用列排序 */
  sortable?: boolean
  /** 是否显示「列设置」按钮（默认 true） */
  showColumnSettings?: boolean
  /** 工具栏左侧自定义操作区（如「导出」按钮） */
  toolbar?: React.ReactNode
  /** 行鼠标右键回调：可用来实现右键上下文菜单 */
  onRowContextMenu?: (
    record: TData,
    event: React.MouseEvent<HTMLTableRowElement>,
  ) => void
  /** 列设置本地缓存键；不传则按列 id 组合生成 */
  storageKey?: string
}

/**
 * 通用数据表格：排序 + 筛选 + 分页 + 列显隐。
 * 内部使用 @tanstack/react-table（本地状态，无 URL 同步）。
 * 移植自 shadcn-admin 的 DataTable 组件族。
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "筛选...",
  searchKey,
  searchKeys,
  extraSearchKey,
  extraSearchPlaceholder,
  hideSearch = false,
  filters = [],
  enableRowSelection = false,
  sortable = true,
  showColumnSettings = true,
  className,
  tableClassName,
  toolbar,
  onRowContextMenu,
  storageKey,
}: DataTableProps<TData, TValue>) {
  const knownIdsKey = columns
    .map((column) => {
      if (column.id) return column.id
      if ("accessorKey" in column && column.accessorKey != null) {
        return String(column.accessorKey)
      }
      return ""
    })
    .filter(Boolean)
    .join("|")
  const knownColumnIds = React.useMemo(
    () => knownIdsKey.split("|").filter(Boolean),
    [knownIdsKey],
  )
  const prefsKey = tablePrefsKey(storageKey, columns)

  const [rowSelection, setRowSelection] = React.useState({})
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([])
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: [],
    right: [],
  })
  const [prefsReady, setPrefsReady] = React.useState(false)
  const [globalFilter, setGlobalFilter] = React.useState("")

  /* 列宽拖拽：首次拖某列时先快照全部列的实测宽度，再切 fixed 布局，
     这样只改变当前列，其它列不会被 auto 布局一起挤动。 */
  const MIN_COL_WIDTH = 60
  const tableRef = React.useRef<HTMLTableElement>(null)
  const [columnSizing, setColumnSizing] = React.useState<Record<string, number>>(
    {},
  )
  const [resizingCol, setResizingCol] = React.useState<string | null>(null)
  const dragRef = React.useRef<{
    colId: string
    startX: number
    startW: number
  } | null>(null)

  const snapshotColumnWidths = React.useCallback(() => {
    const tableEl = tableRef.current
    if (!tableEl) return {}
    const heads = tableEl.querySelectorAll<HTMLTableCellElement>(
      "thead th[data-col-id]",
    )
    const next: Record<string, number> = {}
    heads.forEach((th) => {
      const id = th.dataset.colId
      if (!id) return
      next[id] = Math.max(MIN_COL_WIDTH, Math.round(th.getBoundingClientRect().width))
    })
    return next
  }, [])

  const handleResizeStart = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>, colId: string) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      const th = (e.currentTarget as HTMLElement).closest("th")
      if (!th) return
      const measured = snapshotColumnWidths()
      const startW = measured[colId] ?? Math.round(th.getBoundingClientRect().width)
      setColumnSizing((prev) =>
        Object.keys(prev).length > 0 ? prev : measured,
      )
      dragRef.current = { colId, startX: e.clientX, startW }
      setResizingCol(colId)

      const onMove = (ev: PointerEvent) => {
        const d = dragRef.current
        if (!d) return
        const next = Math.max(
          MIN_COL_WIDTH,
          Math.round(d.startW + (ev.clientX - d.startX)),
        )
        setColumnSizing((prev) => {
          const base = Object.keys(prev).length > 0 ? prev : measured
          if (base[d.colId] === next) return prev
          return { ...base, [d.colId]: next }
        })
      }
      const onUp = () => {
        dragRef.current = null
        setResizingCol(null)
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
        window.removeEventListener("pointercancel", onUp)
      }
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
      window.addEventListener("pointercancel", onUp)
    },
    [snapshotColumnWidths],
  )

  React.useLayoutEffect(() => {
    const prefs = loadTablePrefs(prefsKey, knownColumnIds)
    setColumnVisibility(prefs.visibility)
    setColumnOrder(prefs.order)
    setColumnPinning(prefs.pinning)
    setColumnSizing(prefs.sizing)
    setPrefsReady(true)
  }, [knownColumnIds, prefsKey])

  React.useEffect(() => {
    if (!prefsReady) return
    const timer = window.setTimeout(() => {
      saveTablePrefs(prefsKey, {
        visibility: columnVisibility,
        order: columnOrder,
        pinning: columnPinning,
        sizing: columnSizing,
      })
    }, resizingCol ? 300 : 0)
    return () => window.clearTimeout(timer)
  }, [
    columnOrder,
    columnPinning,
    columnSizing,
    columnVisibility,
    prefsKey,
    prefsReady,
    resizingCol,
  ])

  /* 拖拽中全局 col-resize 光标并禁止选中文本 */
  React.useEffect(() => {
    if (!resizingCol) return
    const prevCursor = document.body.style.cursor
    const prevUserSelect = document.body.style.userSelect
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    return () => {
      document.body.style.cursor = prevCursor
      document.body.style.userSelect = prevUserSelect
    }
  }, [resizingCol])

  const hasPinned =
    (columnPinning.left?.length ?? 0) + (columnPinning.right?.length ?? 0) > 0

  React.useEffect(() => {
    if (!hasPinned) return
    const frame = requestAnimationFrame(() => {
      const measured = snapshotColumnWidths()
      if (!Object.keys(measured).length) return
      setColumnSizing((prev) => {
        if (Object.keys(prev).length === 0) return measured
        const next = { ...prev }
        let changed = false
        for (const [id, width] of Object.entries(measured)) {
          if (next[id] == null) {
            next[id] = width
            changed = true
          }
        }
        return changed ? next : prev
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [hasPinned, columnVisibility, columnOrder, columnPinning, snapshotColumnWidths])

  const globalFilterFn = React.useCallback(
    (row: { original: TData }, _columnId: string, filterValue: unknown) => {
      const keys = searchKeys?.length ? searchKeys : undefined
      if (!keys) return true
      const q = String(filterValue ?? "").trim().toLowerCase()
      if (!q) return true
      const record = row.original as Record<string, unknown>
      return keys.some((key) =>
        String(record[key] ?? "").toLowerCase().includes(q),
      )
    },
    [searchKeys],
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnOrder,
      columnPinning,
      columnSizing,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection,
    enableSorting: sortable,
    globalFilterFn: searchKeys?.length ? globalFilterFn : undefined,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    onColumnSizingChange: setColumnSizing,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const visibleColumns = table.getVisibleLeafColumns()
  const hasSizing = Object.keys(columnSizing).length > 0
  const tableWidth = hasSizing
    ? visibleColumns.reduce(
        (sum, col) => sum + (columnSizing[col.id] ?? 0),
        0,
      )
    : undefined

  const columnWidth = (colId: string) => columnSizing[colId]

  const pinnedOffset = (column: Column<TData, unknown>) => {
    const pinned = column.getIsPinned()
    if (!pinned) return 0
    if (pinned === "left") {
      let offset = 0
      for (const col of visibleColumns) {
        if (col.id === column.id) break
        if (col.getIsPinned() === "left") offset += columnWidth(col.id) ?? 0
      }
      return offset
    }
    let offset = 0
    for (let i = visibleColumns.length - 1; i >= 0; i -= 1) {
      const col = visibleColumns[i]
      if (col.id === column.id) break
      if (col.getIsPinned() === "right") offset += columnWidth(col.id) ?? 0
    }
    return offset
  }

  const cellBoxStyle = (
    column: Column<TData, unknown>,
    extra?: React.CSSProperties,
  ): React.CSSProperties => {
    const pinned = column.getIsPinned()
    const width = columnWidth(column.id)
    const pinnedZ = extra?.zIndex
    return {
      ...extra,
      ...(width
        ? { width, minWidth: width, maxWidth: width }
        : {}),
      ...(pinned
        ? {
            position: "sticky",
            [pinned]: pinnedOffset(column),
            zIndex: pinnedZ ?? 20,
          }
        : { zIndex: 0 }),
    }
  }

  const isEdgePinned = (
    column: Column<TData, unknown>,
    side: "left" | "right",
  ) => {
    if (column.getIsPinned() !== side) return false
    if (side === "left") {
      const lefts = visibleColumns.filter((col) => col.getIsPinned() === "left")
      return lefts[lefts.length - 1]?.id === column.id
    }
    const rights = visibleColumns.filter((col) => col.getIsPinned() === "right")
    return rights[0]?.id === column.id
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <DataTableToolbar
            table={table}
            searchPlaceholder={searchPlaceholder}
            searchKey={searchKeys?.length ? undefined : searchKey}
            extraSearchKey={extraSearchKey}
            extraSearchPlaceholder={extraSearchPlaceholder}
            hideSearch={hideSearch}
            filters={filters}
            showColumnSettings={showColumnSettings}
          />
        </div>
        {toolbar}
      </div>
      <div className="relative isolate overflow-x-auto rounded-md border">
        <Table
          ref={tableRef}
          containerClassName="overflow-visible"
          className={cn(
            tableClassName,
            "isolate border-separate border-spacing-0",
            hasSizing && "w-max table-fixed",
            resizingCol && "select-none",
          )}
          style={hasSizing ? { width: tableWidth, minWidth: tableWidth } : undefined}
        >
          {hasSizing && (
            <colgroup>
              {table.getVisibleLeafColumns().map((col) => (
                <col
                  key={col.id}
                  style={{ width: columnSizing[col.id], minWidth: columnSizing[col.id] }}
                />
              ))}
            </colgroup>
          )}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => {
                  const isFirst = idx === 0
                  const isLast = idx === headerGroup.headers.length - 1
                  const isResizing = resizingCol === header.column.id
                  const pinned = header.column.getIsPinned()
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      data-col-id={header.column.id}
                      style={cellBoxStyle(header.column, {
                        paddingLeft: isFirst ? "1rem" : undefined,
                        paddingRight: isLast ? "1rem" : undefined,
                        zIndex: pinned ? 30 : 0,
                      })}
                      className={cn(
                        "group/th overflow-hidden border-b bg-background",
                        !pinned && "relative",
                        isEdgePinned(header.column, "left") &&
                          "shadow-[2px_0_8px_rgba(0,0,0,0.08)]",
                        isEdgePinned(header.column, "right") &&
                          "shadow-[-2px_0_8px_rgba(0,0,0,0.08)]",
                        header.column.columnDef.meta?.className,
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.colSpan === 1 && (
                        <div
                          role="separator"
                          aria-orientation="vertical"
                          onPointerDown={(e) =>
                            handleResizeStart(e, header.column.id)
                          }
                          onClick={(e) => e.stopPropagation()}
                          onDoubleClick={() => {
                            if (hasPinned) return
                            setColumnSizing({})
                          }}
                          className="absolute inset-y-0 right-0 z-10 w-1.5 cursor-col-resize touch-none select-none"
                        >
                          <span
                            className={cn(
                              "absolute top-1/2 right-0 h-3.5 w-px -translate-y-1/2 rounded-px bg-transparent transition-[height,background-color] duration-150",
                              "group-hover/th:bg-foreground/15",
                              "hover:h-[18px] hover:bg-primary/50",
                              isResizing && "h-[22px] bg-primary",
                            )}
                          />
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group/row"
                  data-state={row.getIsSelected() && "selected"}
                  onContextMenu={(e) =>
                    onRowContextMenu?.(row.original, e)
                  }
                >
                  {row.getVisibleCells().map((cell, idx) => {
                    const visible = row.getVisibleCells()
                    const isFirst = idx === 0
                    const isLast = idx === visible.length - 1
                    const pinned = cell.column.getIsPinned()
                    return (
                      <TableCell
                        key={cell.id}
                        style={cellBoxStyle(cell.column, {
                          paddingLeft: isFirst ? "1rem" : undefined,
                          paddingRight: isLast ? "1rem" : undefined,
                        })}
                        className={cn(
                          "overflow-hidden border-b bg-background",
                          pinned &&
                            "group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted",
                          !pinned && "group-hover/row:bg-muted/50",
                          isEdgePinned(cell.column, "left") &&
                            "shadow-[2px_0_8px_rgba(0,0,0,0.08)]",
                          isEdgePinned(cell.column, "right") &&
                            "shadow-[-2px_0_8px_rgba(0,0,0,0.08)]",
                          cell.column.columnDef.meta?.className,
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
