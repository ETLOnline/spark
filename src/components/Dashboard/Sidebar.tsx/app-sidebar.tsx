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
import { useAtomValue } from "jotai"
import { navStore } from "@/src/store/nav/navStore"
import useSideBarHook from "./hooks/useSideBarHook"
import { adminSiteRoutes } from "./constants/AdminNavigationRouters"
import { Skeleton } from "../../ui/skeleton"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isSuperAdmin?: boolean
}

export default function AppSidebar({
  isSuperAdmin,
  ...props
}: AppSidebarProps) {
  const baseRoutes = useAtomValue(navStore.routes)
  const isNavLoading = useAtomValue(navStore.isNavLoading)
  const routes = isSuperAdmin ? adminSiteRoutes : baseRoutes
  const _ = useSideBarHook()

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
                    src="/logo/Spark Logo.png"
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
        {!isSuperAdmin && (
          <>
            <NavMain items={routes.navChannels} label="Channels" />
            <NavSecondary items={routes.navSecondary} className="mt-auto" />
          </>
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
