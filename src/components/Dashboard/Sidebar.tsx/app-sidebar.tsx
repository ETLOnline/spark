"use client"

import NavMain from "@/src/components/Dashboard/Sidebar.tsx/nav-main"
import NavSecondary from "@/src/components/Dashboard/Sidebar.tsx/nav-secondary"
import NavUser from "@/src/components/Dashboard/Sidebar.tsx/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/src/components/ui/sidebar"
import { SignedIn } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAtom, useAtomValue } from "jotai"
import { navStore } from "@/src/store/nav/navStore"
import useSideBarHook from "./hooks/useSideBarHook"
import { adminSiteRoutes } from "./constants/AdminNavigationRouters"
import { Skeleton } from "../../ui/skeleton"
import { useEffect, useState } from "react"
import { NavItem } from "./nav-types"
import useShortcut from "../../common/Shortcut/hooks/useShortcut"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isSuperAdmin?: boolean
}

export default function AppSidebar({
  isSuperAdmin,
  ...props
}: AppSidebarProps) {
  const [baseRoutes, setRoutes] = useAtom(navStore.routes)
  const isNavLoading = useAtomValue(navStore.isNavLoading)
  // Never write adminSiteRoutes back into the shared atom: it has no
  // navSecondary, and the (dashboard) layout would crash after client-side
  // navigation from /admin.
  // Also key off the URL, not just the prop: after a client-side navigation
  // from /admin to a public page the admin menu must not stick around.
  // Public shortcuts are not shown in the admin sidebar.
  const pathname = usePathname()
  const showAdminRoutes =
    isSuperAdmin && (pathname === "/admin" || pathname.startsWith("/admin/"))
  const routes = showAdminRoutes ? adminSiteRoutes : baseRoutes
  const _ = useSideBarHook()
  const { shortcutMap, shortcutList, getShortcuts, loadingShortcuts } =
    useShortcut()
  const [sidebarShortcutList, setSidebarShortcutList] = useState<NavItem[]>([])

  useEffect(() => {
    getShortcuts()
  }, [])

  useEffect(() => {
    const navitems: NavItem[] = Object.keys(shortcutMap).map((key) => {
      return {
        title: key.charAt(0).toUpperCase() + key.slice(1),
        url: "#",
        items: shortcutMap[key].map((item) => {
          return {
            title: item.title,
            url: item.url
          }
        })
      }
    })

    setSidebarShortcutList(
      navitems.filter((item) => item.items && item.items.length > 0)
    )
  }, [shortcutList])

  useEffect(() => {
    setRoutes((prev) => ({
      ...prev,
      shortcuts: sidebarShortcutList
    }))
  }, [sidebarShortcutList])

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <Image
                    sizes="8"
                    src="/logo/spark-logo-animated-themed.gif"
                    alt="spark-logo"
                    width={40}
                    height={40}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold color-accent">
                    Spark
                  </span>
                  <span className="truncate text-[8px]">ETL Online</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isNavLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array(7)
              .fill(null)
              .map((_, index) => (
                <Skeleton key={index} className="h-7 w-full bg-muted/50" />
              ))}
          </div>
        ) : (
          <NavMain items={routes.navMain} label="Platform" />
        )}
        {/* <NavMain items={routes.testNav} label="Test" /> */}
        <NavMain
          items={showAdminRoutes ? [] : routes.shortcuts}
          label="Shortcuts"
        />
        {!showAdminRoutes && (
          <NavSecondary items={routes.navSecondary} className="mt-auto" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <SignedIn>
          <NavUser />
        </SignedIn>
      </SidebarFooter>
    </Sidebar>
  )
}
