"use server"

import { InsertTag } from "../../db/schema"
import { CreateServerAction } from ".."
import {
  AddTag,
  FindTagByName,
  GetTagsById
} from "@/src/db/data-access/tags/query"
import {
  AddUserTag,
  DeleteUserTags,
  GetUserTagIds
} from "@/src/db/data-access/user-tags/query"

export const AddTagForUser = CreateServerAction(
  false,
  async (tagsData: InsertTag, user_id: string) => {
    try {
      let data
      const searchedTag = await FindTagByName(tagsData.name)
      if (!searchedTag) {
        const tagData = await AddTag(tagsData)
        data = await AddUserTag({
          user_id,
          tag_id: tagData[0].id
        })
      } else {
        data = await AddUserTag({
          user_id,
          tag_id: searchedTag.id
        })
      }
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)

export const DeleteTagForUser = CreateServerAction(
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
