"use client"

import { useEffect, useState } from "react"
import { HelpCircle, LogOut, Settings2, UserRound } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authService } from "@/lib/auth/auth-service"

interface AccountInfo {
  name: string
  email: string
  uid?: string
}

/** 未做登录功能前使用的 mock 用户 */
const MOCK_USER: AccountInfo = {
  name: "张平祥",
  email: "zhangpingxiang@shjinjia.com.cn",
  uid: "SH2494",
}

/** 取账户名的首个汉字或字母用于头像 */
function firstChar(name: string): string {
  const raw = name.trim()
  return raw ? raw.slice(0, 1).toUpperCase() : "配"
}

/**
 * 右上角账户下拉菜单（交互参考 shadcn-admin 的 ProfileDropdown / NavUser）。
 * 头像是账户名的首个汉字/字母，展示用户信息，提供账户设置入口与退出登录。
 */
export function AccountMenu() {
  const [user, setUser] = useState<AccountInfo>(MOCK_USER)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const data = authService.getAuthData()
    const info = data?.userInfo
    const resolved: AccountInfo =
      info?.name || info?.uid
        ? {
            name: info.name?.trim() || MOCK_USER.name,
            email: info.email?.trim() || MOCK_USER.email,
            uid: info.uid?.trim() || MOCK_USER.uid,
          }
        : MOCK_USER
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(resolved)
  }, [])

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      toast.success("正在退出登录...")
      await authService.logout()
    } catch {
      setSigningOut(false)
      toast.error("退出登录失败，请重试")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          aria-label="账户信息"
          className="size-7 rounded-full p-0 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-0"
        >
          <Avatar className="size-7">
            <AvatarFallback className="rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {firstChar(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2.5">
            <Avatar className="size-8 rounded-full">
              <AvatarFallback className="rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {firstChar(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-start text-sm leading-tight">
              <span className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.uid}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => toast.info("账户信息功能开发中")}
          >
            <UserRound />
            账户信息
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => toast.info("偏好设置功能开发中")}
          >
            <Settings2 />
            偏好设置
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => toast.info("帮助文档开发中")}
          >
            <HelpCircle />
            帮助
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={signingOut}
          onSelect={(e) => {
            e.preventDefault()
            void handleSignOut()
          }}
        >
          <LogOut />
          {signingOut ? "正在退出..." : "退出登录"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}