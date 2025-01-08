import { Tag, TagStatus } from "../types/profile-types.d"
import { useServerAction } from "@/src/hooks/useServerAction"
import { SearchTagsForSuggestionsAction } from "@/src/server-actions/Tag/Tag"
import { SetStateAction, useAtomValue, useSetAtom } from "jotai"
import { profileStore } from "@/src/store/profile/profileStore"

type UseUserInterestsReturn = [
  interests: Tag[], // Current skills
  setInterests: (value: SetStateAction<Tag[]>) => void, // Interests setter
  suggestions: Tag[], // Search suggestions
  searchInterestsForUserInput: (name: string) => void, // Search function
  searchInterestsLoading: boolean // Loading state
]

const useUserInterests = (): UseUserInterestsReturn => {
  const interests = useAtomValue(profileStore.interests)
  const setInterests = useSetAtom(profileStore.interests)

  const [
    searchInterestsLoading,
    searchedInterests,
    searchInterestsError,
    searchInterests
  ] = useServerAction(SearchTagsForSuggestionsAction)

  const suggestions: Tag[] = searchedInterests?.data
    ? searchedInterests.data.map((tag) => ({
        name: tag.name,
        id: tag.id,
        status: TagStatus.selected as const
      }))
    : []

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
    suggestions,
    searchInterestsForUserInput,
    searchInterestsLoading
  ]
}

export default useUserInterests
