"use server"

import { ToUpperCase } from "@/src/utils/helpers"
import { CreateServerAction } from ".."
import { GetTags, SearchTagsByName } from "@/src/db/data-access/tag/query"

export const SearchTagsForSuggestionsAction = CreateServerAction(
  true,
  async (name: string, type: string) => {
    try {
      const tags = await SearchTagsByName(name, type)
      return { success: true, data: tags }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)

export const GetAllTAgsAction = CreateServerAction(
  true,
  async (type: string) => {
    try {
      const tags = await GetTags(type)

      return { success: true, data: tags }
    } catch (error) {
      return { error: error }
    }
  }
)
