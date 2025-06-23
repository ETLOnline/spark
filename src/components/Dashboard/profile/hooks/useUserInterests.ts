import { useServerAction } from "@/src/hooks/useServerAction"
import { SearchTagsForSuggestionsAction } from "@/src/server-actions/Tag/Tag"
import { SetStateAction, useAtomValue, useSetAtom } from "jotai"
import { profileStore } from "@/src/store/profile/profileStore"
import { Tag, TagStatus } from "@/src/components/TagsInput/tags-input-types"
import { SelectTag } from "@/src/db/schema"

type UseUserInterestsReturn = [
  interests: SelectTag[], // Current skills
  setInterests: (value: SetStateAction<SelectTag[]>) => void, // Interests setter
  suggestions: SelectTag[], // Search suggestions
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

  const suggestions = searchedInterests?.data ?? []

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
