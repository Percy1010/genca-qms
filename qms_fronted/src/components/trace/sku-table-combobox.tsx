"use client"

import * as React from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn, getPageNumbers } from "@/lib/utils"

export interface SkuTableOption {
  /** 产品编码（SKU 编码），作为选中值 */
  code: string
  /** 产品名称 */
  name: string
  /** 产品规格 */
  spec: string
}

type ColumnId = "code" | "name" | "spec"

interface ColumnDef {
  id: ColumnId
  title: string
  /** 初始宽度（px） */
  defaultWidth: number
  /** 最小宽度（px） */
  minWidth: number
}

const COLUMNS: ColumnDef[] = [
  { id: "code", title: "产品编码", defaultWidth: 140, minWidth: 90 },
  { id: "name", title: "产品名称", defaultWidth: 320, minWidth: 160 },
  { id: "spec", title: "产品规格", defaultWidth: 160, minWidth: 90 },
]

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

/**
 * 产品（SKU）列表选择框（单选，列表形式）。
 *
 * 样式、交互完全对齐项目内正向追溯使用的 DataTable 组件：
 * - 顶部搜索框：样式对齐 SPU 下拉框（CommandInput 通栏圆角输入框）
 * - 列表容器 `rounded-md border`
 * - 表头吸顶、支持横/纵滚动；列头右侧拖条支持列宽拖拽（同 DataTable 交互，双击重置默认列宽）
 * - 列表行：hover 变 bg-muted/50，选中态 data-state=selected → bg-muted（TableRow 基础样式）
 * - 底部分页栏：同 DataTablePagination —— 「Select(页数) + 条/页」「第 N / M 页」「页码按钮组（含 ... 折叠）」「四向翻页按钮」
 */
export function SkuTableCombobox({
  placeholder,
  searchPlaceholder = "产品编码或名称",
  emptyText = "暂无结果",
  options,
  value,
  onSelect,
  onSearch,
  loading,
  disabled,
  pageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: {
  placeholder: string
  searchPlaceholder?: string
  emptyText?: string
  options: SkuTableOption[]
  value: string | null
  onSelect: (code: string | null) => void
  /** 输入关键词时回调，驱动父组件重新生成 options */
  onSearch?: (keyword: string) => void
  loading?: boolean
  disabled?: boolean
  /** 默认每页行数 */
  pageSize?: number
  /** 可选的每页行数列表 */
  pageSizeOptions?: readonly number[]
}) {
  const [open, setOpen] = React.useState(false)
  const [keyword, setKeyword] = React.useState("")
  const [pageIndex, setPageIndex] = React.useState(0) // 以 0 为基准，同 @tanstack/react-table 习惯
  const [pageSizeState, setPageSizeState] = React.useState<number>(
    () => (Array.from(pageSizeOptions).includes(pageSize) ? pageSize : pageSizeOptions[0]),
  )

  /* options/关键词变化 → 回到第 1 页（0-indexed 为 0） */
  React.useEffect(() => {
    setPageIndex(0)
  }, [options.length, keyword])

  /* pageSize 变化时，如超出范围则回到首行 */
  React.useEffect(() => {
    setPageSizeState((prev) =>
      Array.from(pageSizeOptions).includes(prev) ? prev : pageSizeOptions[0],
    )
    setPageIndex(0)
  }, [pageSizeOptions])

  /* ====== 列宽拖拽（完全复用 DataTable 的交互实现） ====== */
  const MIN_COL_WIDTH = 60
  const tableRef = React.useRef<HTMLTableElement>(null)
  const [columnSizing, setColumnSizing] = React.useState<Record<string, number>>({})
  const [resizingCol, setResizingCol] = React.useState<string | null>(null)
  const dragRef = React.useRef<{
    colId: string
    startX: number
    startW: number
  } | null>(null)

  const snapshotColumnWidths = React.useCallback(() => {
    const tableEl = tableRef.current
    if (!tableEl) return {} as Record<string, number>
    const heads = tableEl.querySelectorAll<HTMLTableCellElement>("thead th[data-col-id]")
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
      setColumnSizing((prev) => (Object.keys(prev).length > 0 ? prev : measured))
      dragRef.current = { colId, startX: e.clientX, startW }
      setResizingCol(colId)
      const onMove = (ev: PointerEvent) => {
        const d = dragRef.current
        if (!d) return
        const next = Math.max(MIN_COL_WIDTH, Math.round(d.startW + (ev.clientX - d.startX)))
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

  /* 初始列宽（未被拖拽时套用；spec 为弹性列，拉伸填满容器，不在此列默认宽 */
  const sizing = React.useMemo<Record<string, number>>(() => {
    if (Object.keys(columnSizing).length > 0) return columnSizing
    const init: Record<string, number> = { code: 160, name: 320 }
    return init
  }, [columnSizing])

  /* ====== 分页（同 @tanstack/react-table 约定：pageIndex 以 0 开始） ====== */
  const total = options.length
  const totalPages = Math.max(1, Math.ceil(total / pageSizeState))
  const clampedPageIndex = Math.max(0, Math.min(pageIndex, totalPages - 1))
  const currentPage = clampedPageIndex + 1
  const pageStart = clampedPageIndex * pageSizeState
  const pageRows = options.slice(pageStart, pageStart + pageSizeState)
  const pageNumbers = React.useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  )

  const canPreviousPage = clampedPageIndex > 0
  const canNextPage = clampedPageIndex < totalPages - 1

  /* ====== 选中项回显 ====== */
  const selected = React.useMemo(
    () => options.find((o) => o.code === value) ?? null,
    [options, value],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="group/combo w-full justify-between rounded-none font-normal"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            {selected ? (
              <>
                <span className="shrink-0 font-mono text-xs">{selected.code}</span>
                <span className="min-w-0 flex-1 truncate">{selected.name}</span>
              </>
            ) : (
              <span className="min-w-0 truncate text-muted-foreground">
                {placeholder}
              </span>
            )}
          </span>
          <span className="ml-2 flex shrink-0 items-center gap-1">
            {selected && (
              <span
                role="button"
                tabIndex={0}
                aria-label="清空已选"
                className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover/combo:opacity-100 focus:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onSelect(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation()
                    e.preventDefault()
                    onSelect(null)
                  }
                }}
              >
                <X className="size-3.5" />
              </span>
            )}
            <ChevronDown className="size-4 shrink-0 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[720px] p-0 sm:w-[820px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* 顶部搜索区：样式对齐 SPU 下拉框（Command/CommandInput）—— 通栏圆角输入框 */}
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 size-4 shrink-0 opacity-50" />
          <input
            value={keyword}
            placeholder={searchPlaceholder}
            onChange={(e) => {
              const v = e.target.value
              setKeyword(v)
              onSearch?.(v)
            }}
            className="flex h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* 数据区 + 分页栏 */}
        <div className="max-h-[440px]">
          {loading ? (
            <div className="flex h-24 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Search className="size-4 animate-pulse" />
              搜索中...
            </div>
          ) : total === 0 ? (
            <div className="h-24 flex items-center justify-center text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            <div className="flex flex-col">
              {/* 列表容器：完全对齐 DataTable 的 className —— rounded-md border + overflow-x-auto */}
              <div className="mx-2.5 mt-2 relative isolate overflow-x-auto rounded-md border">
                <ScrollArea className="h-full max-h-[300px] w-full">
                  <Table
                    ref={tableRef}
                    containerClassName="overflow-visible"
                    className={cn(
                      "isolate w-full border-separate border-spacing-0 table-fixed",
                      resizingCol && "select-none",
                    )}
                  >
                    <colgroup>
                      {COLUMNS.map((c) =>
                        c.id === "spec" ? (
                          <col key={c.id} />
                        ) : (
                          <col
                            key={c.id}
                            style={{
                              width: sizing[c.id] ?? c.defaultWidth,
                              minWidth: sizing[c.id] ?? c.defaultWidth,
                            }}
                          />
                        ),
                      )}
                    </colgroup>
                    <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      <TableRow>
                        {COLUMNS.map((col) => {
                          const isElastic = col.id === "spec"
                          const isResizing = resizingCol === col.id
                          return (
                            <TableHead
                              key={col.id}
                              data-col-id={col.id}
                              style={
                                isElastic
                                  ? { minWidth: col.minWidth }
                                  : {
                                      width: sizing[col.id] ?? col.defaultWidth,
                                      minWidth: sizing[col.id] ?? col.defaultWidth,
                                      maxWidth: sizing[col.id] ?? col.defaultWidth,
                                    }
                              }
                              className="group/th overflow-hidden border-b bg-background font-medium text-foreground/80 relative"
                            >
                              <span className="truncate">{col.title}</span>
                              {!isElastic && (
                                <div
                                  role="separator"
                                  aria-orientation="vertical"
                                  aria-label={`拖动以调整${col.title}列宽`}
                                  onPointerDown={(e) => handleResizeStart(e, col.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  onDoubleClick={() => {
                                    // 双击重置为默认列宽
                                    setColumnSizing(() => {
                                      const def: Record<string, number> = {}
                                      COLUMNS.forEach((c) => (def[c.id] = c.defaultWidth))
                                      return def
                                    })
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
                    </TableHeader>
                    <TableBody>
                      {pageRows.map((opt) => {
                        const isSelected = value === opt.code
                        return (
                          <TableRow
                            key={opt.code}
                            data-state={isSelected ? "selected" : undefined}
                            onMouseDown={(e) => {
                              // 用 mousedown 而非 click，避免 Popover 外层点击关闭抢跑
                              e.preventDefault()
                            }}
                            onClick={() => {
                              // 单选：点击即选中并关闭；重复点击已选中行可清空
                              if (isSelected) {
                                onSelect(null)
                              } else {
                                onSelect(opt.code)
                                setOpen(false)
                              }
                            }}
                          >
                            <TableCell
                              style={{
                                width: sizing.code,
                                minWidth: sizing.code,
                                maxWidth: sizing.code,
                              }}
                              className="py-2 align-middle font-mono text-xs"
                            >
                              {opt.code}
                            </TableCell>
                            <TableCell
                              style={{
                                width: sizing.name,
                                minWidth: sizing.name,
                                maxWidth: sizing.name,
                              }}
                              className="py-2 align-middle"
                            >
                              <span className="block truncate" title={opt.name}>
                                {opt.name}
                              </span>
                            </TableCell>
                            <TableCell className="py-2 align-middle">
                              <span
                                className="block truncate"
                                title={opt.spec}
                              >
                                {opt.spec || "—"}
                              </span>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* 分页栏：完全对齐 DataTablePagination 样式 */}
              <div
                className="flex items-center justify-between gap-4 overflow-clip px-2 py-3"
                style={{ overflowClipMargin: 1 }}
              >
                {/* 每页条数（左侧） */}
                <div className="flex items-center gap-2">
                  <Select
                    value={`${pageSizeState}`}
                    onValueChange={(v) => {
                      setPageSizeState(Number(v))
                      setPageIndex(0)
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={`${pageSizeState}`} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {Array.from(pageSizeOptions).map((n) => (
                        <SelectItem key={n} value={`${n}`}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="hidden text-sm text-muted-foreground sm:block">
                    条/页
                  </p>
                </div>

                {/* 页码 + 翻页按钮（右侧） */}
                <div className="flex items-center gap-1.5">
                  <div className="mr-2 hidden text-sm font-medium md:block">
                    第 {currentPage} / {totalPages} 页
                  </div>
                  <Button
                    variant="outline"
                    className="size-8 p-0"
                    onClick={() => setPageIndex(0)}
                    disabled={!canPreviousPage}
                    aria-label="第一页"
                  >
                    <ChevronsLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8 p-0"
                    onClick={() =>
                      setPageIndex((p) => Math.max(0, p - 1))
                    }
                    disabled={!canPreviousPage}
                    aria-label="上一页"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>

                  {pageNumbers.map((pageNumber, index) => (
                    <div key={`${pageNumber}-${index}`} className="flex items-center">
                      {pageNumber === "..." ? (
                        <span className="px-1 text-sm text-muted-foreground">
                          ...
                        </span>
                      ) : (
                        <Button
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          className="h-8 min-w-8 px-2"
                          onClick={() =>
                            setPageIndex((pageNumber as number) - 1)
                          }
                        >
                          <span className="sr-only">跳转到第 {pageNumber} 页</span>
                          {pageNumber}
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="size-8 p-0"
                    onClick={() =>
                      setPageIndex((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={!canNextPage}
                    aria-label="下一页"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8 p-0"
                    onClick={() => setPageIndex(totalPages - 1)}
                    disabled={!canNextPage}
                    aria-label="最后一页"
                  >
                    <ChevronsRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// 兼容老调用：RemoteCombobox 式 ComboboxOption -> SkuTableOption 的转换
export function skuOptionsFromComboboxOptions(
  list: Array<{
    value: string
    label: string
    hint?: string
  }>,
): SkuTableOption[] {
  return list.map((it) => ({
    code: it.value,
    name: it.label,
    spec: it.hint ?? "",
  }))
}
