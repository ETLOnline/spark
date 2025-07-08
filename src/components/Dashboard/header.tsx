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
import ModeToggle from "../ThemeProvider/ThemeToggle"
import { usePathname } from "next/navigation"
import CommandCenter from "./CommandCenter/CommandCenter"
import { SignedIn } from "@clerk/nextjs"
import { PageMeta } from "@/src/utils/constants"
import Notifications from "./Notifications/Notifications"
import { useAtomValue } from "jotai"
import { navStore } from "@/src/store/nav/navStore"
import { useMemo } from "react"

type Crumb = {
  href: string
  path: string
  id: string | number
}
const Header = () => {
  const crumbPaths = useAtomValue(navStore.crumbRoutes)

  const path: string = usePathname().substring(1)
  const hrefs: string[] = path
    .split("/")
    .map(
      (pathName) =>
        "/" + path.substring(0, path.indexOf(pathName) + pathName.length)
    )
  const crumbs: Crumb[] = useMemo(() => {
    const tempCrumbs: Crumb[] = []
    hrefs.forEach((href) => {
      const matchedCrumbs = crumbPaths.filter((crumb: PageMeta) => {
        const crumbPath =
          typeof crumb.url === "string" ? crumb.url.split("?")[0] : ""
        return crumbPath === href
      })

      matchedCrumbs.forEach((crumb) => {
        const exists = tempCrumbs.some(
          (c) => c.href === crumb.url && c.path === crumb.title
        )
        if (!exists) {
          tempCrumbs.push({
            href: typeof crumb.url === "string" ? crumb.url : href,
            path: crumb.title,
            id: crumb.id
          })
        }
      })
    })

    return [...tempCrumbs]
  }, [crumbPaths, path])

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 sticky top-0 bg-background z-10 rounded-xl border-b ">
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
                <BreadcrumbItem key={crumb.id}>
                  <BreadcrumbLink href={crumb.href}>
                    <BreadcrumbPage>{crumb.path}</BreadcrumbPage>
                  </BreadcrumbLink>
                  {i !== crumbs.length - 1 && <BreadcrumbSeparator />}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <SignedIn>
          <CommandCenter />
        </SignedIn>
        <div className="flex items-center gap-2">
          <Notifications />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

export default Header
