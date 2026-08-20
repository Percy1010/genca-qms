"use client"

import * as React from "react"
import { ChevronDown, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { ComboboxOption } from "@/components/trace/remote-combobox"

/**
 * 多选下拉（Combobox）：
 * - 选项固定（不远程搜索），支持本地关键字过滤
 * - 支持多选，选中项以 Badge 展示在触发按钮内，可单独移除
 * - 支持一键清空全部
 * 常用于「查询结果按多个批次/编号过滤」等场景。
 */
export function MultiSelectCombobox({
  placeholder,
  searchPlaceholder,
  options,
  value,
  onChange,
  disabled,
  emptyText = "无可选项",
}: {
  placeholder: string
  searchPlaceholder: string
  options: ComboboxOption[]
  value: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
  /** 无匹配结果时的提示文案 */
  emptyText?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [keyword, setKeyword] = React.useState("")

  /** 触发按钮内最多正常展示的已选项个数（仅展示第一个），超出部分以 +N 缩略显示 */
  const MAX_VISIBLE = 1

  const selected = options.filter((o) => value.includes(o.value))
  const hiddenSelected = selected.slice(MAX_VISIBLE)
  const kw = keyword.trim().toLowerCase()
  const filtered = kw
    ? options.filter(
        (o) =>
          o.value.toLowerCase().includes(kw) ||
          o.label.toLowerCase().includes(kw) ||
          (o.hint ?? "").toLowerCase().includes(kw),
      )
    : options

  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])

  /* 清空已选：仅当有选中项时执行（悬浮箭头变为关闭 icon 触发） */
  const clearAll = () => {
    if (value.length > 0) onChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="relative h-auto min-h-9 w-full justify-between rounded-none px-2 py-1.5 pr-7 font-normal"
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {selected.length > 0 ? (
              <>
                {selected.slice(0, MAX_VISIBLE).map((o) => (
                  <span
                    key={o.value}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 font-mono text-xs text-secondary-foreground"
                  >
                    {o.value}
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`移除 ${o.value}`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggle(o.value)
                      }}
                      className="cursor-pointer rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-3" />
                    </span>
                  </span>
                ))}
                {hiddenSelected.length > 0 && (
                  <span
                    title={hiddenSelected.map((o) => o.value).join("、")}
                    className="inline-flex items-center rounded-md border border-dashed px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                  >
                    +{hiddenSelected.length}
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          {/* 右侧箭头：仅当鼠标移入箭头所在位置时才变为关闭 icon；
              清空 onClick 绑在 wrapper 上（svg 会被全局 [&_svg] 置为 pointer-events:none，直接绑 svg 无法命中） */}
          <span
            className="group/icon absolute right-1 top-1/2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              clearAll()
            }}
          >
            <ChevronDown className="size-4 shrink-0 text-muted-foreground opacity-50 transition-opacity group-hover/icon:hidden" />
            <X className="hidden size-4 shrink-0 text-muted-foreground transition-colors group-hover/icon:inline-block" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={keyword}
            onValueChange={setKeyword}
          />
          <CommandList>
            {filtered.length === 0 ? (
              <CommandEmpty className="text-muted-foreground">
                {emptyText}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((opt) => {
                  const checked = value.includes(opt.value)
                  return (
                    <CommandItem
                      key={opt.value}
                      value={opt.value}
                      onSelect={() => toggle(opt.value)}
                    >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => undefined}
                      className="pointer-events-none mr-2"
                    />
                      <span className="font-mono text-xs">{opt.value}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
