"use server"

import { CreateServerAction } from ".."
import {
  GetTagsById,
  SearchTagsByName,
  GetUserTagIds
} from "@/src/db/data-access/tag/query"

export const GetTagsForUserAction = CreateServerAction(
  true,
  async (userId: string) => {
    try {
      const tagIds = await GetUserTagIds(userId)
      const tags = await GetTagsById(tagIds)
      return { success: true, data: tags }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)

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
