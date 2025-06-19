"use client"
import AppSidebar from "@/src/components/Dashboard/Sidebar.tsx/app-sidebar"
import Header from "@/src/components/Dashboard/header"
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
  console.log(isUserLoading)
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
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AdminLayout
