import { Dispatch, useEffect, useState } from "react"
import { Tag, TagStatus } from "../types/profile-types.d"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  AddExistingTagsForUser,
  AddNewTagsForUser,
  DeleteTagsForUser,
  SearchTagsForSuggestions
} from "@/src/server-actions/Tag/Tag"
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
  searchSkillsLoading: boolean, // Loading state
  updateSkills: () => Promise<void> // Update function
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
    useServerAction(SearchTagsForSuggestions)
  const [
    addNewSkillsLoading,
    addedNewSkillsData,
    addNewSkillsError,
    addNewSkills
  ] = useServerAction(AddNewTagsForUser)
  const [
    addExistingSkillsLoading,
    addedExistingSkillsData,
    addExistingSkillsError,
    addExistingSkills
  ] = useServerAction(AddExistingTagsForUser)
  const [
    deleteSkillsLoading,
    deletedSkillsData,
    deleteSkillsError,
    deleteSkills
  ] = useServerAction(DeleteTagsForUser)

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

  const updateSkills = async () => {
    if (!user) return
    try {
      const deletedSkillsIds: number[] = skills
        .filter(
          (tag: Tag) =>
            !savedSkills.find((updatedTag) => tag.id === updatedTag.id)
        )
        .map((tag: Tag) => tag.id as number)
      await deleteSkills(user.external_auth_id, deletedSkillsIds)
      await addNewSkills(
        newSkills.map((tag) => {
          return { name: tag.name, type: "skill" }
        }),
        user.external_auth_id
      )
      await addExistingSkills(
        selectedSkills.map((tag) => {
          return { name: tag.name, id: tag.id, type: "skill" }
        }),
        user.external_auth_id
      )
      setSkills((skills: Tag[]) => {
        skills = skills.filter(
          (tag) => !deletedSkillsIds.includes(tag.id as number)
        ) // remove deleted skills
        return [...skills, ...newSkills, ...selectedSkills]
      })
      setSavedSkills([...skills])
      setSelectedtedSkills([])
      setNewSkills([])
    } catch (error) {
      console.error(error)
    }
  }

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
    searchSkillsLoading,
    updateSkills
  ]
}

export default useUserSkills
