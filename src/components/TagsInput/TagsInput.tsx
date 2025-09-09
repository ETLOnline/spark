import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from "@/src/components/ui/command"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Tag, TagStatus } from "./tags-input-types"

type BaseTagsInputProps = {
  autocomplete?: boolean
  placeholder?: string
  type?: string
}

type TagsObjUpdaterArgs = Tag[] | ((tags: Tag[]) => Tag[])

type TagsStringUpdaterArgs = string[] | ((tags: string[]) => string[])

type AutocompleteProps = {
  autocomplete: true
  tags: Tag[]
  updateTags: (tags: TagsObjUpdaterArgs) => void
  suggestions: Tag[]
  loadingSuggestions: boolean
  onChange: (tagName: string) => void
}

type NoAutocompleteProps = {
  autocomplete?: false
  tags: string[]
  updateTags: (tags: TagsStringUpdaterArgs) => void
  suggestions?: Tag[]
  loadingSuggestions?: boolean
  onChange?: (tagName: string) => void
}

type TagsInputProps = BaseTagsInputProps &
  (AutocompleteProps | NoAutocompleteProps)

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
    onSelect={onClick}
    className={`w-full cursor-pointer rounded-sm px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground
      ${hover ? "bg-accent text-accent-foreground" : ""}`}
  >
    {children}
  </CommandItem>
)

const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  updateTags,
  suggestions = [],
  loadingSuggestions = false,
  onChange = () => {},
  autocomplete = false,
  placeholder,
  type
}) => {
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
    useState<number>(-1)
  const [selectNewTag, setSelectNewTag] = useState<boolean>(false)

  const timer = useRef<NodeJS.Timeout | undefined>(undefined)
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
    }
  }

  const handleNewTag = () => {
    const rawValue = (tagInput.current as HTMLInputElement).value
    const inputValue = rawValue.trim()

    if (!inputValue) {
      ;(tagInput.current as HTMLInputElement).value = ""
      return
    }

    if (autocomplete) {
      if (
        !(tags as Tag[]).some(
          (tag: Tag) =>
            tag?.name.toLowerCase() === inputValue.toLowerCase() && !tag.deleted
        )
      ) {
        const tagUpdater = updateTags as (tags: TagsObjUpdaterArgs) => void
        tagUpdater((prevTags: Tag[]) => [
          ...prevTags,
          {
            name:
              inputValue[0].toUpperCase() +
              inputValue.substring(1).toLowerCase(),
            status: TagStatus.new
          }
        ])
      }
    } else {
      if (
        !(tags as string[]).some(
          (tag: string) => tag.toLowerCase() === inputValue.toLowerCase()
        )
      ) {
        const tagUpdater = updateTags as (tags: TagsStringUpdaterArgs) => void
        tagUpdater((prevTags: string[]) => [
          ...prevTags,
          inputValue[0].toUpperCase() + inputValue.substring(1).toLowerCase()
        ])
      }
    }
    setShowSuggestions(false)
    if (autocomplete) {
      ;(tagInput.current as HTMLInputElement).value = ""
    }
  }

  const removeTag = (indexToRemove: number) => {
    if (autocomplete) {
      const tagUpdater = updateTags as (tags: TagsObjUpdaterArgs) => void
      tagUpdater((prevTags: Tag[]) =>
        prevTags.with(indexToRemove, {
          ...prevTags[indexToRemove],
          deleted: true
        })
      )
    } else {
      const tagUpdater = updateTags as (tags: TagsStringUpdaterArgs) => void
      tagUpdater((prevTags: string[]) =>
        prevTags.filter((_, index) => index !== indexToRemove)
      )
    }
  }

  const selectSuggestion = (suggestion: Tag) => {
    if (
      autocomplete &&
      !(tags as Tag[]).some(
        (tag) =>
          tag?.name.toLowerCase() === suggestion.name.toLowerCase() &&
          !tag.deleted
      )
    ) {
      const tagUpdater = updateTags as (tags: TagsObjUpdaterArgs) => void
      tagUpdater((prevTags: Tag[]) => [...prevTags, suggestion])
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
      if (suggestions.length) {
        setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length)
      } else {
        setSelectNewTag(true)
      }
    } else if (e.key === "ArrowUp") {
      if (suggestions.length) {
        setSelectedSuggestionIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        )
      }
    }
  }

  const enterTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const inputValue = tagInput.current?.value.trim()
      if (!inputValue) {
        ;(tagInput.current as HTMLInputElement).value = ""
        return
      }
      if (tagInput.current?.value) {
        handleNewTag()
        if (onChange) {
          onChange(tagInput.current?.value)
        }
        ;(tagInput.current as HTMLInputElement).value = ""
      }
    }
  }

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap gap-2 rounded-md border border-input bg-transparent focus-within:ring-1 focus-within:ring-ring">
        {autocomplete
          ? (tags as Tag[]).map(
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
            )
          : (tags as string[]).map((tag, i) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
              >
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTag(i)}
                  className="h-4 w-4 p-0 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            ))}
        <Input
          type="text"
          ref={tagInput}
          onChange={handleInputChange}
          onKeyDown={autocomplete ? suggestionController : enterTag}
          className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 indent-3"
          placeholder={
            tags.length === 0
              ? placeholder
                ? placeholder
                : "Type to add tags..."
              : ""
          }
          required={tags.length === 0 && type === "poll"}
        />
      </div>
      {showSuggestions &&
        (tagInput.current as HTMLInputElement).value.trim() && (
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
                {suggestions.map((suggestion: Tag, index: number) => (
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
