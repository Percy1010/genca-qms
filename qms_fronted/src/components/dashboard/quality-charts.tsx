"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

/** 月度检验量趋势（演示数据，后续接入后端 /api） */
const monthlyData = [
  { month: "1月", 检验批次: 128, 合格批次: 118 },
  { month: "2月", 检验批次: 96, 合格批次: 90 },
  { month: "3月", 检验批次: 143, 合格批次: 132 },
  { month: "4月", 检验批次: 161, 合格批次: 150 },
  { month: "5月", 检验批次: 152, 合格批次: 144 },
  { month: "6月", 检验批次: 178, 合格批次: 166 },
  { month: "7月", 检验批次: 194, 合格批次: 182 },
]

/** 供应商绩效分布（演示数据） */
const supplierData = [
  { name: "A 级", value: 18, color: "var(--chart-1)" },
  { name: "B 级", value: 26, color: "var(--chart-2)" },
  { name: "C 级", value: 9, color: "var(--chart-3)" },
  { name: "D 级（需整改）", value: 4, color: "var(--chart-5)" },
]

/** 月度检验量与合格批次柱状图 */
export function MonthlyInspectionChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={monthlyData} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
        <XAxis
          dataKey="month"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={36}
          className="text-muted-foreground"
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="检验批次" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="合格批次" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/** 供应商绩效等级分布环形图 */
export function SupplierQualityDonut() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={supplierData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
        >
          {supplierData.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
