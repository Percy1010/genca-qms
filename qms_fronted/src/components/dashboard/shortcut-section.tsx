"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, PackageSearch, Settings } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { navSections } from "@/lib/nav-config"

/** 快捷入口：父级导航 icon + 菜单名（可自定义增删） */
interface ShortcutItem {
  key: string
  title: string
  url: string
  icon: LucideIcon
}

const STORAGE_KEY = "qms.workbench.shortcuts"

/** 收集全部三级叶子菜单（key 用 url） */
function collectLeafCandidates(): ShortcutItem[] {
  const list: ShortcutItem[] = []
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.items && item.items.length > 0) {
        for (const sub of item.items) {
          list.push({
            key: sub.url,
            title: sub.title,
            url: sub.url,
            icon: item.icon ?? PackageSearch,
          })
        }
      } else {
        list.push({
          key: item.url,
          title: item.title,
          url: item.url,
          icon: item.icon ?? PackageSearch,
        })
      }
    }
  }
  return list
}

function loadShortcuts(): ShortcutItem[] {
  const candidates = collectLeafCandidates()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as { key: string }[]
      const byKey = new Map(candidates.map((c) => [c.key, c]))
      const list = saved
        .map((s) => byKey.get(s.key))
        .filter((s): s is ShortcutItem => Boolean(s))
      if (list.length > 0) return list
    }
  } catch {
    // 忽略损坏数据，回落默认
  }
  return candidates.filter((c) =>
    ["/trace/forward", "/trace/backward"].includes(c.url)
  )
}

export function ShortcutSection() {
  const [shortcuts, setShortcuts] = React.useState<ShortcutItem[]>(() =>
    loadShortcuts()
  )
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<string[]>([])
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())

  // 打开设置：以当前快捷项作为勾选草稿；默认展开含勾选项的二级
  const openSettings = () => {
    setDraft(shortcuts.map((s) => s.key))
    const exp = new Set<string>()
    for (const section of navSections) {
      for (const item of section.items) {
        if (
          item.items?.some((sub) =>
            shortcuts.some((s) => s.key === sub.url)
          )
        ) {
          exp.add(`${section.label}/${item.title}`)
        }
      }
    }
    setExpanded(exp)
    setOpen(true)
  }

  const toggleDraft = (key: string) =>
    setDraft((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )

  const toggleExpand = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  /** 二级下全部三级是否均已勾选 */
  const groupAllChecked = (subs: { url: string }[]) =>
    subs.length > 0 && subs.every((s) => draft.includes(s.url))

  /** 一键勾选/取消二级 → 其下全部三级 */
  const toggleGroup = (subs: { url: string }[]) => {
    const all = groupAllChecked(subs)
    setDraft((prev) => {
      const next = new Set(prev)
      subs.forEach((s) => {
        if (all) next.delete(s.url)
        else next.add(s.url)
      })
      return [...next]
    })
  }

  const save = () => {
    const byKey = new Map(collectLeafCandidates().map((c) => [c.key, c]))
    const next = draft
      .map((k) => byKey.get(k))
      .filter((s): s is ShortcutItem => Boolean(s))
    setShortcuts(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setOpen(false)
  }

  return (
    <div className="rounded-xl border bg-card">
      {/* 模块头：标题 + 设置 */}
      <div className="flex items-center justify-between px-5 pt-4 pb-1">
        <h2 className="text-sm font-semibold tracking-tight">快捷入口</h2>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="快捷入口设置"
          onClick={openSettings}
        >
          <Settings className="size-4" />
        </Button>
      </div>

      {/* 入口列表（左右结构：icon 左、名称右，无背景） */}
      <div className="flex flex-wrap gap-2 px-5 pb-5 pt-2">
        {shortcuts.map((sc) => {
          const Icon = sc.icon
          return (
            <Link key={sc.key} href={sc.url}>
              <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <Icon className="size-4 shrink-0 text-primary" strokeWidth={1.75} />
                <span className="text-sm font-medium whitespace-nowrap text-foreground">
                  {sc.title}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* 设置对话框：按一级 → 二级（可展开）→ 三级 层级勾选 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>快捷入口</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-80">
            <div className="space-y-3">
              {navSections.map((section) => (
                <div key={section.label}>
                  {/* 一级导航名称：分区标题 */}
                  <div className="px-2 pt-1 pb-1 text-xs font-medium text-muted-foreground">
                    {section.label}
                  </div>
                  {section.items.map((item) => {
                    const groupKey = `${section.label}/${item.title}`
                    const Icon = item.icon ?? PackageSearch
                    const hasChildren = !!item.items && item.items.length > 0
                    const isExpanded = expanded.has(groupKey)
                    const allChecked = hasChildren
                      ? groupAllChecked(item.items!)
                      : draft.includes(item.url)

                    return (
                      <div key={groupKey}>
                        {hasChildren ? (
                          <div
                            className="flex items-center justify-between rounded-lg px-1 transition-colors hover:bg-muted/60"
                          >
                            <div className="flex min-w-0 items-center gap-2 py-2 pl-1">
                              <Checkbox
                                checked={allChecked}
                                onCheckedChange={() => toggleGroup(item.items!)}
                              />
                              <Icon className="size-4 shrink-0 text-foreground" strokeWidth={1.75} />
                              <span className="text-sm font-medium">{item.title}</span>
                            </div>
                            <button
                              type="button"
                              aria-label={isExpanded ? "收起" : "展开"}
                              onClick={() => toggleExpand(groupKey)}
                              className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                            >
                              {isExpanded ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <label
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
                          >
                            <Checkbox
                              checked={allChecked}
                              onCheckedChange={() => toggleDraft(item.url)}
                            />
                            <Icon className="size-4 shrink-0 text-foreground" strokeWidth={1.75} />
                            <span className="text-sm font-medium">{item.title}</span>
                          </label>
                        )}

                        {/* 三级菜单 */}
                        {hasChildren && isExpanded && (
                          <div className="ml-6 mt-0.5 space-y-0.5 pl-3">
                            {item.items!.map((sub) => (
                              <label
                                key={sub.url}
                                className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60"
                              >
                                <Checkbox
                                  checked={draft.includes(sub.url)}
                                  onCheckedChange={() => toggleDraft(sub.url)}
                                />
                                <span className="text-sm text-foreground/90">
                                  {sub.title}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter className="border-t-0 bg-white">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={save}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
