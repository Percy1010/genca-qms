@AGENTS.md

# Genca QMS 前端（qms_fronted）

企业级 SaaS 质量管理系统前端。技术栈：Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui（radix）。

## ⚠️ 重要注意事项

### 1. 路径含中文，必须用 webpack 而非 turbopack
本目录所在路径包含中文（产品追溯），Turbopack 在含非 ASCII 字符的路径下会 panic
（char boundary 崩溃，HTTP 500）。`package.json` 的 `dev` / `build` 已固定使用
`--webpack`，**请勿改回 turbopack**。

### 2. 本机 node 环境（nvm）
用户的 shell profile 定义了 `node`/`npm`/`npx` 函数包装器（调用未定义的 `_load_nvm`），
非交互 shell 下不可用。运行命令前需：

```bash
unset -f node npm npx 2>/dev/null
export PATH="$HOME/.nvm/versions/node/v24.11.0/bin:$PATH"
```

### 3. 架构约定
- **导航配置**：`src/lib/nav-config.ts` —— 三级结构（一级分组 → 二级模块 → 三级页面）。新增/调整菜单改这一个文件即可。
- **页面路由**：二级/三级页面统一由 `src/app/[...slug]/page.tsx` 动态渲染，无需为每个页面新建文件。
- **侧边栏**：`src/components/app-sidebar.tsx`
- **顶栏（含面包屑）**：`src/components/app-header.tsx`
- **页面外壳/占位**：`src/components/page-shell.tsx`
- **API 代理**：`next.config.ts` 将 `/api/**` 转发到 `http://localhost:8080`（即 `qms_backend`），后端地址可用环境变量 `NEXT_PUBLIC_API_BASE_URL` 覆盖。

### 4. SSO 单点登录（对齐 Genca 内部 IPC 项目）
- 方案：OIDC Authorization Code + PKCE（`oidc-client-ts`），token 存 localStorage，请求带 `Authorization: Bearer <token>`。
- 关键文件：
  - `src/lib/auth/oidc-config.ts` —— 环境变量配置（authority / client_id / skipSSO）
  - `src/lib/auth/oidc-manager.ts` —— UserManager 单例
  - `src/lib/auth/auth-service.ts` —— 登录 / 回调 / 登出 / 登录态判断
  - `src/components/auth-guard.tsx` —— 路由守卫（未登录自动跳 SSO，/callback 放行）
  - `src/app/callback/page.tsx` —— 认证中心回跳处理
  - `src/lib/api.ts` —— API 客户端，自动带 Bearer token，401 时跳登录
- 配置：复制 `.env.local.example` 为 `.env.local` 填写；`NEXT_PUBLIC_SKIP_SSO=true` 可跳过 SSO 本地看界面。
- ⚠️ 需要公司认证团队提供：QMS 的 client_id 注册、认证中心 authority（生产 `https://gate.shjinjia.com.cn/auth` / 测试 `https://gatetest.shjinjia.com.cn`）、回调地址白名单。

### 5. 运行
```bash
npm run dev   # http://localhost:3000
```
