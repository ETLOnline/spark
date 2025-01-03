
import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import ProfileActivities from "@/src/components/Dashboard/profile/profile-activities"
import ProfileBio from "@/src/components/Dashboard/profile/profile-bio"
import ProfileCalendar from "@/src/components/Dashboard/profile/profile-calendar"
import ProfileRewards from "@/src/components/Dashboard/profile/profile-rewards"
import ProfileFollowActions from "@/src/components/Dashboard/profile/user/ProfileFollowActions"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { FindUserByUniqueIdAction } from "@/src/server-actions/User/FindUserByUniqueIdAction"
import { CalendarIcon, StarIcon, TrophyIcon, UserIcon } from "lucide-react"
import Link from "next/link"

interface ProfileScreenProps {
  params: {
    id: string
  }
  searchParams: {
    tab?: string
  }
}

export default async function ProfileScreen({
  params: { id },
  searchParams: { tab }
}: ProfileScreenProps) {
  const userRes = await FindUserByUniqueIdAction(id)
  if (userRes.error || !userRes.data) {
    return <NotFound />
  }

  const user = userRes.data

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={user?.profile_url || undefined}
              alt="Profile picture"
            />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <ProfileFollowActions user={user} />
      </div>
      <Tabs defaultValue="basic" className="space-y-4" value={tab || "basic"}>
        <TabsList>
          <Link href={`/profile/${id}/?tab=basic`}>
            <TabsTrigger value="basic">
              <UserIcon className="mr-2 h-4 w-4" />
              Bio/Basic
            </TabsTrigger>
          </Link>
          <Link href={`/profile/${id}/?tab=rewards`}>
            <TabsTrigger value="rewards">
              <TrophyIcon className="mr-2 h-4 w-4" />
              Rewards
            </TabsTrigger>
          </Link>
          <Link href={`/profile/${id}/?tab=activity`}>
            <TabsTrigger value="activity">
              <StarIcon className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
          </Link>
          <Link href={`/profile/${id}/?tab=calendar`}>
            <TabsTrigger value="calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
          </Link>
        </TabsList>
        <TabsContent value="basic">
          <ProfileBio editable={false} />
        </TabsContent>
        <TabsContent value="rewards">
          <ProfileRewards userId={id} />
        </TabsContent>
        <TabsContent value="activity">
          <ProfileActivities userId={id} />
        </TabsContent>
        <TabsContent value="calendar">
          <ProfileCalendar />
        </TabsContent>
      </Tabs>
    </div>
  )
}
