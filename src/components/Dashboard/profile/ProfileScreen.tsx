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
import {
  CalendarIcon,
  LinkIcon,
  StarIcon,
  TrophyIcon,
  UserIcon
} from "lucide-react"
import Link from "next/link"
import {
  SelectActivity,
  SelectReward,
  SelectTag,
  SelectUser
} from "@/src/db/schema"
import { ExtendedRecommendations, Profile } from "./types/profile-types.d"
import { usePathname } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { useToast } from "@/src/hooks/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"

type ProfileScreenProps = {
  tab?: string
  user: SelectUser
  profileData: Profile
}

export default function ProfileScreen({
  tab,
  user,
  profileData
}: ProfileScreenProps) {
  const pathname = usePathname()
  const { toast } = useToast()

  const handleCopyUrl = async () => {
    try {
      const url = `${window.location.origin}${pathname}/${user.unique_id}`
      await navigator.clipboard.writeText(url)
      toast({
        title: "URL copied!",
        description: "Profile URL copied to clipboard"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy URL"
      })
    }
  }

  return (
    <div className="container mx-auto p-6 relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-0 right-0"
              onClick={handleCopyUrl}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <span>Copy profile URL</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
          <span className="text-muted-foreground">{user?.email}</span>
        </div>
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
              profileData?.recommendations as ExtendedRecommendations
            }
            tags={profileData?.tags as SelectTag[]}
          />
        </TabsContent>
        <TabsContent value="rewards">
          <ProfileRewards rewards={profileData?.rewards as SelectReward[]} />
        </TabsContent>
        <TabsContent value="activity">
          <ProfileActivities
            activities={profileData?.activities as SelectActivity[]}
          />
        </TabsContent>
        {/* <TabsContent value="calendar">
            <ProfileCalendar />
          </TabsContent> */}
      </Tabs>
    </div>
  )
}
