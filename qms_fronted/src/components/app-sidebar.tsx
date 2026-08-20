"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { ChevronRight, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { navSections, type NavItem, type NavSection } from "@/lib/nav-config"
import { useTabs } from "@/lib/tab-store"
import { useLayout } from "@/context/layout-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function NavItemLink({
  item,
  pathname,
}: {
  item: NavItem
  pathname: string
}) {
  const { addTab } = useTabs()
  const { state, isMobile } = useSidebar()
  const Icon = item.icon

  const handleClick = () => {
    addTab({ label: item.title, path: item.url })
  }

  if (item.items && item.items.length > 0) {
    // 收起（icon）模式且非移动端：点击弹出下级菜单
    if (state === "collapsed" && !isMobile) {
      return (
        <SidebarMenuItem key={item.title}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* 收起模式不传 tooltip：避免与右侧弹出菜单位置重叠/冲突 */}
              <SidebarMenuButton>
                {Icon && <Icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" sideOffset={4}>
              <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {item.items.map((sub) => (
                <DropdownMenuItem
                  key={sub.url}
                  className={
                    pathname === sub.url
                      ? "bg-accent text-accent-foreground"
                      : undefined
                  }
                  onClick={() => addTab({ label: sub.title, path: sub.url })}
                >
                  {sub.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      )
    }

    // 展开模式：Collapsible 展开
    const isOpen = item.items.some((sub) => sub.url === pathname)
    return (
      <Collapsible
        key={item.title}
        asChild
        defaultOpen={isOpen}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title}>
              {Icon && <Icon />}
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items.map((sub) => (
                <SidebarMenuSubItem key={sub.url}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === sub.url}
                  >
                    <button
                      type="button"
                      onClick={() => addTab({ label: sub.title, path: sub.url })}
                      className="w-full text-left"
                    >
                      {sub.title}
                    </button>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        asChild
        isActive={pathname === item.url}
        tooltip={item.title}
      >
        <button type="button" onClick={handleClick} className="flex w-full items-center gap-2">
          {Icon && <Icon />}
          <span>{item.title}</span>
        </button>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

/** 按关键字过滤导航分组（匹配二级/三级标题，保留分组结构） */
function filterNavSections(keyword: string): NavSection[] {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return navSections

  const result: NavSection[] = []
  for (const section of navSections) {
    const items = section.items
      .map((item) => {
        if (item.items) {
          const subs = item.items.filter((sub) =>
            sub.title.toLowerCase().includes(kw)
          )
          if (subs.length > 0) return { ...item, items: subs }
          return item.title.toLowerCase().includes(kw) ? item : null
        }
        return item.title.toLowerCase().includes(kw) ? item : null
      })
      .filter((x): x is NavItem => x !== null)
    if (items.length > 0) result.push({ label: section.label, items })
  }
  return result
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { collapsible, variant } = useLayout()
  const { toggleSidebar, state } = useSidebar()
  const [keyword, setKeyword] = React.useState("")
  const visibleSections = filterNavSections(keyword)

  return (
    <Sidebar collapsible={collapsible} variant={variant} {...props}>
      {/* ===== 顶部：菜单搜索 ===== */}
      <SidebarHeader>
        {/* 展开模式：完整搜索框 */}
        <div className="relative group-data-[collapsible=icon]:hidden">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-foreground" />
          <SidebarInput
            placeholder="搜索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="rounded-lg pl-8 text-sm placeholder:text-xs placeholder:text-muted-foreground focus-visible:ring-0! focus-visible:border-ring"
          />
        </div>
        {/* 收起模式（icon）：仅保留搜索 icon，点击展开侧边栏以便输入 */}
        <SidebarMenu className="hidden group-data-[collapsible=icon]:block">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip="查询菜单"
              className="justify-center"
            >
              <Search />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ===== 业务功能分组（一级 → 二级 → 三级） ===== */}
      <SidebarContent>
        {visibleSections.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            未找到匹配的菜单
          </p>
        ) : (
          visibleSections.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel className="text-[rgb(135,141,156)]">
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <NavItemLink key={item.title} item={item} pathname={pathname} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>

      {/* ===== 底部：侧边栏开关（收起/展开） ===== */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip={state === "collapsed" ? "显示导航" : "收起导航"}
              className="gap-2"
            >
              {state === "collapsed" ? <PanelLeftOpen /> : <PanelLeftClose />}
              <span>{state === "collapsed" ? "显示导航" : "收起导航"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
