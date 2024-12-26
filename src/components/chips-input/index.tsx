import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Tag } from "../dashboard/Profile/types/profile-types"
import { useServerAction } from "@/src/hooks/useServerAction"
import { SearchTagsForSuggestions } from "@/src/server-actions/Tags/Tags"

type ChipsInputProps = {
  tags: Tag[]
  updateSavedTags: (tags: Tag[] | ((tags: Tag[]) => Tag[])) => void
  updateNewTags: (tags: Tag[] | ((tags: Tag[]) => Tag[])) => void
  updateSelectedTags: (tags: Tag[] | ((tags: Tag[]) => Tag[])) => void
}

const ChipsInput: React.FC<ChipsInputProps> = ({
  tags,
  updateNewTags,
  updateSavedTags,
  updateSelectedTags
}) => {
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  const tagInput = useRef<HTMLInputElement>(null)

  const [searchTagsLoading, searchedTags, searchTagsError, searchTags] =
    useServerAction(SearchTagsForSuggestions)

  useEffect(() => {
    setSuggestions(
      searchedTags?.data
        ? searchedTags.data.map((tag) => ({
            name: tag.name,
            id: tag.id,
            status: "selected" as const
          }))
        : []
    )
  }, [searchedTags])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear existing timer
    if (timer) clearTimeout(timer)
    // Set new timer for debouncing
    if (e.target.value.length >= 2) {
      setLoading(true)
      const newTimer = setTimeout(async () => {
        try {
          setShowSuggestions(true)
          await searchTags(e.target.value)
        } catch (error) {
          console.error("Error fetching suggestions:", error)
          setSuggestions([])
        } finally {
          setLoading(false)
        }
      }, 800)
      setTimer(newTimer)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && (tagInput.current as HTMLInputElement).value) {
      e.preventDefault()
      setShowSuggestions(false)
      if (
        !tags.some(
          (tag) =>
            tag?.name.toLowerCase() ===
            (tagInput.current as HTMLInputElement).value.toLowerCase()
        )
      ) {
        updateNewTags((tags: Tag[]) => [
          ...tags,
          {
            name: (tagInput.current as HTMLInputElement).value.trim(),
            status: "new"
          }
        ])
        ;(tagInput.current as HTMLInputElement).value = ""
      }
    }
  }

  const removeTag = (indexToRemove: number) => {
    if (tags[indexToRemove]?.status === "saved") {
      updateSavedTags((savedTags) =>
        savedTags.filter((tag) => tag.name !== tags[indexToRemove].name)
      )
    } else if (tags[indexToRemove]?.status === "selected") {
      updateSelectedTags((selectedTags) =>
        selectedTags.filter((tag) => tag.name !== tags[indexToRemove].name)
      )
    } else {
      updateNewTags((newTags) =>
        newTags.filter((tag) => tag.name !== tags[indexToRemove].name)
      )
    }
  }

  const selectSuggestion = (suggestion: Tag) => {
    if (
      !tags.some(
        (tag) => tag?.name.toLowerCase() === suggestion.name.toLowerCase()
      )
    ) {
      updateSelectedTags((tags: Tag[]) => [...tags, suggestion])
    }
    ;(tagInput.current as HTMLInputElement).value = ""
    setShowSuggestions(false)
  }

  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timer])

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap gap-2 rounded-md border border-input bg-transparent p-2 focus-within:ring-1 focus-within:ring-ring">
        {tags.map((tag, i) => (
          <span
            key={tag?.id ?? tag?.name}
            className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
          >
            {tag?.name}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="ml-1 rounded-full hover:bg-muted-foreground/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          ref={tagInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          placeholder={tags.length === 0 ? "Type to add tags..." : ""}
        />
      </div>
      {showSuggestions && (tagInput.current as HTMLInputElement).value && (
        <div className="absolute mt-1 w-full rounded-md border bg-popover p-1 shadow-md z-10">
          {searchTagsLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Loading...</div>
          ) : suggestions.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No suggestions found
            </div>
          ) : (
            <div className="max-h-48 overflow-auto">
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion.id}
                  className="w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChipsInput
