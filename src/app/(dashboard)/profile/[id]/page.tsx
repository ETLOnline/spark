import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import ProfileActivities from "@/src/components/Dashboard/profile/profile-activities"
import ProfileBio from "@/src/components/Dashboard/profile/profile-bio"
import ProfileRewards from "@/src/components/Dashboard/profile/profile-rewards"
import { ExtendedRecommendations } from "@/src/components/Dashboard/profile/types/profile-types"
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

interface ProfileScreenProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    tab?: string
  }>
}

export default async function ProfileScreen(props: ProfileScreenProps) {
  const searchParams = await props.searchParams;

  const {
    tab
  } = searchParams;

  const params = await props.params;

  const {
    id
  } = params;
  
  const userId = (await AuthUserAction())?.unique_id

  const userRes = await FindUserByUniqueIdAction(id)
  const user = userRes.data
  let profileData

  if (userId === id) {
    redirect("/profile")
  }
  if (user) {
    profileData = await GetUserProfileAction(user.unique_id)
  }
  if (userRes.error || !userRes.data) {
    return <NotFound />
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center max-[892px]:items-start max-[892px]:flex-col max-[892px]:space-x-0 max-[892px]:space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={user?.profile_url as string}
              alt="Profile picture"
            />
            <AvatarFallback>Profile Image</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user?.first_name}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <ProfileFollowActions user={user as SelectUser} />
      </div>
      <Tabs defaultValue="basic" className="space-y-4" value={tab || "basic"}>
        <TabsList>
          <Link href={`?tab=basic`}>
            <TabsTrigger value="basic">
              <UserIcon className="mr-2 h-4 w-4" />
              Bio/Basic
            </TabsTrigger>
          </Link>
          <Link href={`?tab=rewards`}>
            <TabsTrigger value="rewards">
              <TrophyIcon className="mr-2 h-4 w-4" />
              Rewards
            </TabsTrigger>
          </Link>
          <Link href={`?tab=activity`}>
            <TabsTrigger value="activity">
              <StarIcon className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
          </Link>
          {/* <Link href={`?tab=calendar`}>
              <TabsTrigger value="calendar">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Calendar
              </TabsTrigger>
            </Link> */}
        </TabsList>
        <TabsContent value="basic">
          <ProfileBio
            userBio={user?.bio as string}
            recommendations={
              profileData?.data?.recommendations as unknown as ExtendedRecommendations[]
            }
            tags={profileData?.data?.tags as SelectTag[]}
            editable={false}
          />
        </TabsContent>
        <TabsContent value="rewards">
          <ProfileRewards
            rewards={profileData?.data?.rewards as SelectReward[]}
          />
        </TabsContent>
        <TabsContent value="activity">
          <ProfileActivities
            activities={profileData?.data?.activities as SelectActivity[]}
          />
        </TabsContent>
        {/* <TabsContent value="calendar">
            <ProfileCalendar />
          </TabsContent> */}
      </Tabs>
    </div>
  )
}
