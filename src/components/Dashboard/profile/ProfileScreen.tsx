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
  PencilIcon,
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
import { ExtendedRecommendations, Profile } from "./types/profile-types"
import { Button } from "@/src/components/ui/button"
import { useToast } from "@/src/hooks/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import { generateUrl, getPagePath } from "@/src/utils/helpers"
import { useRef, useState } from "react"
import { UpdateUserProfilePictureAction } from "@/src/server-actions/User/User"

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
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleCopyUrl = async () => {
    try {
      const url = generateUrl(`${getPagePath("profile")}/${user?.unique_id}`)
      await navigator.clipboard.writeText(url)
      toast({
        title: "URL copied!",
        description: "Profile URL copied to clipboard",
        duration: 3000
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy URL",
        duration: 3000
      })
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        const res = await UpdateUserProfilePictureAction(
          file.name,
          base64,
          file.type
        )

        if (res?.success) {
          toast({
            title: "Profile picture updated!",
            description: "Your profile picture has been successfully updated.",
            duration: 3000
          })
          window.location.reload()
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: res?.error || "Failed to update profile picture",
            duration: 3000
          })
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
        duration: 3000
      })
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 relative">
      <div className="mb-6 flex items-center space-x-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={user?.profile_url as string}
              alt="Profile picture"
            />
            <AvatarFallback>Profile</AvatarFallback>
          </Avatar>
          <button
            className="absolute bottom-0 right-0 bg-background border rounded-full p-1 hover:bg-muted"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {user?.first_name}
            <span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={handleCopyUrl}
                    >
                      <LinkIcon className="h-2 w-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>Copy profile URL</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </h1>
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
              profileData?.recommendations as unknown as ExtendedRecommendations[]
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
