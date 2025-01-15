import { profileStore } from "@/src/store/profile/profileStore"
import { useAtomValue, useSetAtom } from "jotai"
import { Tag } from "../types/profile-types.d"

type UseUserProfileReturn = [
  setUserBio: React.Dispatch<React.SetStateAction<string>>,
  setUserSkills: React.Dispatch<React.SetStateAction<Tag[]>>,
  setUserInterests: React.Dispatch<React.SetStateAction<Tag[]>>,
  skills: Tag[],
  interests: Tag[],
  bio: string
]

const useUserProfile = (): UseUserProfileReturn => {
  const setUserBio = useSetAtom(profileStore.bio)
  const setUserSkills = useSetAtom(profileStore.skills)
  const setUserInterests = useSetAtom(profileStore.interests)
  const skills = useAtomValue(profileStore.skills)
  const interests = useAtomValue(profileStore.interests)
  const bio = useAtomValue(profileStore.bio)

  return [setUserBio, setUserSkills, setUserInterests, skills, interests, bio]
}

export default useUserProfile
