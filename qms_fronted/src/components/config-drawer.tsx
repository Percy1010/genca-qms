"use client"

import { type ReactElement, type SVGProps } from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { CircleCheck, RotateCcw, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Collapsible, useLayout } from "@/context/layout-provider"
import { IconSidebarInset } from "@/assets/custom/icon-sidebar-inset"
import { IconSidebarFloating } from "@/assets/custom/icon-sidebar-floating"
import { IconSidebarSidebar } from "@/assets/custom/icon-sidebar-sidebar"
import { IconLayoutDefault } from "@/assets/custom/icon-layout-default"
import { IconLayoutCompact } from "@/assets/custom/icon-layout-compact"
import { IconLayoutFull } from "@/assets/custom/icon-layout-full"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useSidebar } from "@/components/ui/sidebar"

/**
 * 布局设置抽屉：侧边栏样式 / 布局模式。
 * 移植自 shadcn-admin 的 ConfigDrawer，去掉 RTL、字体切换与主题切换（系统仅浅色）。
 */
export function ConfigDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="打开显示设置"
          className="rounded-full"
        >
          <Settings aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="pb-0 text-start">
          <SheetTitle>显示设置</SheetTitle>
          <SheetDescription>
            调整外观与布局，以符合你的使用习惯。
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 overflow-y-auto px-4">
          <SidebarConfig />
          <LayoutConfig />
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SectionTitle({
  title,
  showReset = false,
  onReset,
  resetAriaLabel,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  /** 单项重置按钮的无障碍标签 */
  resetAriaLabel?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground",
        className,
      )}
    >
      {title}
      {showReset && onReset && (
        <Button
          type="button"
          size="icon-xs"
          variant="secondary"
          className="size-4 rounded-full"
          onClick={onReset}
          aria-label={resetAriaLabel}
        >
          <RotateCcw className="size-3" />
        </Button>
      )}
    </div>
  )
}

function RadioGroupItem({
  item,
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => ReactElement
  }
}) {
  return (
    <RadioGroupPrimitive.Item
      value={item.value}
      className={cn("group outline-none", "transition duration-200 ease-in")}
      aria-label={`选择${item.label}`}
      aria-describedby={`${item.value}-description`}
    >
      <div
        className={cn(
          "relative rounded-none ring-[1px] ring-border",
          "group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary",
          "group-focus-visible:ring-2",
        )}
        role="img"
        aria-hidden="false"
        aria-label={`${item.label} 预览`}
      >
        <CircleCheck
          className={cn(
            "size-6 fill-primary stroke-white",
            "group-data-[state=unchecked]:hidden",
            "absolute top-0 right-0 translate-x-1/2 -translate-y-1/2",
          )}
          aria-hidden="true"
        />
        <item.icon
          className={cn(
            "fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground",
          )}
          aria-hidden="true"
        />
      </div>
      <div
        className="mt-1 text-xs"
        id={`${item.value}-description`}
        aria-live="polite"
      >
        {item.label}
      </div>
    </RadioGroupPrimitive.Item>
  )
}

function SidebarConfig() {
  const { defaultVariant, variant, setVariant } = useLayout()
  return (
    <div className="max-md:hidden">
      <SectionTitle
        title="侧边栏"
        showReset={defaultVariant !== variant}
        onReset={() => setVariant(defaultVariant)}
        resetAriaLabel="恢复默认侧边栏样式"
      />
      <RadioGroupPrimitive.Root
        value={variant}
        onValueChange={(v) => setVariant(v as "inset" | "floating" | "sidebar")}
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="选择侧边栏样式"
        aria-describedby="sidebar-description"
      >
        {[
          { value: "inset", label: "内嵌", icon: IconSidebarInset },
          { value: "floating", label: "悬浮", icon: IconSidebarFloating },
          { value: "sidebar", label: "标准", icon: IconSidebarSidebar },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </RadioGroupPrimitive.Root>
      <div id="sidebar-description" className="sr-only">
        在内嵌、悬浮或标准侧边栏布局之间选择
      </div>
    </div>
  )
}

function LayoutConfig() {
  const { open, setOpen } = useSidebar()
  const { defaultCollapsible, collapsible, setCollapsible } = useLayout()

  const radioState = open ? "default" : collapsible

  return (
    <div className="max-md:hidden">
      <SectionTitle
        title="布局"
        showReset={radioState !== "default"}
        onReset={() => {
          setOpen(true)
          setCollapsible(defaultCollapsible)
        }}
        resetAriaLabel="恢复默认布局选项"
      />
      <RadioGroupPrimitive.Root
        value={radioState}
        onValueChange={(v) => {
          if (v === "default") {
            setOpen(true)
            return
          }
          setOpen(false)
          setCollapsible(v as Collapsible)
        }}
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="选择布局模式"
        aria-describedby="layout-description"
      >
        {[
          { value: "default", label: "展开", icon: IconLayoutDefault },
          { value: "icon", label: "图标", icon: IconLayoutCompact },
          { value: "offcanvas", label: "全屏", icon: IconLayoutFull },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </RadioGroupPrimitive.Root>
      <div id="layout-description" className="sr-only">
        在默认展开、图标精简或全屏布局模式之间选择
      </div>
    </div>
  )
}
