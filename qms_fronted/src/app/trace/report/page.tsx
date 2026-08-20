"use client"

import React, { useState, useMemo, useEffect, useRef, use } from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import { ChevronLeft, Eraser, FileClock, FileText, PlusCircle, Printer, Trash2, Truck } from "lucide-react"
import { toast } from "sonner"

import { DataTable } from "@/components/data-table/data-table"
import { cn } from "@/lib/utils"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageBody, PageHeader } from "@/components/page-header"
import { categoryBadge } from "@/components/trace/trace-sections"
import {
  useReports,
  type StoredReport,
  type ReportSource,
  type ReportData,
} from "@/lib/report-store"
import type {
  StockInRecord,
  StockOutRecord,
  DownstreamProduct,
  SalesRecord,
  ForwardTraceReportData,
} from "@/lib/mock-forward-trace"

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  正常: "default",
  合格: "default",
  待检: "secondary",
  冻结: "destructive",
  不合格: "destructive",
}

const sourceVariant: Record<ReportSource, "default" | "secondary"> = {
  正向追溯: "default",
  逆向追溯: "secondary",
}

/** tanstack 8.21 异构 accessor 列的显式拓宽（与 trace-sections 一致） */
function toColumns<TData>(cols: unknown): ColumnDef<TData, unknown>[] {
  return cols as ColumnDef<TData, unknown>[]
}

/** 「报告来源」多选筛选下拉：交互样式与正向追溯各模块的筛选一致（外部受控） */
function SourceMultiSelect({
  value,
  onChange,
}: {
  value: string[]
  onChange: (v: string[]) => void
}) {
  const options: { value: ReportSource }[] = [
    { value: "正向追溯" },
    { value: "逆向追溯" },
  ]
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="size-4" />
          报告来源
          {value.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {value.length}
              </Badge>
              <div className="hidden space-x-1 sm:flex">
                {value.length > 1 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    已选 {value.length} 项
                  </Badge>
                ) : (
                  value.map((v) => (
                    <Badge
                      variant="secondary"
                      key={v}
                      className="rounded-sm px-1 font-normal"
                    >
                      {v}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-50 p-0" align="start">
        <Command>
          <CommandInput placeholder="报告来源" />
          <CommandList>
            <CommandEmpty>未找到匹配项。</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = value.includes(opt.value)
                return (
                  <CommandItem
                    key={opt.value}
                    onSelect={() =>
                      onChange(
                        isSelected
                          ? value.filter((v) => v !== opt.value)
                          : [...value, opt.value],
                      )
                    }
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <span className="text-background">
                        {isSelected ? "✓" : ""}
                      </span>
                    </div>
                    <span>{opt.value}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {value.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="justify-center text-center"
                  >
                    清除筛选
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function ReportSectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof FileText
  children: React.ReactNode
}) {
  return (
    <div className="mb-3 flex items-center gap-2 border-b pb-3">
      <Icon className="size-4 text-muted-foreground" />
      <h3 className="text-sm font-semibold">{children}</h3>
    </div>
  )
}

/* ==================== 正向追溯报告明细（内容与正向追溯页面完全对应） ==================== */

function FwdStockInTable({ rows }: { rows: StockInRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>入库单号</TableHead>
          <TableHead>委外加工商</TableHead>
          <TableHead>业务类型</TableHead>
          <TableHead>作业类型</TableHead>
          <TableHead>单据类型</TableHead>
          <TableHead>入库日期</TableHead>
          <TableHead className="text-right">数量</TableHead>
          <TableHead>单位</TableHead>
          <TableHead>源单单号</TableHead>
          <TableHead>订单编号</TableHead>
          <TableHead>供应商</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={`${r.stockInNo}-${i}`}>
            <TableCell className="whitespace-nowrap font-mono text-xs">{r.stockInNo}</TableCell>
            <TableCell className="max-w-[150px] truncate">{r.provider || "-"}</TableCell>
            <TableCell><Badge variant="outline">{r.businessType}</Badge></TableCell>
            <TableCell>{r.workType}</TableCell>
            <TableCell>{r.docType}</TableCell>
            <TableCell className="whitespace-nowrap">{r.date}</TableCell>
            <TableCell className="text-right">{(r.qty ?? 0).toLocaleString()}</TableCell>
            <TableCell className="whitespace-nowrap">{r.unit}</TableCell>
            <TableCell className="whitespace-nowrap font-mono text-xs">{r.sourceOrder}</TableCell>
            <TableCell className="whitespace-nowrap font-mono text-xs">{r.orderNo || "-"}</TableCell>
            <TableCell className="max-w-[150px] truncate">{r.supplier || "-"}</TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={11} className="py-5 text-center text-muted-foreground">无入库记录</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function FwdStockOutTable({ rows }: { rows: StockOutRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>出库单号</TableHead>
          <TableHead>委外加工商</TableHead>
          <TableHead>业务类型</TableHead>
          <TableHead>作业类型</TableHead>
          <TableHead>单据类型</TableHead>
          <TableHead>出库日期</TableHead>
          <TableHead className="text-right">数量</TableHead>
          <TableHead>单位</TableHead>
          <TableHead>源单单号</TableHead>
          <TableHead>订单编号</TableHead>
          <TableHead>供应商</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={`${r.stockOutNo}-${i}`}>
            <TableCell className="whitespace-nowrap font-mono text-xs">{r.stockOutNo}</TableCell>
            <TableCell className="max-w-[150px] truncate">{r.provider || "-"}</TableCell>
            <TableCell><Badge variant="outline">{r.businessType}</Badge></TableCell>
            <TableCell>{r.workType}</TableCell>
            <TableCell>{r.docType}</TableCell>
            <TableCell className="whitespace-nowrap">{r.date}</TableCell>
            <TableCell className="text-right">{(r.qty ?? 0).toLocaleString()}</TableCell>
            <TableCell className="whitespace-nowrap">{r.unit}</TableCell>
            <TableCell className="whitespace-nowrap font-mono text-xs">{r.sourceOrder}</TableCell>
            <TableCell className="whitespace-nowrap font-mono text-xs">{r.orderNo || "-"}</TableCell>
            <TableCell className="max-w-[150px] truncate">{r.supplier || "-"}</TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={11} className="py-5 text-center text-muted-foreground">无出库记录</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function FwdOutputTable({ rows }: { rows: DownstreamProduct[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>产品编码</TableHead>
          <TableHead>产品名称</TableHead>
          <TableHead>产品类型</TableHead>
          <TableHead>生产批次</TableHead>
          <TableHead className="text-right">数量</TableHead>
          <TableHead>单位</TableHead>
          <TableHead>生产日期</TableHead>
          <TableHead>生产工厂</TableHead>
          <TableHead>状态</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((o, i) => (
          <TableRow key={`${o.code}-${o.batchNo}-${i}`}>
            <TableCell className="whitespace-nowrap font-mono text-xs">{o.code}</TableCell>
            <TableCell className="max-w-[220px] truncate">{o.name}</TableCell>
            <TableCell><Badge variant="outline" className={categoryBadge[o.category]}>{o.category}</Badge></TableCell>
            <TableCell className="whitespace-nowrap font-mono text-xs">{o.batchNo}</TableCell>
            <TableCell className="text-right">{(o.qty ?? 0).toLocaleString()}</TableCell>
            <TableCell className="whitespace-nowrap">{o.unit}</TableCell>
            <TableCell className="whitespace-nowrap">{o.date}</TableCell>
            <TableCell className="max-w-[150px] truncate">{o.provider}</TableCell>
            <TableCell><Badge variant={statusVariant[o.status]}>{o.status}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function FwdSalesTable({ rows }: { rows: SalesRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>订单编号</TableHead>
          <TableHead>渠道</TableHead>
          <TableHead>店铺</TableHead>
          <TableHead>平台货品</TableHead>
          <TableHead>规格</TableHead>
          <TableHead>交易日期</TableHead>
          <TableHead className="text-right">数量</TableHead>
          <TableHead className="text-right">单价</TableHead>
          <TableHead className="text-right">金额</TableHead>
          <TableHead>客户地区</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((s, i) => (
          <TableRow key={`${s.orderNo}-${i}`}>
            <TableCell className="whitespace-nowrap font-mono text-xs">{s.orderNo}</TableCell>
            <TableCell><Badge variant="secondary">{s.channel}</Badge></TableCell>
            <TableCell className="whitespace-nowrap">{s.shopName}</TableCell>
            <TableCell className="max-w-[200px] truncate">{s.goodsName}</TableCell>
            <TableCell className="max-w-[160px] truncate">{s.specName}</TableCell>
            <TableCell className="whitespace-nowrap">{s.date}</TableCell>
            <TableCell className="text-right">{(s.qty ?? 0).toLocaleString()}</TableCell>
            <TableCell className="text-right">{(s.price ?? 0).toLocaleString()}</TableCell>
            <TableCell className="text-right">{(s.amount ?? 0).toLocaleString()}</TableCell>
            <TableCell className="max-w-[140px] truncate">{s.customer || "-"}</TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={10} className="py-5 text-center text-muted-foreground">无销售去向记录</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function ForwardReportDocument({ report }: { report: ForwardTraceReportData }) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* ===== 报告抬头 ===== */}
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-wide">Genca 化妆品产品追溯报告</h2>
        <p className="mt-1 text-sm text-muted-foreground">Cosmetic Product Traceability Report</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>报告编号：<span className="font-mono font-semibold text-foreground">{report.reportNo}</span></span>
          <span>生成时间：<span className="font-medium text-foreground">{report.generatedAt}</span></span>
          <span>生成人：<span className="font-medium text-foreground">{report.generatedBy}</span></span>
        </div>
      </div>

      {/* ===== 一、产品基本信息 ===== */}
      <Card>
        <CardContent className="p-5">
          <ReportSectionTitle icon={FileText}>一、产品基本信息</ReportSectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            {[
              ["产品编码", report.productCode],
              ["产品名称", report.productName],
              ["产品类型", report.productCategory],
              ["规格", report.productSpec],
              ["批次号", report.batchNo],
              ["批次数量", report.batchQty],
              ["生产日期", report.productionDate],
              ["存放仓库", report.warehouse],
              ["追溯起点", "本批次"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-2">
                <span className="shrink-0 text-muted-foreground">{label}</span>
                <span className="truncate text-right font-medium">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== 二、正向追溯链路 ===== */}
      <Card>
        <CardContent className="p-5">
          <ReportSectionTitle icon={FileText}>
            二、正向追溯链路（{report.chain.length} 个节点 · 产出物 {report.totalOutput} · 销售 {report.totalSales} 条）
          </ReportSectionTitle>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>序号</TableHead>
                <TableHead>产品编码</TableHead>
                <TableHead>产品名称</TableHead>
                <TableHead>产品类型</TableHead>
                <TableHead>批次号</TableHead>
                <TableHead className="text-right">当前库存</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>生产日期</TableHead>
                <TableHead>委外 / 供应商</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.chain.map((n, idx) => (
                <TableRow key={`${n.code}-${n.batchNo}`}>
                  <TableCell><span className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">{idx + 1}</span></TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs font-semibold">{n.code}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{n.name}</TableCell>
                  <TableCell><Badge variant="outline" className={categoryBadge[n.category]}>{n.category}</Badge></TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs">{n.batchNo}</TableCell>
                  <TableCell className="text-right">{n.qty}</TableCell>
                  <TableCell><Badge variant={statusVariant[n.status]}>{n.status}</Badge></TableCell>
                  <TableCell className="whitespace-nowrap">{n.productionDate}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{n.provider}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ===== 三、各节点追溯明细 ===== */}
      <Card>
        <CardContent className="p-5">
          <ReportSectionTitle icon={FileText}>
            三、追溯明细（按链路节点：入库 / 出库 / 生产产出物 / 销售去向）
          </ReportSectionTitle>
          <div className="space-y-6">
            {report.chain.map((n, idx) => (
              <div key={`${n.code}-${n.batchNo}`} className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    {idx + 1}
                  </span>
                  <Badge variant="outline" className={categoryBadge[n.category]}>{n.category}</Badge>
                  <span className="text-sm font-semibold">{n.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{n.code} · {n.batchNo}</span>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">● 入库记录（{n.stockIn.length}）</div>
                  <FwdStockInTable rows={n.stockIn} />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">● 出库记录（{n.stockOut.length}）</div>
                  <FwdStockOutTable rows={n.stockOut} />
                </div>

                {n.outputs.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">● 生产产出物 / 下游（{n.outputs.length}）</div>
                    <FwdOutputTable rows={n.outputs} />
                  </div>
                )}

                {n.sales.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">● 销售去向（{n.sales.length}）</div>
                    <FwdSalesTable rows={n.sales} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== 声明与签章 ===== */}
      <div className="flex flex-col gap-1 rounded-lg border border-dashed p-4 text-xs text-muted-foreground">
        <p>
          本报告依据企业《产品追溯管理程序》自动生成，从起点批次向下逐层追踪
          生产产出物与销售去向，涵盖各节点的入库、出库、生产投产与平台销售明细，
          用于批次核查、渠道分销管理与监管检查。任何批次信息如有疑问请联系质量部。
        </p>
        <p className="mt-2 text-right">
          质量部（盖章）：____________　审核人：____________　日期：____________
        </p>
      </div>
    </div>
  )
}

function ReportDocument({ report }: { report: ReportData }) {
  if (report.direction === "forward") {
    return <ForwardReportDocument report={report} />
  }
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* ===== 报告抬头 ===== */}
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-wide">Genca 化妆品产品追溯报告</h2>
        <p className="mt-1 text-sm text-muted-foreground">Cosmetic Product Traceability Report</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            报告编号：<span className="font-mono font-semibold text-foreground">{report.reportNo}</span>
          </span>
          <span>
            生成时间：<span className="font-medium text-foreground">{report.generatedAt}</span>
          </span>
          <span>
            生成人：<span className="font-medium text-foreground">{report.generatedBy}</span>
          </span>
        </div>
      </div>

      {/* ===== 一、产品基本信息 ===== */}
      <Card>
        <CardContent className="p-5">
          <ReportSectionTitle icon={FileText}>一、产品基本信息</ReportSectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            {[
              ["产品编码", report.productCode],
              ["产品名称", report.productName],
              ["产品类型", report.productCategory],
              ["规格", report.productSpec],
              ["成品批次号", report.batchNo],
              ["批次数量", report.batchQty],
              ["生产日期", report.productionDate],
              ["存放仓库", report.warehouse],
              ["追溯起点", "本批次"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-2">
                <span className="shrink-0 text-muted-foreground">{label}</span>
                <span className="truncate text-right font-medium">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== 二、追溯链总览 ===== */}
      <Card>
        <CardContent className="p-5">
          <ReportSectionTitle icon={FileText}>
            二、追溯链总览（{report.chainLevels.length} 层，自上而下）
          </ReportSectionTitle>
          <div className="space-y-4">
            {report.chainLevels.map((level, idx) => (
              <div key={level.title}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                    {idx + 1}
                  </span>
                  <Badge variant="outline" className={categoryBadge[level.category]}>
                    {level.category}
                  </Badge>
                  <span className="text-sm font-medium text-muted-foreground">
                    {level.title}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {level.nodes.length} 个批次
                  </span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>编码</TableHead>
                      <TableHead>名称</TableHead>
                      <TableHead>批次号</TableHead>
                      <TableHead className="text-right">数量</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {level.nodes.map((n) => (
                      <TableRow key={`${n.code}-${n.batchNo}`}>
                        <TableCell className="whitespace-nowrap font-mono text-xs font-semibold">
                          {n.code}
                        </TableCell>
                        <TableCell className="max-w-[260px] truncate">{n.name}</TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-xs">
                          {n.batchNo}
                        </TableCell>
                        <TableCell className="text-right">{n.qty}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[n.status]}>{n.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== 三、生产履历 ===== */}
      <Card>
        <CardContent className="p-5">
          <ReportSectionTitle icon={FileText}>三、生产履历（生产/委外/组合订单）</ReportSectionTitle>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>生产订单</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>产出产品</TableHead>
                <TableHead>批次</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead>日期</TableHead>
                <TableHead>工厂 / 供应商</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.productionOrders.map((p, i) => (
                <TableRow key={`${p.orderNo}-${p.batchNo}-${i}`}>
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {p.orderNo}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.orderType}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{p.goodsName}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {p.batchNo}
                  </TableCell>
                  <TableCell className="text-right">{p.qty}</TableCell>
                  <TableCell className="whitespace-nowrap">{p.date}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{p.provider}</TableCell>
                </TableRow>
              ))}
              {report.productionOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                    暂无生产履历
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ===== 四、质量检验记录 ===== */}
      <Card>
        <CardContent className="p-5">
          <ReportSectionTitle icon={FileText}>四、质量检验记录</ReportSectionTitle>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>检验阶段</TableHead>
                <TableHead>检验单号</TableHead>
                <TableHead>检验员</TableHead>
                <TableHead>检验日期</TableHead>
                <TableHead>结果</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.inspections.map((i) => (
                <TableRow key={i.recordNo}>
                  <TableCell>{i.stage}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {i.recordNo}
                  </TableCell>
                  <TableCell>{i.inspector}</TableCell>
                  <TableCell>{i.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[i.result]}>{i.result}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ===== 五、原料/包材供应商及资质 ===== */}
      <Card>
        <CardContent className="p-5">
          <ReportSectionTitle icon={Truck}>五、原料 / 包材供应商及资质文件</ReportSectionTitle>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>物料</TableHead>
                <TableHead>批次</TableHead>
                <TableHead>供应商</TableHead>
                <TableHead>资质文件（COA）</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.suppliers.map((s, i) => (
                <TableRow key={`${s.batch}-${i}`}>
                  <TableCell className="max-w-[260px] truncate">{s.material}</TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {s.batch}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{s.supplier}</TableCell>
                  <TableCell>{s.cert}</TableCell>
                </TableRow>
              ))}
              {report.suppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    无采购类物料
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ===== 声明与签章 ===== */}
      <div className="flex flex-col gap-1 rounded-lg border border-dashed p-4 text-xs text-muted-foreground">
        <p>
          本报告依据企业《产品追溯管理程序》自动生成，从成品批次出发逐层还原
          半成品、原料与包材来源，涵盖生产/委外订单、质量检验与供应商资质，
          用于批次召回、客诉核查与监管检查。任何批次信息如有疑问请联系质量部。
        </p>
        <p className="mt-2 text-right">
          质量部（盖章）：____________　审核人：____________　日期：____________
        </p>
      </div>
    </div>
  )
}

export default function TraceReportPage({
  searchParams,
}: {
  searchParams: Promise<{ reportNo?: string }>
}) {
  const params = use(searchParams)
  const { reports, hydrated } = useReports()
  // 查询条件：text 为「物料编码或名称」，batch 为批次编号；sources 为选中的报告来源
  const [query, setQuery] = useState({ text: "", batch: "" })
  const [sources, setSources] = useState<string[]>([])
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const { removeReport } = useReports()
  // 右键菜单：菜单定位坐标 + 目标报告；null 表示关闭
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    report: StoredReport
  } | null>(null)
  // 待删除确认的报告
  const [confirmDelete, setConfirmDelete] = useState<StoredReport | null>(null)
  const pageRef = React.useRef<HTMLDivElement>(null)
  // 自动打开标记：仅在进入时消费一次查询参数，避免关闭后因状态变化重新弹回详情
  const didAutoOpen = useRef<string | null>(null)

  const selected = selectedKey
    ? (reports.find((r) => r.key === selectedKey) ?? null)
    : null

  /* 生成报告后自动打开详情：根据 ?reportNo= 定位报告并展示，可关闭（返回列表）或继续查看 */
  useEffect(() => {
    if (!hydrated) return
    const reportNo = params?.reportNo
    if (!reportNo) return
    if (didAutoOpen.current === reportNo) return
    const hit = reports.find((r) => r.report.reportNo === reportNo)
    if (!hit) return
    didAutoOpen.current = reportNo
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedKey(hit.key)
  }, [hydrated, reports, params?.reportNo])

  const filtered = useMemo(() => {
    const text = query.text.trim().toLowerCase()
    const batch = query.batch.trim().toLowerCase()
    return reports.filter((r) => {
      if (sources.length > 0 && !sources.includes(r.source)) return false
      const p = r.report
      // 批次编号：精确匹配
      if (batch && p.batchNo.trim().toLowerCase() !== batch) return false
      // 物料编码（精确）或名称（模糊）
      if (text) {
        const codeOk = p.productCode.trim().toLowerCase() === text
        const nameOk = p.productName.toLowerCase().includes(text)
        if (!codeOk && !nameOk) return false
      }
      return true
    })
  }, [reports, query, sources])

  /** 是否存在可重置的筛选/查询条件 */
  const hasFilter = Boolean(
    query.text.trim() || query.batch.trim() || sources.length > 0,
  )

  /* ---------- 报告列表列定义（无注解数组，经 toColumns 拓宽后交给 DataTable） ---------- */
  const reportHelper = createColumnHelper<StoredReport>()
  const reportColumns = [
    reportHelper.accessor("report.reportNo", {
      header: "报告编号",
      cell: ({ getValue, row }) => (
        <button
          type="button"
          onClick={() => setSelectedKey(row.original.key)}
          title="查看报告详情"
          className="whitespace-nowrap font-mono text-xs font-semibold text-primary transition-colors hover:underline"
        >
          {getValue<string>()}
        </button>
      ),
    }),
    reportHelper.accessor("source", {
      header: "报告来源",
      cell: ({ getValue }) => (
        <Badge variant={sourceVariant[getValue<ReportSource>()]}>
          {getValue<string>()}
        </Badge>
      ),
    }),
    reportHelper.accessor("report.productCode", {
      header: "物料编码",
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap font-mono text-xs">
          {getValue<string>()}
        </span>
      ),
    }),
    reportHelper.accessor("report.productName", {
      header: "物料名称",
      cell: ({ getValue }) => (
        <span className="block max-w-[280px] truncate">
          {getValue<string>()}
        </span>
      ),
    }),
    reportHelper.accessor("report.batchNo", {
      header: "批次编号",
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap font-mono text-xs">
          {getValue<string>()}
        </span>
      ),
    }),
    reportHelper.accessor("createdAt", {
      header: "生成时间",
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {getValue<string>()}
        </span>
      ),
    }),
    reportHelper.accessor("report.generatedBy", {
      header: "生成人员",
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap">{getValue<string>()}</span>
      ),
    }),
  ]

  /* ---------- 右键菜单：行内右键 → 显示「删除」菜单 ---------- */
  const handleRowContextMenu = (
    record: StoredReport,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    event.preventDefault()
    // 阻止冒泡到外层容器的 onContextMenu（否则菜单会被立即关闭）
    event.stopPropagation()
    // 限制菜单定位在视口内，避免超出屏幕边缘
    const x = Math.min(event.clientX, window.innerWidth - 176 - 8)
    const y = Math.min(event.clientY, window.innerHeight - 60 - 8)
    setContextMenu({ x, y, report: record })
  }

  /** 点击「删除」→ 关闭右键菜单并打开二次确认弹框 */
  const openDeleteConfirm = () => {
    if (!contextMenu) return
    setConfirmDelete(contextMenu.report)
    setContextMenu(null)
  }

  /** 用户确认后删除报告 */
  const handleConfirmDelete = () => {
    if (!confirmDelete) return
    removeReport(confirmDelete.key)
    setConfirmDelete(null)
    toast.success(`报告「${confirmDelete.report.reportNo}」已删除`)
  }

  // 点击其他区域 / 滚动 / 窗口失焦时自动关闭右键菜单
  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    document.addEventListener("click", close)
    document.addEventListener("scroll", close, true)
    window.addEventListener("resize", close)
    window.addEventListener("blur", close)
    return () => {
      document.removeEventListener("click", close)
      document.removeEventListener("scroll", close, true)
      window.removeEventListener("resize", close)
      window.removeEventListener("blur", close)
    }
  }, [contextMenu])

  return (
    <div
      className="flex flex-1 flex-col gap-6"
      onContextMenu={(e) => {
        // 页面空白处右键：仅关闭已打开的菜单，不拦截默认行为
        if (contextMenu) e.preventDefault()
        setContextMenu(null)
      }}
    >
      <PageHeader
        title="追溯报告"
      />
      <PageBody ref={pageRef}>
        <div className="flex flex-1 flex-col gap-6">
          {!hydrated ? (
            <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 py-12">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="h-56 w-full animate-pulse rounded-xl bg-muted/50" />
            </div>
          ) : selected ? (
            /* ===== 报告详情 ===== */
            <div className="space-y-4">
              <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedKey(null)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronLeft />
                  报告列表
                </button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileClock className="size-4" />
                  {selected.report.reportNo}
                  · {selected.source}
                </div>
                <Button onClick={() => window.print()}>
                  <Printer />
                  打印 / 导出 PDF
                </Button>
              </div>
              <ReportDocument report={selected.report} />
            </div>
          ) : (
            /* ===== 历史追溯报告列表：查询区在灰色边框之上，列表在灰色线框内 ===== */
            <>
              {/* 查询区（边框之上）与列表间距保持紧凑，避免产生过大的垂直缝隙 */}
              <div className="flex flex-col gap-2.5">
              {/* 查询区（边框之上） */}
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  placeholder="物料编码或名称"
                  value={query.text}
                  onChange={(e) =>
                    setQuery((q) => ({ ...q, text: e.target.value }))
                  }
                  className="h-8 w-[280px] lg:w-[360px]"
                />
                <Input
                  placeholder="批次编号"
                  value={query.batch}
                  onChange={(e) =>
                    setQuery((q) => ({ ...q, batch: e.target.value }))
                  }
                  className="h-8 w-[200px]"
                />
                <SourceMultiSelect value={sources} onChange={setSources} />
                {hasFilter && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    title="清空"
                    aria-label="清空"
                    onClick={() => {
                      setQuery({ text: "", batch: "" })
                      setSources([])
                    }}
                  >
                    <Eraser className="size-4" />
                  </Button>
                )}
              </div>

              {/* 列表区：DataTable 自带表格线框 */}
              <DataTable
                columns={toColumns<StoredReport>(reportColumns)}
                data={filtered}
                hideSearch
                sortable={false}
                tableClassName="min-w-[1000px]"
                onRowContextMenu={handleRowContextMenu}
                storageKey="trace.report.list"
              />
              </div>
            </>
          )}
        </div>
      </PageBody>

      {/* ===== 右键菜单：定位在鼠标坐标，直接显示操作按钮 ===== */}
      {contextMenu && (
        <div
          className="fixed z-50 min-w-[140px] overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            type="button"
            onClick={openDeleteConfirm}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
            删除
          </button>
        </div>
      )}

      {/* ===== 二次确认弹框：确认后删除报告 ===== */}
      <AlertDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null)
        }}
      >
        {/* 默认尺寸：文案左对齐，按钮右对齐且宽度自适应文字 */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认操作</AlertDialogTitle>
            <AlertDialogDescription>
              报告删除后不可恢复，是否确认删除？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-2.5">
            <AlertDialogCancel onClick={() => setConfirmDelete(null)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}