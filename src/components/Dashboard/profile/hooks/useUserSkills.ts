import { Tag, TagStatus } from "../types/profile-types.d"
import { useServerAction } from "@/src/hooks/useServerAction"
import { SearchTagsForSuggestionsAction } from "@/src/server-actions/Tag/Tag"
import { SetStateAction, useAtomValue, useSetAtom } from "jotai"
import { profileStore } from "@/src/store/profile/profileStore"

type UseUserSkillsReturn = [
  skills: Tag[], // Current skills
  setSkills: (value: SetStateAction<Tag[]>) => void, // Skills setter
  suggestions: Tag[], // Search suggestions
  searchSkillsForUserInput: (name: string) => void, // Search function
  searchSkillsLoading: boolean // Loading state
]

const useUserSkills = (): UseUserSkillsReturn => {
  const skills = useAtomValue(profileStore.skills)
  const setSkills = useSetAtom(profileStore.skills)

  const [searchSkillsLoading, searchedSkills, searchSkillsError, searchSkills] =
    useServerAction(SearchTagsForSuggestionsAction)

  const suggestions: Tag[] = searchedSkills?.data
    ? searchedSkills.data.map((tag) => ({
        name: tag.name,
        id: tag.id,
        status: TagStatus[2] as const
      }))
    : []

  const searchSkillsForUserInput = (name: string) => {
    try {
      searchSkills(name, "skill")
    } catch (error) {
      console.error(error)
    }
  }

  return [
    skills,
    setSkills,
    suggestions,
    searchSkillsForUserInput,
    searchSkillsLoading
  ]
}

export default useUserSkills
