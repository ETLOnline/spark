"use client"

import EditProfileModal from "./edit-profile-modal"
import { Badge } from "../../ui/badge"
import { useAtomValue, useSetAtom } from "jotai"
import { profileStore } from "@/src/store/profile/profileStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetTagsForUserAction } from "@/src/server-actions/Tag/Tag"
import { useEffect } from "react"
import { Tag, TagStatus } from "./types/profile-types.d"
import Loader from "../../common/Loader/Loader"
import { LoaderSizes } from "../../common/Loader/types/loader-types.d"

type ProfileBioClientProps = {
  editable?: boolean
  userId: string
  userBio: string
}

const ProfileBioClient: React.FC<ProfileBioClientProps> = ({
  editable = true,
  userId,
  userBio
}) => {
  const setUserBio = useSetAtom(profileStore.bio)
  const setUserSkills = useSetAtom(profileStore.skills)
  const setUserInterests = useSetAtom(profileStore.interests)
  const skills = useAtomValue(profileStore.skills)
  const interests = useAtomValue(profileStore.interests)
  const bio = useAtomValue(profileStore.bio)

  const [getTagsLoading, tagsData, getTagsError, getTags] =
    useServerAction(GetTagsForUserAction)

  useEffect(() => {
    if (tagsData && tagsData.data) {
      const skillTags = tagsData?.data
        .filter((tag) => tag.type === "skill")
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          status: TagStatus.saved as const
        }))
      const interestTags = tagsData?.data
        .filter((tag) => tag.type === "interest")
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          status: TagStatus.saved as const
        }))
      setUserInterests(interestTags)
      setUserSkills(skillTags)
    }
  }, [tagsData])

  useEffect(() => {
    if (userId) {
      getTags(userId)
    }
  }, [userId])

  useEffect(() => {
    setUserBio(userBio)
  }, [userBio])

  return getTagsLoading ? (
    <div className={`${getTagsLoading && "flex items-center justify-center"}`}>
      <Loader size={LoaderSizes.xl} />
    </div>
  ) : (
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
              💿 Share your passions, hobbies, and guilty coding pleasures 💾
            </span>
          )}
        </div>
      </div>
    </>
  )
}

export default ProfileBioClient
