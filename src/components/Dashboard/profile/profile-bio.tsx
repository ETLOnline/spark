"use client"

import { Card, CardTitle } from "../../ui/card"
import { useEffect, useState } from "react"
import { Badge } from "../../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { SelectTag } from "@/src/db/schema"
import useUserProfile from "./hooks/useUserProfile"
import EditProfileModal from "./edit-profile-modal"

type ProfileBioProps = {
  userBio: string
  editable?: boolean
  tags: SelectTag[]
  isMyProfile?: boolean
}

const ProfileBio: React.FC<ProfileBioProps> = ({
  userBio,
  tags,
  isMyProfile
}) => {
  const [setUserBio, setUserSkills, setUserInterests, skills, interests, bio] =
    useUserProfile()
  const [activeTab, setActiveTab] = useState<"skills" | "interests">("skills")

  useEffect(() => {
    if (tags && tags.length) {
      const skillTags = tags.filter(
        (tag) => (tag.type || "").toLowerCase() === "skill"
      )
      const interestTags = tags.filter(
        (tag) => (tag.type || "").toLowerCase() === "interest"
      )

      setUserInterests(interestTags)
      setUserSkills(skillTags)
    }
  }, [tags, setUserInterests, setUserSkills])

  useEffect(() => {
    setUserBio(userBio)
  }, [userBio, setUserBio])

  return (
    <div>
      <Tabs
        defaultValue={activeTab}
        onValueChange={(value) => setActiveTab(value as "skills" | "interests")}
      >
        <TabsList className="grid w-full grid-cols-2 bg-muted">
          <TabsTrigger
            className="text-black dark:text-white font-"
            value="skills"
          >
            Skills
          </TabsTrigger>
          <TabsTrigger
            className="text-black dark:text-white font-thin"
            value="interests"
          >
            Interests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="mt-4">
          <Card className="flex flex-col flex-wrap gap-5 p-3">
            <CardTitle className="flex items-center justify-between">
              Technical Skills
              {isMyProfile ? <EditProfileModal /> : null}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {skills.length ? (
                skills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  HTML ninja? 🥷 Python wizard? 🪄 Add some skills to show here.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="interests" className="mt-4">
          <Card className="flex flex-col flex-wrap gap-5 p-3">
            <CardTitle className="flex items-center justify-between">
              Interests
              {isMyProfile ? <EditProfileModal /> : null}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {interests.length ? (
                interests.map((interest) => (
                  <Badge key={interest.id} variant="secondary">
                    {interest.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  💿 Share your passions, hobbies, and guilty coding pleasures.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProfileBio
