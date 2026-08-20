"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { TabProvider, useTabs } from "@/lib/tab-store"
import { TraceSessionProvider } from "@/lib/trace-session-store"
import { LayoutProvider } from "@/context/layout-provider"
import { SearchProvider } from "@/context/search-provider"
import { getCookie } from "@/lib/cookies"

/**
 * 页内容容器：用 [路径 + 刷新信号] 作 key。
 * 点击页签「刷新页面」会自增刷新信号 → 仅重新挂载当前路由的页面子树（重置其本地状态），
 * 不重载整个系统，也不影响已打开的其它页签。
 */
function ContentFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { refreshToken } = useTabs()
  return (
    <div
      key={`${pathname}:${refreshToken}`}
      className="flex flex-1 flex-col p-4 md:p-6"
    >
      {children}
    </div>
  )
}

/**
 * 全局 Provider 组合（客户端）：
 * 布局(侧边栏样式/折叠模式) → 页签 → 全局搜索(⌘K) → 提示 → 侧边栏
 * 系统仅使用浅色（light）主题，不提供深色模式。
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const defaultOpen = getCookie("sidebar_state") !== "false"

  return (
    <>
      <LayoutProvider>
        <TabProvider>
          <TraceSessionProvider>
            <SearchProvider>
              <TooltipProvider>
                <SidebarProvider defaultOpen={defaultOpen}>
                  <AppSidebar />
                  <SidebarInset>
                    {/* 页签已内联在顶部导航栏中（见 AppHeader） */}
                    <AppHeader />
                    <ContentFrame>{children}</ContentFrame>
                  </SidebarInset>
                </SidebarProvider>
              </TooltipProvider>
            </SearchProvider>
          </TraceSessionProvider>
        </TabProvider>
      </LayoutProvider>
      <Toaster richColors position="top-right" />
    </>
  )
}
