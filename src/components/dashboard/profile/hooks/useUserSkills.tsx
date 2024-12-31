import { Dispatch, useEffect, useState } from "react"
import { Tag, TagStatus } from "../types/profile-types.d"
import { useServerAction } from "@/src/hooks/useServerAction"
import { SearchTagsForSuggestionsAction } from "@/src/server-actions/Tag/Tag"
import { SetStateAction, useAtomValue, useSetAtom } from "jotai"
import { profileStore } from "@/src/store/profile/profileStore"
import { userStore } from "@/src/store/user/userStore"

type UseUserSkillsReturn = [
  skills: Tag[], // Current skills
  setSkills: (value: SetStateAction<Tag[]>) => void, // Skills setter
  newSkills: Tag[], // New skills being added
  setNewSkills: Dispatch<SetStateAction<Tag[]>>, // New skills setter
  selectedSkills: Tag[], // Selected existing skills
  setSelectedSkills: Dispatch<SetStateAction<Tag[]>>, // Selected skills setter
  savedSkills: Tag[], // Previously saved skills
  setSavedSkills: Dispatch<SetStateAction<Tag[]>>, // Saved skills setter
  updatedSkills: Tag[], // Combined skills array
  suggestions: Tag[], // Search suggestions
  searchSkillsForUserInput: (name: string) => void, // Search function
  searchSkillsLoading: boolean // Loading state
]

const useUserSkills = (): UseUserSkillsReturn => {
  const skills = useAtomValue(profileStore.skills)
  const setSkills = useSetAtom(profileStore.skills)
  const user = useAtomValue(userStore.Iam)

  const [newSkills, setNewSkills] = useState<Tag[]>([])
  const [selectedSkills, setSelectedtedSkills] = useState<Tag[]>([])
  const [savedSkills, setSavedSkills] = useState<Tag[]>([])

  const updatedSkills: Tag[] = [...savedSkills, ...selectedSkills, ...newSkills]

  const [searchSkillsLoading, searchedSkills, searchSkillsError, searchSkills] =
    useServerAction(SearchTagsForSuggestionsAction)

  const suggestions: Tag[] = searchedSkills?.data
    ? searchedSkills.data.map((tag) => ({
        name: tag.name,
        id: tag.id,
        status: TagStatus[2] as const
      }))
    : []

  useEffect(() => {
    setSavedSkills([...skills])
  }, [skills])

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
    newSkills,
    setNewSkills,
    selectedSkills,
    setSelectedtedSkills,
    savedSkills,
    setSavedSkills,
    updatedSkills,
    suggestions,
    searchSkillsForUserInput,
    searchSkillsLoading
  ]
}

export default useUserSkills
