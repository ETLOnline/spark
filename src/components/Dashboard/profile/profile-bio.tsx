"use client"

import { Card } from "../../ui/card"
import { useEffect } from "react"
import { ExtendedRecommendations } from "./types/profile-types"
import { Badge } from "../../ui/badge"
import { SelectTag } from "@/src/db/schema"
import useUserProfile from "./hooks/useUserProfile"

type ProfileBioProps = {
  userBio: string
  editable?: boolean
  recommendations: ExtendedRecommendations[]
  tags: SelectTag[]
}

const ProfileBio: React.FC<ProfileBioProps> = ({
  userBio,
  editable = true,
  recommendations,
  tags
}) => {
  const [setUserBio, setUserSkills, setUserInterests, skills, interests, bio] =
    useUserProfile()

  useEffect(() => {
    if (tags.length) {
      const skillTags = tags.filter((tag) => (tag.type || "") === "skill")

      const interestTags = tags.filter((tag) => (tag.type || "") === "interest")

      setUserInterests(interestTags)

      setUserSkills(skillTags)
    }
  }, [tags])

  useEffect(() => {
    setUserBio(userBio)
  }, [userBio])

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-3 sm:p-5">
        <div className="bio-summary">
          <header className="profile-section-header flex justify-between">
            <h3 className="mb-2 font-semibold">About</h3>
          </header>
          <p className="user-bio">
            {bio ?? (
              <span style={{ fontStyle: "italic" }}>
                Time to shine ✨ Tell the world about yourself
              </span>
            )}
          </p>
        </div>
      </Card>

      <Card className="p-3 sm:p-5">
        <div className="skill-tags">
          <header className="profile-section-header flex justify-between">
            <h3 className="mb-2 font-semibold">Skills</h3>
          </header>
          <div className="flex flex-wrap gap-2">
            {skills.length ? (
              skills.map((skill) => (
                <Badge key={skill.id} variant="secondary">
                  {skill.name}
                </Badge>
              ))
            ) : (
              <span style={{ fontStyle: "italic" }}>
                HTML ninja? 🥷 Python wizard? 🪄 Show off your superpowers!
              </span>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-5">
        <div className="interest-tags">
          <div className="profile-section-header flex justify-between">
            <h3 className="mb-2 font-semibold">Interests</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.length ? (
              interests.map((interest) => (
                <Badge key={interest.id} variant="secondary">
                  {interest.name}
                </Badge>
              ))
            ) : (
              <span style={{ fontStyle: "italic" }}>
                💿 Share your passions, hobbies, and guilty coding pleasures 💾
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProfileBio
