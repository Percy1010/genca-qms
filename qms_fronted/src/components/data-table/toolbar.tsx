import { Eraser } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableFacetedFilter } from "./faceted-filter"
import { DataTableViewOptions } from "./view-options"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  searchKeys?: string[]
  extraSearchKey?: string
  extraSearchPlaceholder?: string
  /** 隐藏内置搜索框（用于外部自定义搜索） */
  hideSearch?: boolean
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
  /** 是否显示「列设置」按钮 */
  showColumnSettings?: boolean
}

/** 数据表格工具栏：全局搜索 + 多面筛选 + 重置 + 列设置（移植自 shadcn-admin） */
export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "筛选...",
  searchKey,
  extraSearchKey,
  extraSearchPlaceholder = "筛选...",
  hideSearch = false,
  filters = [],
  showColumnSettings = true,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter
  const useGlobalSearch = !searchKey

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        {!hideSearch &&
          (useGlobalSearch ? (
            <Input
              placeholder={searchPlaceholder}
              value={table.getState().globalFilter ?? ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
          ) : (
            <Input
              placeholder={searchPlaceholder}
              value={
                (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[250px]"
            />
          ))}
        {!hideSearch && extraSearchKey && (
          <Input
            placeholder={extraSearchPlaceholder}
            value={
              (table.getColumn(extraSearchKey)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(extraSearchKey)?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        <div className="flex gap-x-2">
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            )
          })}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter("")
            }}
            className="h-8 px-2 lg:px-3"
            title="清空"
            aria-label="清空"
          >
            <Eraser className="size-4" />
          </Button>
        )}
      </div>
      {showColumnSettings && <DataTableViewOptions table={table} />}
    </div>
  )
}
