import { ReactNode } from "react"
import { redirect } from "next/navigation"
import AppSidebar from "@/src/components/Dashboard/Sidebar.tsx/app-sidebar"
import Header from "@/src/components/Dashboard/Header/header"
import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar"
import { checkUserPersonaCompletion, isSuperAdmin } from "@/src/utils/helpers"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { OnlineStatusProvider } from "@/src/components/providers/OnlineStatusProvider"

export default async function DashboardLayout({
  children
}: {
  children: ReactNode
}) {
  const authUser = await AuthUserAction()
  if (!authUser) {
    redirect("/sign-in")
  }
  const superAdmin = await isSuperAdmin(authUser)
  const hasPersona = await checkUserPersonaCompletion(authUser)
  const isProfileCompleted = authUser.profile?.is_profile_completed === 1

  if (!superAdmin) {
    if (!hasPersona) {
      redirect("/personas")
    } else if (!isProfileCompleted) {
      redirect("/profile-complition")
    }
  }
  return (
    <OnlineStatusProvider>
      <SidebarProvider>
        <AppSidebar collapsible="icon" />
        <SidebarInset>
          <Header />
          <div className="flex flex-1 flex-col gap-4 sm:px-4  !w-full h-full">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </OnlineStatusProvider>
  )
}
