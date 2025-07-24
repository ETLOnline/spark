"use client"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import MultiSelect, { MultiSelectOption } from "../ui/multi-select"
import { SelectTag } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetAllTAgsAction,
  SearchTagsForSuggestionsAction
} from "@/src/server-actions/Tag/Tag"
import { useDebouncedCallback } from "use-debounce"

interface Props {
  type: string
  control?: any
  selected: MultiSelectOption[]
  setSelected: Dispatch<SetStateAction<MultiSelectOption[]>>
}

function TagSelect({ type, control, selected, setSelected }: Props) {
  const [existingTags, setExistingTags] = useState<SelectTag[]>([])

  const [getTagsLoading, , , GetTags] = useServerAction(GetAllTAgsAction)
  const [getSuggestionsLoading, , , GetTagSuggestions] = useServerAction(
    SearchTagsForSuggestionsAction
  )
  const [options, setOptions] = useState<MultiSelectOption[]>([])

  useEffect(() => {
    const fetchTags = async () => {
      const tags = await GetTags(type)
      if (tags?.success) {
        setExistingTags(tags.data)
      }
    }
    fetchTags()
  }, [])

  useEffect(() => {
    if (existingTags) {
      setOptions(
        existingTags.map((tag) => ({
          label: tag.name,
          value: String(tag.id),
          ...tag
        }))
      )
    }
  }, [existingTags])

  const handleQuerySearch = useDebouncedCallback(async (query: string) => {
    try {
      const suggestedTags = await GetTagSuggestions(query, type)
      if (suggestedTags?.success && suggestedTags?.data) {
        setExistingTags(suggestedTags.data)
      }
    } catch {
      console.log("Failed to fetch")
    }
  }, 1000)

  useEffect(() => {}, [options])

  return (
    <div>
      <MultiSelect
        options={options}
        selected={selected}
        onChange={setSelected}
        onQueryChange={handleQuerySearch}
        shouldFilter={false}
      />
    </div>
  )
}

export default TagSelect
