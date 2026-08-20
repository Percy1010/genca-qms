"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/**
 * 原料编码查询面板。options 为 [{code,name}]，点按即填入并查询。
 */
export function RawMaterialSearch({
  query,
  setQuery,
  onSearch,
  options,
}: {
  query: string
  setQuery: (v: string) => void
  onSearch: () => void
  options: { code: string; name: string }[]
}) {
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <Card className="no-print">
      <CardContent className="p-4">
        <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1 space-y-1.5">
            <Label htmlFor="raw-code-input">原料编码</Label>
            <Input
              id="raw-code-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入原料编码，如 M-1021"
              autoFocus
            />
          </div>
          <Button type="submit">
            <Search />
            查询
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">示例原料：</span>
          {options.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => {
                setQuery(opt.code)
                onSearch()
              }}
              className={cn(
                "rounded-none border px-2 py-0.5 font-mono text-xs transition-colors",
                query === opt.code
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
              )}
            >
              {opt.code} · {opt.name}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
