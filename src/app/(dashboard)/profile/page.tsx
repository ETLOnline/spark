import ProfileActivities from "@/src/components/dashboard/Profile/ProfileActivities"
import ProfileBio from "@/src/components/dashboard/Profile/ProfileBio"
import ProfileCalendar from "@/src/components/dashboard/Profile/ProfileCalendar"
import ProfileRewards from "@/src/components/dashboard/Profile/ProfileRewards"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { CalendarIcon, StarIcon, TrophyIcon, UserIcon } from "lucide-react"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import NotFound from "@/src/components/dashboard/NotFound/NotFound"
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
  const user = await AuthUserAction()

  if (!user) {
    return <NotFound />
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center space-x-4">
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
      <Tabs defaultValue="basic" className="space-y-4" value={tab || "basic"}>
        <TabsList>
          <Link href={`/profile/?tab=basic`}>
            <TabsTrigger value="basic">
              <UserIcon className="mr-2 h-4 w-4" />
              Bio/Basic
            </TabsTrigger>
          </Link>
          <Link href={`/profile/?tab=rewards`}>
            <TabsTrigger value="rewards">
              <TrophyIcon className="mr-2 h-4 w-4" />
              Rewards
            </TabsTrigger>
          </Link>
          <Link href={`/profile/?tab=activity`}>
            <TabsTrigger value="activity">
              <StarIcon className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
          </Link>
          <Link href={`/profile/?tab=calendar`}>
            <TabsTrigger value="calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
          </Link>
        </TabsList>
        <TabsContent value="basic">
          <ProfileBio />
        </TabsContent>
        <TabsContent value="rewards">
          <ProfileRewards userId={user.external_auth_id} />
        </TabsContent>
        <TabsContent value="activity">
          <ProfileActivities userId={user.external_auth_id} />
        </TabsContent>
        <TabsContent value="calendar">
          <ProfileCalendar />
        </TabsContent>
      </Tabs>
    </div>
  )
}
