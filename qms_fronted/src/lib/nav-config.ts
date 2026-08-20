import type { LucideIcon } from "lucide-react"
import { PackageSearch } from "lucide-react"

/**
 * 三级导航结构：
 * - 一级 = 分组标签（追溯）
 * - 二级 = 模块（含图标，可展开或无子级）
 * - 三级 = 页面（可点击的具体入口，仅部分二级下存在）
 */
export type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  items?: { title: string; url: string }[]
}

export type NavSection = {
  label: string
  items: NavItem[]
}

/** 业务功能分组（一级 → 二级 → 三级） */
export const navSections: NavSection[] = [
  {
    label: "追溯",
    items: [
      {
        title: "产品追溯",
        url: "/trace",
        icon: PackageSearch,
        items: [
          { title: "正向追溯", url: "/trace/forward" },
          { title: "逆向追溯", url: "/trace/backward" },
        ],
      },
    ],
  },
]

/**
 * 根据路径解析当前页面所属的导航层级，供页面面包屑与标题使用。
 * 返回 [{ title, url }] 的一级 → 二级 → 三级面包屑链。
 */
export function resolveNav(
  pathname: string
): { breadcrumb: { title: string; url: string }[] } | null {
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.items) {
        for (const sub of item.items) {
          if (sub.url === pathname) {
            return {
              breadcrumb: [
                { title: section.label, url: "" },
                { title: item.title, url: item.url },
                { title: sub.title, url: sub.url },
              ],
            }
          }
        }
      } else if (item.url === pathname) {
        return {
          breadcrumb: [
            { title: section.label, url: "" },
            { title: item.title, url: item.url },
          ],
        }
      }
    }
  }
  return null
}

/** 根据路径解析页签标题，供页签栏与刷新后路由同步使用 */
export function resolveTabLabel(pathname: string): string | null {
  return resolveNav(pathname)?.breadcrumb.at(-1)?.title ?? null
}
