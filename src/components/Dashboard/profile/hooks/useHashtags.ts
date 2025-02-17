import { useServerAction } from "@/src/hooks/useServerAction"
import { SetStateAction } from "jotai"
import { Tag, TagStatus } from "@/src/components/TagsInput/tags-input.type.d"
import { useState } from "react"
import { SearchHashtagsAction } from "@/src/server-actions/Post/Post"

type UseHashtagsReturn = [
  hashtags: Tag[], // Current tags
  setHashtags: (value: SetStateAction<Tag[]>) => void, // tags setter
  suggestions: Tag[], // Search suggestions
  searchHashtagssForUserInput: (name: string) => void, // Search function
  searchHashtagssLoading: boolean // Loading state
]

const useHashtags = (): UseHashtagsReturn => {
  const [hashtags, setHashtags] = useState<Tag[]>([])

  const [searchTagsLoading, searchedTags, searchTagsError, searchTags] =
    useServerAction(SearchHashtagsAction)

  const suggestions: Tag[] = searchedTags?.data
    ? searchedTags.data.map((tag) => ({
        name: tag.name,
        id: tag.id,
        status: TagStatus.selected as const,
        count: tag.count
      }))
    : []

  const searchTagsForUserInput = (name: string) => {
    try {
      searchTags(name)
    } catch (error) {
      console.error(error)
    }
  }

  return [
    hashtags,
    setHashtags,
    suggestions,
    searchTagsForUserInput,
    searchTagsLoading
  ]
}

export default useHashtags
