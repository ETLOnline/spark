import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { GetUserPermissionsParsedAction } from "@/src/server-actions/UserRoles/UserRole"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { isSuperAdmin } from "@/src/utils/helpers"
import { AdvisorRequestsScreen } from "@/src/components/Dashboard/profile/AdvisorRequestsScreen"

export default async function AdvisorRequestsPage() {
  const user = await AuthUserAction()
  if (!user) redirect("/sign-in")

  const isAdmin = await isSuperAdmin(user)
  const permsResponse = await GetUserPermissionsParsedAction(user.unique_id)
  const permissionChecker = new PermissionChecker(
    "global",
    permsResponse.success ? permsResponse.data : null,
    isAdmin
  )
  if (!permissionChecker.canAccess("fyp.view_advisor_requests"))
    redirect("/profile")

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-foreground/5 shrink-0">
        <Link
          href="/profile"
          className="inline-flex items-center justify-center size-8 rounded-lg border border-transparent hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-sm font-semibold">Advisor Requests</h1>
          <p className="text-xs text-muted-foreground">
            Review and respond to student requests for your advisorship
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <AdvisorRequestsScreen />
      </div>
    </div>
  )
}
