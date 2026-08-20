"use client"

import Link from "next/link"
import {
  Award,
  BadgeCheck,
  BarChart3,
  Package,
  PackageSearch,
  Wrench,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  MonthlyInspectionChart,
  SupplierQualityDonut,
} from "@/components/dashboard/quality-charts"
import { authService } from "@/lib/auth/auth-service"

// 演示数据：后续接入后端 /api 后替换为真实接口
const stats = [
  { title: "待检任务", value: 12, desc: "今日新增 3 条", icon: Package, tone: "text-sky-600" },
  { title: "供应商整改", value: 3, desc: "2 项已超期", icon: Wrench, tone: "text-amber-600" },
  { title: "追溯报告", value: 2, desc: "本周待生成", icon: PackageSearch, tone: "text-emerald-600" },
] as const

const shortcuts = [
  { title: "原物料检验", desc: "原物料到货检验任务", url: "/inspection/raw-material", icon: Package },
  { title: "产品追溯", desc: "正向 / 逆向追溯、追溯报告", url: "/trace/forward", icon: PackageSearch },
  { title: "供应商准入", desc: "供应商准入申请与评估", url: "/supplier/admission", icon: BadgeCheck },
  { title: "供应商绩效", desc: "供应商考核与评级", url: "/supplier/performance", icon: BarChart3 },
] as const

export default function Home() {
  const userInfo = authService.getAuthData()?.userInfo
  const userName = userInfo?.name || "用户"
  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* 欢迎区 */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">你好，{userName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {today} · 今天有 {stats[0].value} 项待办需要处理
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
              <s.icon className={`size-4 ${s.tone}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 质量趋势图表 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="size-4 text-muted-foreground" />
              月度检验趋势
            </CardTitle>
            <CardDescription>近 7 个月检验批次与合格批次对比</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyInspectionChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Award className="size-4 text-muted-foreground" />
              供应商绩效分布
            </CardTitle>
            <CardDescription>按年度绩效评级统计供应商数量</CardDescription>
          </CardHeader>
          <CardContent>
            <SupplierQualityDonut />
          </CardContent>
        </Card>
      </div>

      {/* 快捷入口 */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          快捷入口
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((sc) => (
            <Link key={sc.title} href={sc.url}>
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <sc.icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{sc.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {sc.desc}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
