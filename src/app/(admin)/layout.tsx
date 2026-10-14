"use client"
import AppSidebar from "@/src/components/Dashboard/Sidebar.tsx/app-sidebar"
import Header from "@/src/components/Dashboard/Header/header"
import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar"
import { ReactNode, Suspense } from "react"
import UnauthorizedScreen from "./components/AdminLayout/Unauthorized"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"

function AdminLayout({ children }: { children: ReactNode }) {
  const isSuperAdmin = Boolean(useAtomValue(userStore.SuperAdmin))
  const isUserLoading = Boolean(useAtomValue(userStore.LoadingUser))
  if (isUserLoading) {
    return (
      <div className="flex justify-center h-full w-full">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  } else if (!isSuperAdmin && !isUserLoading) {
    return (
      <Suspense>
        <UnauthorizedScreen />
      </Suspense>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar collapsible="icon" isSuperAdmin={isSuperAdmin} />
      {/*
        min-w-0: lets the content column shrink to the space beside the sidebar. Without it the column
        grows to its widest child (the header's fixed-size search box), pushing cards past the right edge.
        [&_header>div>*:nth-child(2)]:min-w-0: lets that search box (2nd item in the header row) shrink on
        phones instead of forcing the header wider than the screen — done here so Header stays untouched.
      */}
      <SidebarInset className="min-w-0 w-full max-w-full [&_header>div>*:nth-child(2)]:min-w-0">
        <Header />
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4 px-2 pt-0 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AdminLayout
