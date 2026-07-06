import { redirect } from "next/navigation"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { FindUserByUniqueIdAction } from "@/src/server-actions/User/FindUserByUniqueIdAction"
import { AvailabilityPageShell } from "@/src/components/Dashboard/profile/AvailabilityPageShell"
import NotFound from "@/src/components/Dashboard/NotFound/NotFound"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ViewAvailabilityPage({ params }: Props) {
  const { id } = await params
  const authUser = await AuthUserAction()
  if (!authUser) redirect("/sign-in")

  if (authUser.unique_id === id) redirect("/profile/availability")

  const userRes = await FindUserByUniqueIdAction(id)
  if (userRes.error || !userRes.data) return <NotFound />

  const mentor = userRes.data
  const mentorName = `${mentor.first_name} ${mentor.last_name}`

  return (
    <AvailabilityPageShell
      backHref={`/profile/${id}`}
      title={`${mentorName}'s Availability`}
      subtitle="View weekly recurring availability slots"
      userId={id}
      isMyProfile={false}
    />
  )
}
