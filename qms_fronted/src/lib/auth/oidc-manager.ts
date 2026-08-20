"use client"

import { UserManager, WebStorageStateStore, type UserManagerSettings } from "oidc-client-ts"

import { OIDC_CONFIG } from "./oidc-config"

export type OidcReturnState = {
  returnTo?: string
}

const buildSettings = (): UserManagerSettings => {
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  if (!OIDC_CONFIG.authority) {
    throw new Error("缺少 NEXT_PUBLIC_OIDC_AUTHORITY（OIDC authority）配置")
  }
  return {
    authority: OIDC_CONFIG.authority,
    client_id: OIDC_CONFIG.clientId,
    redirect_uri: `${origin}/callback`,
    post_logout_redirect_uri: `${origin}/`,
    response_type: "code",
    response_mode: "query",
    scope: "openid profile api offline_access",
    // PKCE code_verifier / state 存 localStorage，prefix 隔离
    userStore: new WebStorageStateStore({
      store: typeof window !== "undefined" ? window.localStorage : undefined,
      prefix: "oidc.qms.",
    }),
  }
}

let _mgr: UserManager | null = null
export const getOidcManager = (): UserManager => {
  if (!_mgr) {
    _mgr = new UserManager(buildSettings())
  }
  return _mgr
}
