import { ReactNode } from "react"
import { redirect } from "next/navigation"
import AppSidebar from "@/src/components/Dashboard/Sidebar.tsx/app-sidebar"
import Header from "@/src/components/Dashboard/header"
import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar"
import { checkUserPersonaCompletion, isSuperAdmin } from "@/src/utils/helpers"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"

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

  if (!superAdmin) {
    if (!hasPersona) {
      redirect("/personas")
    } else if (
      !authUser.profile ||
      !authUser.profile.bio ||
      !authUser.profile.degree
    ) {
      redirect("/profile-complition")
    }
  }
  return (
    <SidebarProvider>
      <AppSidebar collapsible="icon" />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col gap-4 px-4  !w-full h-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
