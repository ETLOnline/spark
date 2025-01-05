import EditProfileModal from "./edit-profile-modal"
import { Badge } from "../../ui/badge"
import { useAtomValue, useSetAtom } from "jotai"
import { profileStore } from "@/src/store/profile/profileStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetBioForUserAction } from "@/src/server-actions/User/User"
import { GetTagsForUserAction } from "@/src/server-actions/Tag/Tag"
import { useEffect } from "react"
import { Tag, TagStatus } from "./types/profile-types"
import Loader from "../../common/Loader/Loader"
import { LoaderSizes } from "../../common/Loader/types/loader-types"

type ProfileBioClientProps = {
  editable?: boolean
  userId: string
}

const ProfileBioClient: React.FC<ProfileBioClientProps> = ({
  editable = true,
  userId
}) => {
  const setUserBio = useSetAtom(profileStore.bio)
  const setUserSkills = useSetAtom(profileStore.skills)
  const setUserInterests = useSetAtom(profileStore.interests)
  const skills = useAtomValue(profileStore.skills)
  const interests = useAtomValue(profileStore.interests)
  const bio = useAtomValue(profileStore.bio)

  const [getBioLoading, bioData, getBioError, getBio] =
    useServerAction(GetBioForUserAction)
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
    if (userId) {
      getBio(userId)
      getTags(userId)
    }
  }, [userId])

  useEffect(() => {
    setUserBio(bioData?.data as string)
  }, [bioData])

  return getTagsLoading || getBioLoading ? (
    <Loader size={LoaderSizes.xl} />
  ) : (
    <>
      <div className="bio-summary">
        <header className="profile-section-header flex justify-between">
          <h3 className="mb-2 font-semibold">Bio</h3>
          {editable && <EditProfileModal />}
        </header>
        <p className="user-bio">{bio}</p>
      </div>
      <div className="skill-tags">
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
      <div className="interest-tags">
        <div className="profile-section-header flex justify-between">
          <h3 className="mb-2 font-semibold">Interests</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest: Tag) => (
            <Badge key={interest.id} variant="outline">
              {interest.name}
            </Badge>
          ))}
        </div>
      </div>
    </>
  )
}

export default ProfileBioClient
