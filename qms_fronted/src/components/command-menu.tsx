"use client"

import React from "react"
import { ArrowRight, ChevronRight } from "lucide-react"
import { useSearch } from "@/context/search-provider"
import { useTabs } from "@/lib/tab-store"
import { navSections } from "@/lib/nav-config"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"

/**
 * ⌘K 命令面板：按功能分组列出全部导航入口，支持键盘搜索直达。
 */
export function CommandMenu() {
  const { open, setOpen } = useSearch()
  const { addTab } = useTabs()

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen],
  )

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="输入命令或搜索页面..." />
      <CommandList>
        <ScrollArea type="hover" className="h-72 pe-1">
          <CommandEmpty>未找到匹配结果。</CommandEmpty>

          {/* 业务功能 */}
          {navSections.map((section) => (
            <CommandGroup key={section.label} heading={section.label}>
              {section.items.map((navItem, i) => {
                if (navItem.items) {
                  return navItem.items.map((subItem, j) => (
                    <CommandItem
                      key={`${navItem.title}-${subItem.url}-${i}-${j}`}
                      value={`${section.label}-${navItem.title}-${subItem.title}`}
                      onSelect={() =>
                        runCommand(() =>
                          addTab({ label: subItem.title, path: subItem.url }),
                        )
                      }
                    >
                      <div className="flex size-4 items-center justify-center">
                        <ArrowRight className="size-2 text-muted-foreground/80" />
                      </div>
                      {navItem.title} <ChevronRight /> {subItem.title}
                    </CommandItem>
                  ))
                }

                return (
                  <CommandItem
                    key={`${navItem.url}-${i}`}
                    value={navItem.title}
                    onSelect={() =>
                      runCommand(() =>
                        addTab({ label: navItem.title, path: navItem.url }),
                      )
                    }
                  >
                    <div className="flex size-4 items-center justify-center">
                      <ArrowRight className="size-2 text-muted-foreground/80" />
                    </div>
                    {navItem.title}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}

          <CommandSeparator />
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
