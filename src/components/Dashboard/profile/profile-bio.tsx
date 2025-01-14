import { Card, CardContent } from "../../ui/card"
import { useAtomValue, useSetAtom } from "jotai"
import { profileStore } from "@/src/store/profile/profileStore"
import { useEffect } from "react"
import {
  ExtendedRecommendations,
  Tag,
  TagStatus
} from "./types/profile-types.d"
import EditProfileModal from "./edit-profile-modal"
import { Badge } from "../../ui/badge"
import { SelectTag } from "@/src/db/schema"

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
  const setUserBio = useSetAtom(profileStore.bio)
  const setUserSkills = useSetAtom(profileStore.skills)
  const setUserInterests = useSetAtom(profileStore.interests)
  const skills = useAtomValue(profileStore.skills)
  const interests = useAtomValue(profileStore.interests)
  const bio = useAtomValue(profileStore.bio)

  useEffect(() => {
    if (tags) {
      const skillTags = tags
        .filter((tag) => tag.type === "skill")
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          status: TagStatus.saved as const
        }))
      const interestTags = tags
        .filter((tag) => tag.type === "interest")
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          status: TagStatus.saved as const
        }))
      setUserInterests(interestTags)
      setUserSkills(skillTags)
    }
  }, [tags])

  useEffect(() => {
    setUserBio(userBio)
  }, [userBio])

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <>
          <div className="bio-summary">
            <header className="profile-section-header flex justify-between">
              <h3 className="mb-2 font-semibold">Bio</h3>
              {editable && <EditProfileModal />}
            </header>
            <p className="user-bio">
              {bio ?? (
                <span style={{ fontStyle: "italic" }}>
                  Time to shine ✨ Tell the world about yourself
                </span>
              )}
            </p>
          </div>
          <div className="skill-tags">
            <header className="profile-section-header flex justify-between">
              <h3 className="mb-2 font-semibold">Skills</h3>
            </header>
            <div className="flex flex-wrap gap-2">
              {skills.length ? (
                skills.map((skill: Tag) => (
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
          <div className="interest-tags">
            <div className="profile-section-header flex justify-between">
              <h3 className="mb-2 font-semibold">Interests</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.length ? (
                interests.map((interest: Tag) => (
                  <Badge key={interest.id} variant="outline">
                    {interest.name}
                  </Badge>
                ))
              ) : (
                <span style={{ fontStyle: "italic" }}>
                  💿 Share your passions, hobbies, and guilty coding pleasures
                  💾
                </span>
              )}
            </div>
          </div>
          <div className="recommendations">
            <h3 className="mb-2 font-semibold">Recommendations</h3>
            <ul className="space-y-2">
              {recommendations &&
                recommendations.map((recommendation, i) => (
                  <li key={i} className="rounded-lg border p-3">
                    <p className="text-sm">
                      &quot;{recommendation.content}&quot;
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      - {recommendation.recommender_full_name}
                    </p>
                  </li>
                ))}
            </ul>
          </div>
        </>
      </CardContent>
    </Card>
  )
}

export default ProfileBio
