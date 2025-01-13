"use client"

import ProfileActivities from "@/src/components/Dashboard/profile/profile-activities"
import ProfileBio from "@/src/components/Dashboard/profile/profile-bio"
// import ProfileCalendar from "@/src/components/Dashboard/profile/profile-calendar"
import ProfileRewards from "@/src/components/Dashboard/profile/profile-rewards"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { CalendarIcon, StarIcon, TrophyIcon, UserIcon } from "lucide-react"
import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import Link from "next/link"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetUserProfileAction } from "@/src/server-actions/User/User"
import { SelectActivity, SelectReward, SelectTag } from "@/src/db/schema"
import { ExtendedRecommendations } from "./types/profile-types.d"
import { LoaderSizes } from "../../common/Loader/types/loader-types.d"
import Loader from "../../common/Loader/Loader"
import { Provider, useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { useEffect } from "react"

type ProfileScreenProps = { tab?: string }

export default async function ProfileScreen({ tab }: ProfileScreenProps) {
  const user = useAtomValue(userStore.Iam)

  const [profileLoading, profileData, profileDataError, getProfile] =
    useServerAction(GetUserProfileAction)

  useEffect(() => {
    if (user) {
      getProfile(user.unique_id)
    }
  }, [user])

  if (!user) {
    return <NotFound />
  }

  return (
    // <Provider>
      profileLoading ? (
        <div className={"flex items-center justify-center"}>
          <Loader size={LoaderSizes.xl} />
        </div>
      ) : (
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
          <Tabs
            defaultValue="basic"
            className="space-y-4"
            value={tab || "basic"}
          >
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
                userBio={user.bio as string}
                recommendations={
                  profileData?.data?.recommendations as ExtendedRecommendations
                }
                tags={profileData?.data?.tags as SelectTag[]}
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
    // </Provider>
  )
}
