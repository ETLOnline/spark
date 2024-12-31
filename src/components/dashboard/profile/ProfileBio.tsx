"use client"

import { Badge } from "../../ui/badge"
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader
} from "../../ui/card"
import { Recommendation, Tag, TagStatus } from "./types/profile-types.d"
import EditProfileModal from "./EditProfileModal"
import { useEffect, useState } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetUserBioForUserAction } from "@/src/server-actions/User/User"
import { GetTagsForUserAction } from "@/src/server-actions/Tag/Tag"
import { useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { profileStore } from "@/src/store/profile/profileStore"

type Props = {
  editable?: boolean
}

const ProfileBio: React.FC<Props> = ({ editable = true }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      name: "Jane Doe",
      text: "An exceptional developer with a keen eye for detail."
    },
    { name: "John Smith", text: "Always delivers high-quality work on time." }
  ])

  const user = useAtomValue(userStore.Iam)
  const setUserBio = useSetAtom(profileStore.bio)
  const setUserSkills = useSetAtom(profileStore.skills)
  const setUserInterests = useSetAtom(profileStore.interests)
  const skills = useAtomValue(profileStore.skills)
  const interests = useAtomValue(profileStore.interests)
  const bio = useAtomValue(profileStore.bio)

  const [getBioLoading, bioData, getBioError, getBio] = useServerAction(
    GetUserBioForUserAction
  )
  const [getTagsLoading, tagsData, getTagsError, getTags] =
    useServerAction(GetTagsForUserAction)

  useEffect(() => {
    if (tagsData && tagsData.data) {
      const skillTags = tagsData?.data
        .filter((tag) => tag.type === "skill")
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          status: TagStatus[1] as const
        }))
      const interestTags = tagsData?.data
        .filter((tag) => tag.type === "interest")
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          status: TagStatus[1] as const
        }))
      setUserInterests(interestTags)
      setUserSkills(skillTags)
    }
  }, [tagsData])

  useEffect(() => {
    if (user) {
      ;(async () => {
        getBio(user?.external_auth_id)
        getTags(user?.external_auth_id)
      })()
    }
  }, [user])

  useEffect(() => {
    setUserBio(bioData?.data as string)
  }, [bioData])

  return (
    <Card>
      <CardHeader>
        <header className="profile-section-header flex justify-between">
          <CardTitle>Bio</CardTitle>
          {editable && <EditProfileModal />}
        </header>
        <CardDescription>{bio}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <header className="profile-section-header flex justify-between">
            <h3 className="mb-2 font-semibold">Skills</h3>
          </header>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: Tag) => (
              <Badge key={skill.id} variant="secondary">
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <div className="profile-section-header flex justify-between">
            <h3 className="mb-2 font-semibold">interestTags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest: Tag) => (
              <Badge key={interest.id} variant="outline">
                {interest.name}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Recommendations</h3>
          <ul className="space-y-2">
            {recommendations.map((recommendation: Recommendation, i) => (
              <li key={i} className="rounded-lg border p-3">
                <p className="text-sm">&quot;{recommendation.text}&quot;</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  - {recommendation.name}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileBio
