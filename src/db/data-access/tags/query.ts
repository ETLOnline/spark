import { and, eq, inArray, like } from "drizzle-orm"
import { db } from "../.."
import { InsertTag, tagsTable } from "../../schema"

export const AddTag = async (data: InsertTag[]) => {
  return await db.insert(tagsTable).values(data).returning()
}

export const FindTagsByNames = async (names: string[]) => {
  return await db.select().from(tagsTable).where(inArray(tagsTable.name, names))
}

export const GetTagsById = async (ids: number[]) => {
  const results = await db
    .select()
    .from(tagsTable)
    .where(inArray(tagsTable.id, ids))
  return results ?? []
}

export const SearchTagsByName = async (name: string, type: string) => {
  const results = await db
    .select()
    .from(tagsTable)
    .where(and(like(tagsTable.name, `%${name}%`), eq(tagsTable.type, type)))
  return results ?? []
}
