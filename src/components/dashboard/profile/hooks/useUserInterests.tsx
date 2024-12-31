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

type UseUserInterestsReturn = [
  interests: Tag[], // Current skills
  setInterests: (value: SetStateAction<Tag[]>) => void, // Interests setter
  newInterests: Tag[], // New skills being added
  setNewInterests: Dispatch<SetStateAction<Tag[]>>, // New skills setter
  selectedInterests: Tag[], // Selected existing skills
  setSelectedInterests: Dispatch<SetStateAction<Tag[]>>, // Selected skills setter
  savedInterests: Tag[], // Previously saved skills
  setSavedInterests: Dispatch<SetStateAction<Tag[]>>, // Saved skills setter
  updatedInterests: Tag[], // Combined skills array
  suggestions: Tag[], // Search suggestions
  searchInterestsForUserInput: (name: string) => void, // Search function
  searchInterestsLoading: boolean, // Loading state
  updateInterests: () => Promise<void> // Update function
]

const useUserInterests = (): UseUserInterestsReturn => {
  const interests = useAtomValue(profileStore.interests)
  const setInterests = useSetAtom(profileStore.interests)
  const user = useAtomValue(userStore.Iam)

  const [newInterests, setNewInterests] = useState<Tag[]>([])
  const [selectedInterests, setSelectedtedInterests] = useState<Tag[]>([])
  const [savedInterests, setSavedInterests] = useState<Tag[]>([])

  const updatedInterests: Tag[] = [
    ...savedInterests,
    ...selectedInterests,
    ...newInterests
  ]

  const [
    searchInterestsLoading,
    searchedInterests,
    searchInterestsError,
    searchInterests
  ] = useServerAction(SearchTagsForSuggestions)
  const [
    addNewInterestsLoading,
    addedNewInterestsData,
    addNewInterestsError,
    addNewInterests
  ] = useServerAction(AddNewTagsForUser)
  const [
    addExistingInterestsLoading,
    addedExistingInterestsData,
    addExistingInterestsError,
    addExistingInterests
  ] = useServerAction(AddExistingTagsForUser)
  const [
    deleteInterestsLoading,
    deletedInterestsData,
    deleteInterestsError,
    deleteInterests
  ] = useServerAction(DeleteTagsForUser)

  const suggestions: Tag[] = searchedInterests?.data
    ? searchedInterests.data.map((tag) => ({
        name: tag.name,
        id: tag.id,
        status: TagStatus[2] as const
      }))
    : []

  useEffect(() => {
    setSavedInterests([...interests])
  }, [interests])

  const updateInterests = async () => {
    if (!user) return
    try {
      const deletedInterestsIds: number[] = interests
        .filter(
          (tag: Tag) =>
            !savedInterests.find((updatedTag) => tag.id === updatedTag.id)
        )
        .map((tag: Tag) => tag.id as number)
      await deleteInterests(user.external_auth_id, deletedInterestsIds)
      await addNewInterests(
        newInterests.map((tag) => {
          return { name: tag.name, type: "Interest" }
        }),
        user.external_auth_id
      )
      await addExistingInterests(
        selectedInterests.map((tag) => {
          return { name: tag.name, id: tag.id, type: "Interest" }
        }),
        user.external_auth_id
      )
      setInterests((interests: Tag[]) => {
        interests = interests.filter(
          (tag) => !deletedInterestsIds.includes(tag.id as number)
        ) // remove deleted Interests
        return [...interests, ...newInterests, ...selectedInterests]
      })
      setSavedInterests([...interests])
      setNewInterests([])
    } catch (error) {
      console.error(error)
    }
  }

  const searchInterestsForUserInput = (name: string) => {
    try {
      searchInterests(name, "interest")
    } catch (error) {
      console.error(error)
    }
  }

  return [
    interests,
    setInterests,
    newInterests,
    setNewInterests,
    selectedInterests,
    setSelectedtedInterests,
    savedInterests,
    setSavedInterests,
    updatedInterests,
    suggestions,
    searchInterestsForUserInput,
    searchInterestsLoading,
    updateInterests
  ]
}

export default useUserInterests
