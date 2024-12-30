import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import {
  Tag,
  TagStatus,
  TagType
} from "../dashboard/Profile/types/profile-types.d"

type ChipsInputProps = {
  tags: Tag[]
  updateSavedTags: (tags: Tag[] | ((tags: Tag[]) => Tag[])) => void
  updateNewTags: (tags: Tag[] | ((tags: Tag[]) => Tag[])) => void
  updateSelectedTags: (tags: Tag[] | ((tags: Tag[]) => Tag[])) => void
  tagType: TagType
  suggestions: Tag[]
  searchSuggestions: (name: string, type: string) => Promise<void>
  loadingSuggestions: boolean
}

const ChipsInput: React.FC<ChipsInputProps> = ({
  tags,
  updateNewTags,
  updateSavedTags,
  updateSelectedTags,
  tagType,
  suggestions,
  loadingSuggestions,
  searchSuggestions
}) => {
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const timer = useRef<NodeJS.Timeout | undefined>()

  const tagInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      timer && clearTimeout(timer.current)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear existing timer
    timer && clearTimeout(timer.current)
    // Set new timer for debouncing
    if (e.target.value.length >= 2) {
      timer.current = setTimeout(async () => {
        try {
          setShowSuggestions(true)
          await searchSuggestions(e.target.value, tagType)
        } catch (error) {
          console.error("Error fetching suggestions:", error)
        }
      }, 800)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleNewTag = (e: React.MouseEvent<HTMLButtonElement>) => {
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
          name:
            (tagInput.current as HTMLInputElement).value
              .trim()[0]
              .toUpperCase() +
            (tagInput.current as HTMLInputElement).value
              .substring(1)
              .toLowerCase(),
          status: TagStatus[3]
        }
      ])
      setShowSuggestions(false)
      ;(tagInput.current as HTMLInputElement).value = ""
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
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          placeholder={tags.length === 0 ? "Type to add tags..." : ""}
        />
      </div>
      {showSuggestions && (tagInput.current as HTMLInputElement).value && (
        <div className="absolute mt-1 w-full rounded-md border bg-popover p-1 shadow-md z-10">
          {loadingSuggestions ? (
            <div className="p-2 text-sm text-muted-foreground">Loading...</div>
          ) : suggestions.length === 0 ? (
            <div className="max-h-48 overflow-auto">
              <button
                type="button"
                className="w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={handleNewTag}
              >
                {(tagInput.current as HTMLInputElement).value}
              </button>
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
