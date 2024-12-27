"use server"

import { InsertTag } from "../../db/schema"
import { CreateServerAction } from ".."
import {
  AddTag,
  GetTagsById,
  SearchTagsByName
} from "@/src/db/data-access/tags/query"
import {
  AddUserTag,
  DeleteUserTags,
  GetUserTagIds
} from "@/src/db/data-access/user-tags/query"

export const AddNewTagsForUser = CreateServerAction(
  false,
  async (tagsData: InsertTag[], user_id: string) => {
    try {
      const insertedTags = await AddTag(tagsData)
      const data = await AddUserTag(
        insertedTags.map((tag) => {
          return { user_id, tag_id: tag.id }
        })
      )
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)

export const AddExistingTagsForUser = CreateServerAction(
  false,
  async (tagsData: InsertTag[], user_id: string) => {
    try {
      const data = await AddUserTag(
        tagsData.map((tag) => {
          return { user_id, tag_id: tag.id as number }
        })
      )
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)

export const DeleteTagsForUser = CreateServerAction(
  false,
  async (userId: string, tagIds: number[]) => {
    try {
      const data = await DeleteUserTags(userId, tagIds)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)

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
