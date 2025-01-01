import AppSidebar  from "@/src/components/dashboard/app-sidebar"
import Header from "@/src/components/dashboard/header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/src/components/ui/sidebar"
import { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 ">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
