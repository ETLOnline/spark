"use client"

import { Card, CardTitle } from "../../ui/card"
import { useEffect, useState } from "react"
import { Badge } from "../../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { SelectTag } from "@/src/db/schema"
import useUserProfile from "./hooks/useUserProfile"

type ProfileBioProps = {
  userBio: string
  editable?: boolean
  tags: SelectTag[]
}

const ProfileBio: React.FC<ProfileBioProps> = ({ userBio, tags }) => {
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
          <TabsTrigger className="text-black font-" value="skills">
            Skills
          </TabsTrigger>
          <TabsTrigger className="text-black font-thin" value="interests">
            Interests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="mt-4">
          <Card className="flex flex-col flex-wrap gap-5 p-3">
            <CardTitle>Technical Skills</CardTitle>
            <div className="flex flex-wrap gap-2 mt-3">
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
            <CardTitle>Interests</CardTitle>
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
