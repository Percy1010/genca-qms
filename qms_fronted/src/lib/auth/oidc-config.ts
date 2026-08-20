/**
 * OIDC 单点登录配置。
 *
 * 对齐 Genca 内部 IPC 项目的 SSO 方案（oidc-client-ts，Authorization Code + PKCE）。
 * 环境变量在 Next.js 客户端组件中必须使用 NEXT_PUBLIC_ 前缀（见 .env.local.example）。
 */
export const OIDC_CONFIG = {
  /** 认证中心 authority（必须能访问 /.well-known/openid-configuration） */
  authority: process.env.NEXT_PUBLIC_OIDC_AUTHORITY as string | undefined,
  /** 本应用在认证中心注册的 client_id（需在认证中心申请，如 qms_frontend） */
  clientId: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID || "qms_frontend",
  /** 开发调试开关：true 时不自动跳转 SSO */
  skipSSO: String(process.env.NEXT_PUBLIC_SKIP_SSO || "false") === "true",
};

export const CALLBACK_PATH = "/callback";
