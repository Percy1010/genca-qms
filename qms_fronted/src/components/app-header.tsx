"use client"

import { TabBar } from "@/components/tab-bar"
import { AccountMenu } from "@/components/account-menu"
import { ConfigDrawer } from "@/components/config-drawer"

/**
 * 顶部导航栏：页签栏 + 右侧账户信息 / 设置按钮。
 * 侧边栏开关已移至侧边栏底部左下角（见 AppSidebar）。
 */
export function AppHeader() {
  return (
    <header className="app-header sticky top-0 z-10 flex h-12 shrink-0 items-center gap-1 border-b bg-background/95 pl-2 pr-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="min-w-0 flex-1">
        <TabBar />
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-3">
        <ConfigDrawer />
        <AccountMenu />
      </div>
    </header>
  )
}