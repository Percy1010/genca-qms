"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { useRouter, usePathname } from "next/navigation"
import { resolveTabLabel } from "@/lib/nav-config"

export interface Tab {
  id: string
  label: string
  path: string
}

interface TabContextType {
  tabs: Tab[]
  activeTabId: string
  addTab: (tab: Omit<Tab, "id">) => void
  closeTab: (id: string) => void
  closeOthers: (id: string) => void
  closeLeft: (id: string) => void
  closeRight: (id: string) => void
  setActiveTab: (id: string) => void
  /** 刷新当前页签内容（触发当前路由页面重新挂载、重置其本地状态） */
  refreshPage: () => void
  refreshToken: number
}

const TabContext = createContext<TabContextType | null>(null)

const STORAGE_KEY = "qms-tabs"
const DEFAULT_TABS: Tab[] = [{ id: "/", label: "工作台", path: "/" }]
const SKIP_TAB_PATHS = new Set(["/callback"])

function readStoredTabs(): Tab[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_TABS
    const parsed = JSON.parse(raw) as Tab[]
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every((t) => t.id && t.label && t.path) &&
      parsed.some((t) => t.id === "/")
    ) {
      return parsed
    }
  } catch {
    // ignore invalid storage
  }
  return DEFAULT_TABS
}

export function TabProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>(DEFAULT_TABS)
  const [hydrated, setHydrated] = useState(false)
  /** 刷新信号：自增即可强制当前路由页面重新挂载（重置其本地状态） */
  const [refreshToken, setRefreshToken] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTabs(readStoredTabs())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tabs))
  }, [tabs, hydrated])

  // 刷新或直接输入 URL 时，确保当前路由对应页签存在且可被高亮
  useEffect(() => {
    if (!hydrated || SKIP_TAB_PATHS.has(pathname)) return

    const label = resolveTabLabel(pathname)
    if (!label) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTabs((prev) => {
      if (prev.some((t) => t.id === pathname)) return prev
      return [...prev, { id: pathname, label, path: pathname }]
    })
  }, [pathname, hydrated])

  // 活跃页签与当前路由对齐；刷新后路由同步 effect 补页签前，也按 pathname 推导高亮
  const activeTabId =
    tabs.some((t) => t.id === pathname) || resolveTabLabel(pathname)
      ? pathname
      : tabs[0]?.id ?? "/"

  const addTab = useCallback(
    (tab: Omit<Tab, "id">) => {
      const id = tab.path
      if (!tabs.some((t) => t.id === id)) {
        setTabs((prev) => [...prev, { id, ...tab }])
      }
      router.push(id)
    },
    [tabs, router],
  )

  const closeTab = useCallback(
    (id: string) => {
      if (id === "/") return // 首页不可关闭

      const idx = tabs.findIndex((t) => t.id === id)
      if (idx === -1) return
      const remaining = tabs.filter((t) => t.id !== id)
      setTabs(remaining)

      // 关闭的是当前活跃页签时，自动切换到相邻页签
      if (activeTabId === id) {
        const nextTab = remaining[Math.min(idx, remaining.length - 1)] ?? remaining[0]
        if (nextTab) router.push(nextTab.path)
      }
    },
    [tabs, activeTabId, router],
  )

  const closeOthers = useCallback(
    (id: string) => {
      // 工作台页签(/)始终保留；关闭除当前页签以外的所有页签
      setTabs((prev) => prev.filter((t) => t.id === id || t.id === "/"))
    },
    [],
  )

  const closeLeft = useCallback((id: string) => {
    // 保留工作台(/)与当前页签及其右侧；关闭当前页签左侧的其他页签
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === id)
      if (idx === -1) return prev
      const keep = prev.slice(idx)
      // 工作台(/)不受影响：若它不在右侧区段中，则补回
      return keep.some((t) => t.id === "/") ? keep : [{ id: "/", label: "工作台", path: "/" }, ...keep]
    })
  }, [])

  const closeRight = useCallback((id: string) => {
    // 保留工作台(/)与当前页签及其左侧；关闭当前页签右侧的其他页签
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === id)
      if (idx === -1) return prev
      const keep = prev.slice(0, idx + 1)
      // 工作台(/)不受影响：若它不在左侧区段中，则补回
      return keep.some((t) => t.id === "/") ? keep : [{ id: "/", label: "工作台", path: "/" }, ...keep]
    })
  }, [])

  const setActiveTab = useCallback(
    (id: string) => {
      const tab = tabs.find((t) => t.id === id)
      if (tab) router.push(tab.path)
    },
    [tabs, router],
  )

  const refreshPage = useCallback(() => {
    setRefreshToken((n) => n + 1)
  }, [])

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        addTab,
        closeTab,
        closeOthers,
        closeLeft,
        closeRight,
        setActiveTab,
        refreshPage,
        refreshToken,
      }}
    >
      {children}
    </TabContext.Provider>
  )
}

export function useTabs() {
  const ctx = useContext(TabContext)
  if (!ctx) throw new Error("useTabs must be used within TabProvider")
  return ctx
}
