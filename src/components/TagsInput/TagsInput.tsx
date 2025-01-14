import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Tag, TagStatus } from "../Dashboard/profile/types/profile-types.d"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from "@/src/components/ui/command"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"

type TagsInputProps = {
  tags: Tag[]
  updateTags: (tags: Tag[] | ((tags: Tag[]) => Tag[])) => void
  suggestions: Tag[]
  onChange: (tagName: string) => void
  loadingSuggestions: boolean
  autocomplete?: boolean
}

type SuggestionButtonProps = {
  hover: boolean
  children: string
  onClick: () => void
}

const SuggestionButton: React.FC<SuggestionButtonProps> = ({
  hover,
  onClick,
  children
}) => (
  <CommandItem
    onSelect={() => onClick}
    className={`w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground
      ${hover ? "bg-accent text-accent-foreground" : ""}`}
  >
    {children}
  </CommandItem>
)

const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  updateTags,
  suggestions,
  loadingSuggestions,
  onChange,
  autocomplete = true
}) => {
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
    useState<number>(-1)
  const [selectNewTag, setSelectNewTag] = useState<boolean>(false)

  const timer = useRef<NodeJS.Timeout | undefined>()
  const tagInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer.current)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (autocomplete) {
      // Clear existing timer
      if (timer) {
        clearTimeout(timer.current)
      }
      // Set new timer for debouncing
      if (e.target.value.length >= 2) {
        timer.current = setTimeout(() => {
          try {
            setShowSuggestions(true)
            onChange(e.target.value)
          } catch (error) {
            console.error("Error fetching suggestions:", error)
          }
        }, 800)
      } else {
        onChange(e.target.value)
      }
    } else {
      setShowSuggestions(false)
    }
  }

  const handleNewTag = () => {
    if (
      !tags.some(
        (tag) =>
          tag?.name.toLowerCase() ===
            (tagInput.current as HTMLInputElement).value.toLowerCase() &&
          !tag.deleted
      )
    ) {
      updateTags((tags: Tag[]) => [
        ...tags,
        {
          name:
            (tagInput.current as HTMLInputElement).value
              .trim()[0]
              .toUpperCase() +
            (tagInput.current as HTMLInputElement).value
              .substring(1)
              .toLowerCase(),
          status: TagStatus.new
        }
      ])
      setShowSuggestions(false)
      ;(tagInput.current as HTMLInputElement).value = ""
    }
  }

  const removeTag = (indexToRemove: number) => {
    updateTags((tags) =>
      tags.with(indexToRemove, { ...tags[indexToRemove], deleted: true })
    )
  }

  const selectSuggestion = (suggestion: Tag) => {
    if (
      !tags.some(
        (tag) =>
          tag?.name.toLowerCase() === suggestion.name.toLowerCase() &&
          !tag.deleted
      )
    ) {
      updateTags((tags: Tag[]) => [...tags, suggestion])
    }
    ;(tagInput.current as HTMLInputElement).value = ""
    setShowSuggestions(false)
    setSelectedSuggestionIndex(0)
  }

  const suggestionController = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (suggestions.length) {
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(suggestions[selectedSuggestionIndex])
        }
      } else {
        if (tagInput.current?.value) {
          handleNewTag()
        }
      }
    } else if (e.key === "ArrowDown") {
      suggestions.length
        ? setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length)
        : setSelectNewTag(true)
    } else if (e.key === "ArrowUp") {
      if (suggestions.length) {
        setSelectedSuggestionIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        )
      }
    }
  }

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap gap-2 rounded-md border border-input bg-transparent p-2 focus-within:ring-1 focus-within:ring-ring">
        {tags.map(
          (tag, i) =>
            !tag.deleted && (
              <span
                key={tag?.id ?? tag?.name}
                className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
              >
                {tag?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTag(i)}
                  className="h-4 w-4 p-0 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            )
        )}
        <Input
          type="text"
          ref={tagInput}
          onChange={handleInputChange}
          onKeyDown={suggestionController}
          className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0"
          placeholder={tags.length === 0 ? "Type to add tags..." : ""}
        />
      </div>
      {showSuggestions && (tagInput.current as HTMLInputElement).value && (
        <Command className="absolute mt-1 w-full rounded-md border bg-popover shadow-md z-10">
          {loadingSuggestions ? (
            <CommandEmpty>Loading...</CommandEmpty>
          ) : suggestions.length === 0 ? (
            <CommandGroup>
              <SuggestionButton hover={selectNewTag} onClick={handleNewTag}>
                {(tagInput.current as HTMLInputElement).value}
              </SuggestionButton>
            </CommandGroup>
          ) : (
            <CommandGroup className="max-h-48 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <SuggestionButton
                  key={suggestion.id}
                  hover={index === selectedSuggestionIndex}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion.name}
                </SuggestionButton>
              ))}
            </CommandGroup>
          )}
        </Command>
      )}
    </div>
  )
}

export default TagsInput
