"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { TraceReportData } from "@/lib/mock-backward-trace"
import type { ForwardTraceReportData } from "@/lib/mock-forward-trace"
import { authService } from "@/lib/auth/auth-service"
export type ReportSource = "正向追溯" | "逆向追溯"

export type ReportData = TraceReportData | ForwardTraceReportData

export interface StoredReport {
  /** 唯一标识（报告编号 + 时间戳，同报告编号去重更新） */
  key: string
  report: ReportData
  source: ReportSource
  createdAt: string
}

interface ReportContextType {
  /** 已生成的报告列表（新生成在前） */
  reports: StoredReport[]
  /** 是否已完成 localStorage 初始化（供客户端渲染判断） */
  hydrated: boolean
  /** 新增报告；同报告编号则更新而非重复，返回报告 key */
  addReport: (report: ReportData, source: ReportSource) => string
  /** 删除指定报告 */
  removeReport: (key: string) => void
  /** 清空全部 */
  clearReports: () => void
}

const ReportContext = createContext<ReportContextType | null>(null)

const STORAGE_KEY = "qms-reports"

/** 未登录（skipSSO/无 token）时使用的账号姓名回退 */
const MOCK_ACCOUNT_NAME = "张平祥"

/** 当前账号姓名：优先取 SSO 用户信息，缺失时回退到 mock 账号 */
function getCurrentAccountName(): string {
  const info = authService.getAuthData()?.userInfo
  return info?.name?.trim() || info?.uid?.trim() || MOCK_ACCOUNT_NAME
}

/** 格式化时间为 YYYY-MM-DD HH:MM:SS（零填充），如 2026-08-10 15:27:42 */
function formatDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 读取本地存储中的报告 */
function readStoredReports(): StoredReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredReport[]
    if (
      Array.isArray(parsed) &&
      parsed.every((r) => r && r.key && r.report && r.source)
    ) {
      return parsed
    }
  } catch {
    // ignore invalid storage
  }
  return []
}

/**
 * 追溯报告存储：统一保存正向/逆向追溯时生成的报告，
 * 供「追溯报告」页事后统一查询、查看与下载。
 * 持久化到 localStorage，跨会话保留。
 */
export function ReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<StoredReport[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // 与服务端不渲染的 localStorage 同步；模式与 tab-store 保持一致
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReports(readStoredReports())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  }, [reports, hydrated])

  const addReport = useCallback(
    (report: ReportData, source: ReportSource) => {
      const key = `${report.reportNo}`
      const createdAt = formatDateTime(new Date())
      // 生成人员以当前账号姓名为准（覆盖上游硬编码的「质量部 · 系统生成」）
      const stamped: ReportData = {
        ...report,
        generatedBy: getCurrentAccountName(),
      }
      setReports((prev) => {
        const exist = prev.some((p) => p.report.reportNo === report.reportNo)
        if (exist) {
          return prev.map((p) =>
            p.report.reportNo === report.reportNo
              ? { ...p, report: stamped, source, createdAt }
              : p,
          )
        }
        return [{ key, report: stamped, source, createdAt }, ...prev]
      })
      return key
    },
    [],
  )

  const removeReport = useCallback((key: string) => {
    setReports((prev) => prev.filter((r) => r.key !== key))
  }, [])

  const clearReports = useCallback(() => setReports([]), [])

  return (
    <ReportContext.Provider
      value={{ reports, hydrated, addReport, removeReport, clearReports }}
    >
      {children}
    </ReportContext.Provider>
  )
}

export function useReports() {
  const ctx = useContext(ReportContext)
  if (!ctx) throw new Error("useReports must be used within ReportProvider")
  return ctx
}