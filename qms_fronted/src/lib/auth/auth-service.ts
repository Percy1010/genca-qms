"use client"

import { jwtDecode } from "jwt-decode"

import { OIDC_CONFIG, CALLBACK_PATH } from "./oidc-config"
import { getOidcManager, type OidcReturnState } from "./oidc-manager"

const AUTH_STORAGE_KEY = "sso_auth"

export interface AuthData {
  accessToken: string
  idToken?: string
  expiresAt: number
  userInfo: UserInfo | null
  returnTo?: string
}

export interface UserInfo {
  sub: string
  /** 员工工号（IPC 后端从 token 的 uid claim 读取） */
  uid?: string
  name?: string
  email?: string
}

interface IdTokenPayload {
  sub?: string
  uid?: string
  name?: string
  email?: string
  exp?: number
}

const hasWindow = () => typeof window !== "undefined"

const getTokenExpMs = (accessToken: string): number | null => {
  try {
    const decoded = jwtDecode<IdTokenPayload>(accessToken)
    return typeof decoded?.exp === "number" ? decoded.exp * 1000 : null
  } catch {
    return null
  }
}

const safeReturnTo = (returnTo: unknown): string => {
  if (typeof returnTo !== "string") return "/"
  if (!returnTo.startsWith("/")) return "/"
  if (returnTo.startsWith("//")) return "/"
  if (returnTo.toLowerCase().startsWith(CALLBACK_PATH)) return "/"
  return returnTo
}

export const authService = {
  /**
   * 发起单点登录跳转。若本地已有未过期 token 或开启了 skipSSO 则跳过。
   */
  initiateLogin: async (opts?: { returnTo?: string }): Promise<void> => {
    if (OIDC_CONFIG.skipSSO) return
    if (authService.isAuthenticated()) return
    const returnTo = safeReturnTo(
      opts?.returnTo ?? window.location.pathname + window.location.search
    )
    const mgr = getOidcManager()
    await mgr.signinRedirect({ state: { returnTo } satisfies OidcReturnState })
  },

  /**
   * 认证中心回跳到 /callback 后调用，用 code 换取 token。
   */
  handleCallback: async (): Promise<AuthData> => {
    const mgr = getOidcManager()
    const user = await mgr.signinRedirectCallback()
    const accessToken = user.access_token
    if (!accessToken) {
      throw new Error("SSO 登录失败：未获取到 access_token")
    }

    const decoded = jwtDecode<IdTokenPayload>(accessToken)
    const expiresAt =
      typeof decoded?.exp === "number" ? decoded.exp * 1000 : Date.now() + 3600_000

    const authData: AuthData = {
      accessToken,
      idToken: user.id_token,
      expiresAt,
      userInfo: decoded
        ? {
            sub: String(decoded.sub ?? ""),
            uid: decoded.uid ? String(decoded.uid) : undefined,
            name: decoded.name,
            email: decoded.email,
          }
        : null,
      returnTo: (user.state as OidcReturnState | null)?.returnTo,
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData))
    localStorage.setItem("access_token", accessToken)
    return authData
  },

  /**
   * 退出登录：先通知后端失效 token，再跳转认证中心登出。
   */
  logout: async (): Promise<void> => {
    let idToken: string | undefined
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      try {
        const authData = JSON.parse(stored) as AuthData
        idToken = authData.idToken
      } catch {
        // ignore
      }
    }

    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem("access_token")

    if (OIDC_CONFIG.skipSSO) {
      window.location.href = "/"
      return
    }
    try {
      const mgr = getOidcManager()
      await mgr.signoutRedirect(idToken ? { id_token_hint: idToken } : undefined)
    } catch {
      window.location.href = "/"
    }
  },

  getAuthData: (): AuthData | null => {
    if (!hasWindow()) return null
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) return null
    try {
      const authData = JSON.parse(stored) as AuthData
      if (authData.expiresAt < Date.now()) {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        localStorage.removeItem("access_token")
        return null
      }
      return authData
    } catch {
      return null
    }
  },

  isAuthenticated: (): boolean => {
    if (!hasWindow()) return false
    const token = localStorage.getItem("access_token")
    if (!token || !token.trim()) return false
    const expMs = getTokenExpMs(token)
    if (expMs !== null && expMs < Date.now()) return false
    return true
  },

  getAccessToken: (): string | null => {
    if (!hasWindow()) return null
    const token = localStorage.getItem("access_token")
    return token && token.trim() ? token : null
  },

  getPostLoginPath: (): string => {
    return safeReturnTo(authService.getAuthData()?.returnTo)
  },
}
