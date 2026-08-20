"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ComboboxOption {
  value: string
  label: string
  hint?: string
}

/**
 * 远程搜索下拉（Combobox）：
 * - onChange 触发远程搜索（由父组件按需过滤数据）
 * - 选中后展示选中项，支持清空
 */
export function RemoteCombobox({
  placeholder,
  searchPlaceholder,
  options,
  value,
  onSelect,
  onSearch,
  loading,
  disabled,
  emptyText = "未找到匹配项",
}: {
  placeholder: string
  searchPlaceholder: string
  options: ComboboxOption[]
  value: string | null
  onSelect: (value: string | null) => void
  /** 输入关键词时回调（驱动父组件远程过滤 options） */
  onSearch?: (keyword: string) => void
  loading?: boolean
  disabled?: boolean
  /** 无匹配结果时的提示文案 */
  emptyText?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [keyword, setKeyword] = React.useState("")
  const selected = options.find((o) => o.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between rounded-none font-normal"
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 font-mono text-xs">{selected.value}</span>
              <span className="truncate">{selected.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={keyword}
            onValueChange={(v) => {
              setKeyword(v)
              // 通知父组件远程搜索；输入变化时清除已选值（避免展示旧选中项）
              onSearch?.(v)
              if (value) onSelect(null)
            }}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                <Search className="size-4 animate-pulse" />
                搜索中...
              </div>
            ) : options.length === 0 ? (
              <CommandEmpty className="text-muted-foreground">{emptyText}</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => {
                      onSelect(opt.value)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4 shrink-0",
                        value === opt.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="shrink-0 font-mono text-xs">{opt.value}</span>
                    <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                    {opt.hint && (
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {opt.hint}
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
