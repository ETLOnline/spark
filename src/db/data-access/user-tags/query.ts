import { db } from "../.."
import { and, eq, inArray } from "drizzle-orm"
import { InsertUserTag, userTagsTable } from "../../schema"

export const AddUserTag = async (data: InsertUserTag[]) => {
  return await db.insert(userTagsTable).values(data).returning()
}

export const DeleteUserTags = async (userId: string, tagIds: number[]) => {
  return await db
    .delete(userTagsTable)
    .where(
      and(
        eq(userTagsTable.user_id, userId),
        inArray(userTagsTable.tag_id, tagIds)
      )
    )
    .returning()
}

export const GetUserTagIds = async (userId: string) => {
  const results = await db
    .select({ tagId: userTagsTable.tag_id })
    .from(userTagsTable)
    .where(eq(userTagsTable.user_id, userId))
  return results.map((result) => result.tagId)
}
