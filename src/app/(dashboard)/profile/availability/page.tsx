import { redirect } from "next/navigation"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { AvailabilityPageShell } from "@/src/components/Dashboard/profile/AvailabilityPageShell"
import { GetUserPermissionsParsedAction } from "@/src/server-actions/UserRoles/UserRole"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { isSuperAdmin } from "@/src/utils/helpers"

export default async function ManageAvailabilityPage() {
  const user = await AuthUserAction()
  if (!user) redirect("/sign-in")

  const isAdmin = await isSuperAdmin(user)
  const permsResponse = await GetUserPermissionsParsedAction(user.unique_id)
  const permissionChecker = new PermissionChecker(
    "global",
    permsResponse.success ? permsResponse.data : null,
    isAdmin
  )
  if (!permissionChecker.canAccess("mentorship.add_availibility"))
    redirect("/profile")

  return (
    <AvailabilityPageShell
      backHref="/profile"
      title="Manage Availability"
      subtitle="Set your weekly recurring availability slots"
      userId={user.unique_id}
      isMyProfile={true}
    />
  )
}
