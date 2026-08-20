import type { ReactNode } from "react"
import { Download, Plus, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/** 页面统一外壳：标题 + 描述 + 常用操作按钮 + 内容区 */
export function PageShell({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight">
          {title}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload />
            导入
          </Button>
          <Button variant="outline" size="sm">
            <Download />
            导出
          </Button>
          <Button size="sm">
            <Plus />
            新建
          </Button>
        </div>
      </div>
      {children}
    </div>
  )
}

/** 模块占位内容：统计卡片骨架 + 数据表格骨架 */
export function PageSkeleton({ module = "该模块" }: { module?: string }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardDescription>
                <Skeleton className="h-3 w-24" />
              </CardDescription>
              <CardTitle>
                <Skeleton className="h-8 w-16" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>列表数据区</CardTitle>
          <CardDescription>
            此处将展示「{module}」的表格数据，前后端联调后自动填充。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </>
  )
}
