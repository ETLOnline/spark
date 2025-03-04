import AppSidebar  from "@/src/components/Dashboard/app-sidebar"
import Header from "@/src/components/Dashboard/header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/src/components/ui/sidebar"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { UserRoles } from "@/src/types/User"
import { getUserRoles } from "@/src/utils/helpers"
import { ReactNode, Suspense } from "react"
import UnauthorizedScreen from "./components/AdminLayout/Unauthorized"

async function AdminLayout({ children }: { children: ReactNode }) {

  const user = await AuthUserAction()

  if (!user || !getUserRoles(user).includes(UserRoles.ADMIN)) {
    return <Suspense>
      <UnauthorizedScreen />
    </Suspense>
    
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


export default AdminLayout