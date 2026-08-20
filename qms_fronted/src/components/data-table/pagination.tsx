import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { cn, getPageNumbers } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  className?: string
}

/** 数据表格分页：页大小选择 + 页码按钮（移植自 shadcn-admin） */
export function DataTablePagination<TData>({
  table,
  className,
}: DataTablePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 overflow-clip px-2",
        className,
      )}
      style={{ overflowClipMargin: 1 }}
    >
      <div className="flex items-center gap-2">
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value))
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 50, 100].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="hidden text-sm text-muted-foreground sm:block">条/页</p>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="mr-2 hidden text-sm font-medium md:block">
          第 {currentPage} / {totalPages} 页
        </div>
        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          aria-label="第一页"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="上一页"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {pageNumbers.map((pageNumber, index) => (
          <div key={`${pageNumber}-${index}`} className="flex items-center">
            {pageNumber === "..." ? (
              <span className="px-1 text-sm text-muted-foreground">...</span>
            ) : (
              <Button
                variant={currentPage === pageNumber ? "default" : "outline"}
                className="h-8 min-w-8 px-2"
                onClick={() =>
                  table.setPageIndex((pageNumber as number) - 1)
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
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="下一页"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          aria-label="最后一页"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
