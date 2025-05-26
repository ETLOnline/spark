import AppSidebar from "@/src/components/Dashboard/Sidebar.tsx/app-sidebar"
import Header from "@/src/components/Dashboard/header"
import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar"
import { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar collapsible="icon" />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 !w-full h-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
