import { eq } from "drizzle-orm"
import { db } from "../.."
import { InsertTag, tagsTable } from "../../schema"

export const AddTag = async (data: InsertTag) => {
  return await db.insert(tagsTable).values(data).returning()
}

export const FindTagByName = async (name: string) => {
  const results = await db
    .select()
    .from(tagsTable)
    .where(eq(tagsTable.name, name))
  return results[0] ?? null
}
