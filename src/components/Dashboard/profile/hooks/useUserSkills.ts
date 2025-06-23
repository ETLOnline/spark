import { useServerAction } from "@/src/hooks/useServerAction"
import { SearchTagsForSuggestionsAction } from "@/src/server-actions/Tag/Tag"
import { SetStateAction, useAtomValue, useSetAtom } from "jotai"
import { profileStore } from "@/src/store/profile/profileStore"
import { SelectTag } from "@/src/db/schema"

type UseUserSkillsReturn = [
  skills: SelectTag[], // Current skills
  setSkills: (value: SetStateAction<SelectTag[]>) => void, // Skills setter
  suggestions: SelectTag[], // Search suggestions
  searchSkillsForUserInput: (name: string) => void, // Search function
  searchSkillsLoading: boolean // Loading state
]

const useUserSkills = (): UseUserSkillsReturn => {
  const skills = useAtomValue(profileStore.skills)
  const setSkills = useSetAtom(profileStore.skills)

  const [searchSkillsLoading, searchedSkills, searchSkillsError, searchSkills] =
    useServerAction(SearchTagsForSuggestionsAction)

  const suggestions = searchedSkills?.data ?? []

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
