"use client"

import React, {
  Fragment,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { LayoutDashboard, PanelLeft, PanelRight, RefreshCw, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTabs } from "@/lib/tab-store"

/**
 * 页签栏（嵌入顶部导航栏内联显示）。
 * 打开过的菜单页面会在这里生成页签，点击切换、悬停关闭。
 * 工作台为固定页签（带图标、不可关闭）；右键页签可「关闭其他 / 关闭左侧 / 刷新」。
 */
export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, closeOthers, closeLeft, closeRight, refreshPage } =
    useTabs()
  const hasOtherTabs = tabs.length > 1

  const tabButtonClass = cn(
    "group relative flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm transition-colors select-none",
  )

  return (
    <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id
        const isHome = tab.id === "/"

        const button = (
          <button
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              tabButtonClass,
              isActive
                ? "font-medium text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isHome && <LayoutDashboard className="size-3.5 shrink-0" />}
            <span className="max-w-[120px] truncate">{tab.label}</span>
            {!isHome && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }
                }}
                className="flex size-3.5 shrink-0 items-center justify-center rounded-sm opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100 hover:bg-muted-foreground/15"
              >
                <X className="size-3" />
              </span>
            )}
          </button>
        )

        return (
          <Fragment key={tab.id}>
            {isHome ? (
              button
            ) : (
              <TabContextMenu
                tabId={tab.id}
                isActive={isActive}
                onCloseOthers={() => closeOthers(tab.id)}
                onCloseLeft={() => closeLeft(tab.id)}
                onCloseRight={() => closeRight(tab.id)}
                onRefresh={() => refreshPage()}
              >
                {button}
              </TabContextMenu>
            )}
            {isHome && hasOtherTabs && (
              <span
                aria-hidden
                className="mx-1 h-4 w-px shrink-0 self-center bg-border"
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

/**
 * 页签右键菜单：显隐项由具体条件决定
 *  - 关闭其他：仅当存在「非工作台且非当前」的其他可关页签
 *  - 关闭左侧：仅当当前页签左侧存在「非工作台」页签
 *  - 关闭右侧：仅当当前页签右侧存在「非工作台」页签
 *  - 刷新页面：仅当右键的是当前活跃页签（刷新只对当前路由生效）
 */
function TabContextMenu({
  tabId,
  isActive,
  onCloseOthers,
  onCloseLeft,
  onCloseRight,
  onRefresh,
  children,
}: {
  tabId: string
  isActive: boolean
  onCloseOthers: () => void
  onCloseLeft: () => void
  onCloseRight: () => void
  onRefresh: () => void
  children: ReactElement
}) {
  const { tabs } = useTabs()
  const triggerRef = useRef<HTMLElement | null>(null)
  // 菜单锚定坐标：顶部固定在页签按钮底部，不随菜单高度变化
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(
    null,
  )

  // 「关闭其他」：非工作台且非当前的可关页签 > 0
  const canCloseOthers =
    tabs.filter((t) => t.id !== "/" && t.id !== tabId).length > 0
  // 「关闭左侧」：当前页签左侧存在非工作台页签
  const currentIdx = tabs.findIndex((t) => t.id === tabId)
  const canCloseLeft =
    currentIdx > 0 && tabs.slice(1, currentIdx).some((t) => t.id !== "/")
  // 「关闭右侧」：当前页签右侧存在非工作台页签（工作台在最左侧，通常其右侧均有待关页签）
  const canCloseRight =
    currentIdx < tabs.length - 1 &&
    tabs.slice(currentIdx + 1).some((t) => t.id !== "/")
  // 「刷新页面」：仅当前活跃页签
  const canRefresh = isActive

  if (!canCloseOthers && !canCloseLeft && !canCloseRight && !canRefresh)
    return children

  // 注入右键监听与 ref：右键时把菜单顶部固定到按钮底部
  const enhanced = (
    <TabTrigger
      triggerRef={triggerRef}
      onContext={(e) => {
        e.preventDefault()
        const r = triggerRef.current?.getBoundingClientRect()
        if (!r) return
        setAnchor({ top: r.bottom + 6, left: r.left })
      }}
    >
      {children}
    </TabTrigger>
  )

  const actions: {
    label: string
    icon: ReactNode
    run: () => void
  }[] = []
  if (canCloseOthers)
    actions.push({ label: "关闭其他", icon: <X />, run: onCloseOthers })
  if (canCloseLeft)
    actions.push({ label: "关闭左侧", icon: <PanelLeft />, run: onCloseLeft })
  if (canCloseRight)
    actions.push({ label: "关闭右侧", icon: <PanelRight />, run: onCloseRight })
  if (canRefresh)
    actions.push({ label: "刷新页面", icon: <RefreshCw />, run: onRefresh })

  return (
    <>
      {enhanced}
      {anchor &&
        createPortal(
          <>
            {/* 点击空白处关闭 */}
            <div
              className="fixed inset-0 z-40 cursor-default"
              onMouseDown={() => setAnchor(null)}
              onContextMenu={(e) => {
                e.preventDefault()
                setAnchor(null)
              }}
            />
            <div
              className="fixed z-50 flex min-w-28 max-w-40 flex-col overflow-hidden rounded-none bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
              style={{
                top: anchor.top,
                left: Math.min(anchor.left, window.innerWidth - 176),
              }}
            >
              {actions.map((a) => (
                <Fragment key={a.label}>
                  {a.label === "刷新页面" && (
                    <div className="-mx-1 my-1 h-px bg-border" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      a.run()
                      setAnchor(null)
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-none px-2 py-1.5 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent [&_svg]:size-4 [&_svg]:shrink-0"
                  >
                    {a.icon}
                    {a.label}
                  </button>
                </Fragment>
              ))}
            </div>
          </>,
          document.body,
        )}
    </>
  )
}

/** 透传页签按钮，注入右键监听与 ref，返回原按钮的增强版本 */
function TabTrigger({
  triggerRef,
  onContext,
  children,
}: {
  triggerRef: React.Ref<HTMLElement>
  onContext: (e: React.MouseEvent) => void
  children: ReactElement
}) {
  return React.cloneElement(
    children as React.ReactElement<{
      onContextMenu?: React.MouseEventHandler
      ref?: React.Ref<HTMLElement>
    }>,
    {
      ref: triggerRef,
      onContextMenu: onContext,
    },
  )
}