"use server"

import { InsertTag } from "../../db/schema"
import { CreateServerAction } from ".."
import { AddTag, FindTagByName } from "@/src/db/data-access/tags/query"
import { AddUserTag, DeleteUserTag } from "@/src/db/data-access/user-tags/query"

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
  async (userId: string, tagId: number) => {
    try {
      const data = await DeleteUserTag(userId, tagId)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)

export type TagAdder = typeof AddTagForUser
export type TagDeleter = typeof DeleteTagForUser
