"use client"

import { SidebarTrigger } from "../ui/sidebar"
import { Separator } from "@radix-ui/react-separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../ui/breadcrumb"
import { ModeToggle } from "../ThemeProvider/ThemeToggle"
import { usePathname } from "next/navigation"
import { pageMeta, PageMeta } from "@/src/utils/constants"

const Header = () => {
  type Crumb = {
    href: string
    path: string
  }

  const path: string = usePathname().substring(1)
  const hrefs: string[] = path
    .split("/")
    .map(
      (pathName) =>
        "/" + path.substring(0, path.indexOf(pathName) + pathName.length)
    )
  const crumbs: Crumb[] = (() => {
    const tempCrumbs: Crumb[] = []
    hrefs.forEach((href) => {
      const meta = pageMeta.find((meta: PageMeta) => meta.url === href)
      if (meta) {
        tempCrumbs.push({ href, path: meta.title })
      }
    })
    return [...tempCrumbs]
  })()

  return (
    <header className="flex h-[12vh] shrink-0 items-center gap-2">
      <div className="flex items-center between justify-between w-full gap-2 px-4">
        <div className="flex items-center ">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={"/"}>
                  <BreadcrumbPage>Spark</BreadcrumbPage>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {crumbs.map((crumb, i) => (
                <BreadcrumbItem key={crumb.href}>
                  <BreadcrumbLink href={crumb.href}>
                    <BreadcrumbPage>{crumb.path}</BreadcrumbPage>
                  </BreadcrumbLink>
                  {i !== crumbs.length - 1 && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <ModeToggle />
      </div>
    </header>
  )
}

export default Header
