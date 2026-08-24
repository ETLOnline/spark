import { and, eq, ilike, inArray, like } from "drizzle-orm"
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
export const GetTags = async (type: string) => {
  try {
    const res = await db.query.tagsTable.findMany({
      where: eq(tagsTable.type, type),
      limit: 10,
      with: {
        tags: true
      }
    })

    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const SearchTagsByName = async (name: string, type: string) => {
  const results = await db
    .select()
    .from(tagsTable)
    .where(and(ilike(tagsTable.name, `%${name}%`), eq(tagsTable.type, type)))
    .limit(10)

  return results ?? []
}

export const HasUsersWithTagId = async (tagId: number) => {
  const [userTag] = await db
    .select({ id: userTagsTable.id })
    .from(userTagsTable)
    .where(eq(userTagsTable.tag_id, tagId))
    .limit(1)

  return !!userTag
}

export const SearchUserTagsByTagId = async (userId: string, tagId: number) => {
  const userTags = await db
    .select()
    .from(userTagsTable)
    .where(
      and(eq(userTagsTable.user_id, userId), eq(userTagsTable.tag_id, tagId))
    )

  return userTags
}

export const AddUserTag = async (userId: string, tagsIds: number[]) => {
  await db.delete(userTagsTable).where(eq(userTagsTable.user_id, userId))

  const data = tagsIds.map((tag_id) => ({ user_id: userId, tag_id }))
  return await db.insert(userTagsTable).values(data).returning()
}

export const DeleteUserTags = async (userId: string, tagIds: number) => {
  return await db
    .delete(userTagsTable)
    .where(
      and(eq(userTagsTable.user_id, userId), eq(userTagsTable.tag_id, tagIds))
    )
    .returning()
}
