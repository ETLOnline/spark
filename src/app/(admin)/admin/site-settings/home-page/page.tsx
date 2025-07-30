"use client"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import MultiSelect, {
  MultiSelectOption
} from "@/src/components/ui/multi-select"
import { SelectCommunity, SelectUser } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetCommunitiesAction } from "@/src/server-actions/Community/Community"
import {
  AddCommunitiesAction,
  AddMentorsAction,
  GetSitSettingsAction
} from "@/src/server-actions/Site-Settings/site-settings"
import { GetMentorsAction } from "@/src/server-actions/User/User"
import { Save } from "lucide-react"
import React, { use, useEffect, useState } from "react"

function HomeSiteSettingsPage() {
  const [mentors, setMentors] = useState<SelectUser[]>([])
  const [selectedMentors, setSelectedMentors] = useState<MultiSelectOption[]>(
    []
  )

  const [communities, setCommunities] = useState<SelectCommunity[]>([])
  const [selectedCommunities, setSelectedCommunities] = useState<
    MultiSelectOption[]
  >([])

  const [addMentorsLoading, , , AddMentors] = useServerAction(AddMentorsAction)
  const [addCommunitiesLoading, , , AddCommunities] =
    useServerAction(AddCommunitiesAction)

  const [getSiteSettingsLoading, siteSettings, , GetSiteSettings] =
    useServerAction(GetSitSettingsAction)

  useEffect(() => {
    const fetchData = async () => {
      await GetSiteSettings({
        page: "home"
      })

      const mentors = await GetMentorsAction()
      if (mentors?.success && mentors.data) {
        setMentors(mentors.data)
      }

      const communities = await GetCommunitiesAction()
      if (communities?.success && communities.data) {
        setCommunities(communities.data.communities)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (mentors.length > 0 && communities.length > 0) {
      const Getdata = async () => {
        const mentorIds =
          (siteSettings?.data?.find(
            (setting: any) => setting.key === "featured_mentors"
          )?.value as string[]) || []
        const communityIds =
          (siteSettings?.data?.find(
            (setting: any) => setting.key === "featured_communities"
          )?.value as string[]) || []

        const filteredMentors = mentors.filter((mentor: SelectUser) =>
          mentorIds.includes(mentor.unique_id)
        )
        const filteredCommunities = communities.filter(
          (community: SelectCommunity) => communityIds.includes(community.id)
        )

        setSelectedMentors(
          filteredMentors.map((mentor: SelectUser) => ({
            value: mentor.unique_id,
            label: `${mentor.first_name} ${mentor.last_name}`
          }))
        )

        setSelectedCommunities(
          filteredCommunities.map((community: SelectCommunity) => ({
            value: community.id,
            label: community.title
          }))
        )
      }
      Getdata()
    }
  }, [mentors, communities, siteSettings])

  const handleAddMentors = async () => {
    try {
      const mentorIds = selectedMentors.map((m) => m.value)
      const response = await AddMentors(mentorIds)

      if (response?.success && response.data) {
        toast({
          title: "Mentors added successfully",
          description: "Featured mentors have been updated.",
          duration: 3000
        })
      } else {
        console.error("Failed to add mentors:", response?.error)
        toast({
          title: "Failed to add mentors",
          description: "An error occurred while adding mentors.",
          variant: "destructive",
          duration: 3000
        })
      }
    } catch {
      console.error("Failed to add mentors")
    }
  }

  const handleAddCommunities = async () => {
    try {
      const communitiesIds = selectedCommunities.map((c) => c.value)
      const response = await AddCommunities(communitiesIds)

      if (response?.success && response.data) {
        toast({
          title: "Communities added successfully",
          description: "Featured communities have been updated.",
          duration: 3000
        })
      } else {
        console.error("Failed to add communities:", response?.error)
        toast({
          title: "Failed to add communities",
          description: "An error occurred while adding communities.",
          variant: "destructive",
          duration: 3000
        })
      }
    } catch {
      console.error("Failed to add communities")
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">
            Manage home page featured content
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Dynamic Feature Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Mentors</CardTitle>
            <CardDescription>
              Manage mentor that will be featured on the home page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label>Add Mentors</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <MultiSelect
                  options={mentors.map((mentor) => ({
                    value: mentor.unique_id,
                    label: mentor.first_name + " " + mentor.last_name
                  }))}
                  selected={selectedMentors}
                  onChange={setSelectedMentors}
                  placeholder="Select Mentors"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              className="items-end"
              onClick={handleAddMentors}
              loading={addMentorsLoading}
              disabled={addMentorsLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Featured Communities</CardTitle>
            <CardDescription>
              Manage community that will be featured on the home page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label>Add Community</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <MultiSelect
                  options={communities.map((community) => ({
                    value: community.id,
                    label: community.title
                  }))}
                  selected={selectedCommunities}
                  onChange={setSelectedCommunities}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              className="items-end"
              onClick={handleAddCommunities}
              loading={addCommunitiesLoading}
              disabled={addCommunitiesLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default HomeSiteSettingsPage
