"use client"

import ProfileActivities from "@/src/components/dashboard/Profile/profile-activities"
import ProfileBio from "@/src/components/dashboard/Profile/profile-bio"
import ProfileCalendar from "@/src/components/dashboard/Profile/profile-calendar"
import ProfileRewards from "@/src/components/dashboard/Profile/profile-rewards"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { CalendarIcon, StarIcon, TrophyIcon, UserIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

export default function ProfileScreen() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<string>("basic")

  const { user } = useUser()

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user?.imageUrl} alt="Profile picture" />
          <AvatarFallback>Profile Image</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user?.fullName}</h1>
          <p className="text-muted-foreground">
            {user?.emailAddresses[0].emailAddress}
          </p>
        </div>
      </div>
      <Tabs defaultValue="basic" className="space-y-4" value={activeTab}>
        <TabsList>
          <TabsTrigger value="basic" onClick={() => setActiveTab("basic")}>
            <UserIcon className="mr-2 h-4 w-4" />
            Bio/Basic
          </TabsTrigger>
          <TabsTrigger value="rewards" onClick={() => setActiveTab("rewards")}>
            <TrophyIcon className="mr-2 h-4 w-4" />
            Rewards
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            onClick={() => setActiveTab("activity")}
          >
            <StarIcon className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            onClick={() => setActiveTab("calendar")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <ProfileBio />
        </TabsContent>
        <TabsContent value="rewards">
          <ProfileRewards />
        </TabsContent>
        <TabsContent value="activity">
          <ProfileActivities />
        </TabsContent>
        <TabsContent value="calendar">
          <ProfileCalendar />
        </TabsContent>
      </Tabs>
    </div>
  )
}
