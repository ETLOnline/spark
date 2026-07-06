import { redirect } from "next/navigation"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { AvailabilityPageShell } from "@/src/components/Dashboard/profile/AvailabilityPageShell"
import { getUserRole } from "@/src/utils/helpers"

export default async function ManageAvailabilityPage() {
  const user = await AuthUserAction()
  if (!user) redirect("/sign-in")

  if (!getUserRole(user)?.includes("Mentor")) redirect("/profile")

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
