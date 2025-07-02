import { getPersonasAction } from "@/src/server-actions/UserRoles/UserRole"
import SelectPersonaPage from "@/src/components/Parsona/SelectPersonaPage"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { checkUserPersonaCompletion, isSuperAdmin } from "@/src/utils/helpers"
import { redirect } from "next/navigation"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { UserCircle } from "lucide-react"

export default async function PersonasPage() {
  const personasResult = await getPersonasAction()
  const authUser = await AuthUserAction()

  if (!personasResult.success || !personasResult.data) {
    return (
      <NoDataCard
        title="No Personas Found"
        description="There was an error loading personas. Please try again later."
        icon={<UserCircle className="h-10 w-10 text-muted-foreground" />}
      />
    )
  }

  if (!authUser) {
    return (
      <NoDataCard
        title="Error Loading User"
        description="Please sign in again to access this page."
        icon={<UserCircle className="h-10 w-10 text-muted-foreground" />}
      />
    )
  }

  const hasPersona = await checkUserPersonaCompletion(authUser)
  const superAdmin = await isSuperAdmin(authUser)

  if (hasPersona || superAdmin) {
    redirect("/profile")
  }

  return <SelectPersonaPage roles={personasResult.data} userAuth={authUser} />
}
