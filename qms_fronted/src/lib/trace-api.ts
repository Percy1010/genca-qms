/**
 * 追溯 - 后端接口客户端。
 *
 * 链路：前端 fetch → qms_backend /api/trace/** → 生产库读取（fangxing 只读账号）。
 * 控制：环境变量 NEXT_PUBLIC_TRACE_API 设为后端地址时走真实接口；
 *       未设置时回退到本地 mock（演示/后端未就绪时使用），保证页面始终可跑。
 */

import { searchMaterials } from "@/lib/mock-forward-trace"

export interface TraceMaterialOption {
  code: string
  name: string
  category?: string
}

const API_BASE = (process.env.NEXT_PUBLIC_TRACE_API ?? "").replace(/\/+$/, "")

/** 是否启用了真实追溯后端 */
export const traceApiEnabled = API_BASE.length > 0

/**
 * 物料主数据远程搜索：编码精确 / 名称模糊。
 * - 真实模式：GET {API_BASE}/api/trace/materials?keyword=&limit=20
 * - 回退模式：本地 mock
 */
export async function searchMaterialsRemote(
  keyword: string,
): Promise<TraceMaterialOption[]> {
  const kw = keyword.trim()
  if (!kw) return []

  if (!traceApiEnabled) {
    return searchMaterials(kw).map((s) => ({
      code: s.code,
      name: s.name,
      category: s.category,
    }))
  }

  const res = await fetch(
    `${API_BASE}/api/trace/materials?keyword=${encodeURIComponent(kw)}&limit=20`,
    { headers: { Accept: "application/json" }, cache: "no-store" },
  )
  if (!res.ok) {
    throw new Error(`物料主数据查询失败：HTTP ${res.status}`)
  }
  // 后端统一响应：ApiResponse{code,message,data}
  const body = (await res.json()) as {
    code?: number
    message?: string
    data?: TraceMaterialOption[]
  }
  if (body.code !== undefined && body.code !== 200) {
    throw new Error(`物料主数据查询失败：${body.message ?? body.code}`)
  }
  return body.data ?? []
}