"use client"

import { useEffect, useSyncExternalStore, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

import { CALLBACK_PATH, OIDC_CONFIG } from "@/lib/auth/oidc-config"
import { authService } from "@/lib/auth/auth-service"

/** SSR 安全的"已挂载"信号：服务端为 false，客户端挂载后为 true */
const useHasHydrated = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

/**
 * 登录守卫（等价于 IPC 项目的 AuthGate）：
 * - 未登录访问业务页面时自动跳转认证中心 SSO 登录，登录后回跳原页面
 * - /callback 页放行（登录回跳处理页）
 * - 开发环境可配置 NEXT_PUBLIC_SKIP_SSO=true 跳过
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hasHydrated = useHasHydrated()
  const isCallbackPath = pathname.toLowerCase().startsWith(CALLBACK_PATH)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated =
    hasHydrated && !isCallbackPath && !OIDC_CONFIG.skipSSO && authService.isAuthenticated()

  useEffect(() => {
    if (!hasHydrated || isCallbackPath || OIDC_CONFIG.skipSSO) return
    if (authService.isAuthenticated()) return
    let cancelled = false
    ;(async () => {
      try {
        await authService.initiateLogin({
          returnTo: pathname + window.location.search,
        })
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "发起单点登录失败")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [hasHydrated, isCallbackPath, pathname])

  // 已登录或放行路径 → 渲染业务页面
  if (isCallbackPath || OIDC_CONFIG.skipSSO || isAuthenticated) {
    return <>{children}</>
  }

  // 未挂载或未登录 → 显示跳转提示（或配置错误）
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-4">
      {error ? (
        <div className="w-full max-w-md rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <h2 className="mb-2 text-base font-semibold text-destructive">
            无法跳转到单点登录
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground/80">
            请检查：<br />
            1) 环境变量是否配置了 NEXT_PUBLIC_OIDC_AUTHORITY
            <br />
            2) 认证中心是否已白名单回调地址（{window.location.origin}/callback）
          </p>
        </div>
      ) : (
        <>
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">正在跳转单点登录...</p>
        </>
      )}
    </div>
  )
}
