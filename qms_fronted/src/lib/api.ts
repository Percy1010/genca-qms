"use client"

import { authService } from "./auth/auth-service"

/**
 * 统一的 API 请求客户端：
 * - 自动附加 Authorization: Bearer <SSO token>
 * - 响应统一解包 ApiResponse { code, message, data }
 */
const API_BASE = "/api" // 经 next.config.ts rewrites 代理到后端

export class ApiError extends Error {
  code: number
  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = authService.getAccessToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const body = await res.json().catch(() => null)

  if (!res.ok) {
    if (res.status === 401) {
      // 未认证：清理本地 token，跳转 SSO 重新登录
      localStorage.removeItem("access_token")
      localStorage.removeItem("sso_auth")
      window.location.href = "/"
    }
    throw new ApiError(res.status, body?.message ?? `请求失败 (${res.status})`)
  }

  return body?.data as T
}
