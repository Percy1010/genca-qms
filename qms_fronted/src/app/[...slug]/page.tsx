import { notFound } from "next/navigation"
import { resolveNav } from "@/lib/nav-config"
import { PageShell, PageSkeleton } from "@/components/page-shell"

type Props = {
  params: Promise<{ slug: string[] }>
}

/**
 * 三级导航的动态页面入口。
 * 所有二级/三级菜单共用此页面，根据 URL 自动渲染对应页面标题与占位内容，
 * 无需为每个页面单独创建文件。
 */
export default async function CatchAllPage({ params }: Props) {
  const { slug } = await params
  const pathname = "/" + slug.join("/")
  const nav = resolveNav(pathname)

  if (!nav) {
    notFound()
  }

  const title = nav.breadcrumb.at(-1)?.title ?? "页面"

  return (
    <PageShell title={title}>
      <PageSkeleton module={title} />
    </PageShell>
  )
}
