import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { AppProviders } from "@/components/app-providers"
import { AuthGuard } from "@/components/auth-guard"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Genca QMS",
  description:
    "企业级 SaaS 质量管理系统：供应商质量、检验管理、不合格品、CAPA、产品追溯、质量绩效",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <AuthGuard>
          <AppProviders>{children}</AppProviders>
        </AuthGuard>
      </body>
    </html>
  )
}
