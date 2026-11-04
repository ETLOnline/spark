"use client"
import AppSidebar from "@/src/components/Dashboard/Sidebar.tsx/app-sidebar"
import Header from "@/src/components/Dashboard/Header/header"
import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar"
import { ReactNode, Suspense, useEffect } from "react"
import UnauthorizedScreen from "./components/AdminLayout/Unauthorized"
import { useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { adminAnalyticsStore } from "@/src/store/adminAnalytics/adminAnalyticsStore"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetReportSnapshotAction } from "@/src/server-actions/Reporting/Reporting"

function AdminLayout({ children }: { children: ReactNode }) {
  const isSuperAdmin = Boolean(useAtomValue(userStore.SuperAdmin))
  const isUserLoading = Boolean(useAtomValue(userStore.LoadingUser))
  const setSnapshot = useSetAtom(adminAnalyticsStore.snapshot)
  const setLoadingSnapshot = useSetAtom(adminAnalyticsStore.LoadingSnapshot)
  const [loadingSnapshot, snapshotResponse, snapshotError, fetchSnapshot] =
    useServerAction(GetReportSnapshotAction)

  // Fetch the report snapshot once for all admin pages, and only for Super Admins.
  useEffect(() => {
    if (isSuperAdmin) fetchSnapshot()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin])

  useEffect(() => {
    setSnapshot(snapshotResponse?.data?.snapshot ?? null)
  }, [snapshotResponse, setSnapshot])

  // Stay "loading" until a response or error arrives, so pages don't flash the empty state before the fetch starts.
  useEffect(() => {
    setLoadingSnapshot(loadingSnapshot)
  }, [loadingSnapshot])

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
