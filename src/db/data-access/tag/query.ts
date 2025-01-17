import { and, eq, inArray, like } from "drizzle-orm"
import { db } from "../.."
import {
  InsertTag,
  InsertUserTag,
  tagsTable,
  userTagsTable
} from "../../schema"

export const AddTag = async (data: InsertTag[]) => {
  return await db.insert(tagsTable).values(data).returning()
}

export const FindTagsByNames = async (names: string[]) => {
  return await db.select().from(tagsTable).where(inArray(tagsTable.name, names))
}

export const SearchTagsByName = async (name: string, type: string) => {
  const results = await db
    .select()
    .from(tagsTable)
    .where(and(like(tagsTable.name, `%${name}%`), eq(tagsTable.type, type)))
  return results ?? []
}

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
