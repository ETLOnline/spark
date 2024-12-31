import { Dispatch, useEffect, useState } from "react"
import { Tag, TagStatus } from "../types/profile-types.d"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
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
    searchInterestsLoading
  ]
}

export default useUserInterests
