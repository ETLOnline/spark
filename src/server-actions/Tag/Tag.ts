"use server"

import { CreateServerAction } from ".."
import { SearchTagsByName } from "@/src/db/data-access/tag/query"

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
