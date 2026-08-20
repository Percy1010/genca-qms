import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /**
   * 开发环境代理：将前端 /api/** 请求转发到后端服务。
   * 后端默认本地 8080 端口（qms_backend），可通过 NEXT_PUBLIC_API_BASE_URL 覆盖。
   */
  devIndicators: false, // 关闭开发模式的 N 标志悬浮调试工具
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination: `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/api/:path*`,
    },
  ],
}

export default nextConfig
