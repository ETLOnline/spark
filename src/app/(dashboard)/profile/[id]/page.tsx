import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import ProfileActivities from "@/src/components/Dashboard/profile/profile-activities"
import ProfileBio from "@/src/components/Dashboard/profile/profile-bio"
import ProfileRewards from "@/src/components/Dashboard/profile/profile-rewards"
import ProfileScreen from "@/src/components/Dashboard/profile/ProfileScreen"
import {
  ExtendedRecommendations,
  Profile
} from "@/src/components/Dashboard/profile/types/profile-types"
import ProfileFollowActions from "@/src/components/Dashboard/profile/user/ProfileFollowActions"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import {
  SelectActivity,
  SelectReward,
  SelectTag,
  SelectUser
} from "@/src/db/schema"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { FindUserByUniqueIdAction } from "@/src/server-actions/User/FindUserByUniqueIdAction"
import { GetUserProfileAction } from "@/src/server-actions/User/User"
import { CalendarIcon, StarIcon, TrophyIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

interface ProfileScreenProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    tab?: string
  }>
}

export default async function PublicProfilePage(props: ProfileScreenProps) {
  const searchParams = await props.searchParams

  const { tab } = searchParams

  const params = await props.params

  const { id } = params

  const userId = (await AuthUserAction())?.unique_id

  const userRes = await FindUserByUniqueIdAction(id)
  const user = userRes.data
  let profileData

  if (userId === id) {
    redirect("/profile")
  }
  if (user) {
    const res = await GetUserProfileAction(user.unique_id)
    if (res) {
      profileData = res.data
    }
  }
  if (userRes.error || !userRes.data) {
    return <NotFound />
  }

  return (
    <Suspense>
      <ProfileScreen
        tab={tab}
        user={user as SelectUser}
        profileData={profileData as Profile}
      />
    </Suspense>
  )
}
