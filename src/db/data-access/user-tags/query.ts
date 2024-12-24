import { db } from "../.."
import { and, eq } from "drizzle-orm"
import { InsertUserTag, userTagsTable } from "../../schema"

export const AddUserTag = async (data: InsertUserTag) => {
  return await db.insert(userTagsTable).values(data).returning()
}

export const DeleteUserTag = async (userId: string, skillId: number) => {
  return await db
    .delete(userTagsTable)
    .where(
      and(eq(userTagsTable.user_id, userId), eq(userTagsTable.tag_id, skillId))
    )
    .returning()
}
