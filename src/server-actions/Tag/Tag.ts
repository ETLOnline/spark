"use server"

import { CreateServerAction } from ".."
import {
  GetTagsById,
  SearchTagsByName
} from "@/src/db/data-access/tag/query"
import {
  GetUserTagIds
} from "@/src/db/data-access/user-tag/query"

export const GetTagsForUser = CreateServerAction(
  false,
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

export const SearchTagsForSuggestions = CreateServerAction(
  false,
  async (name: string, type: string) => {
    try {
      const tags = await SearchTagsByName(name, type)
      return { success: true, data: tags }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)
