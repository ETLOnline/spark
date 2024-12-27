import { inArray } from "drizzle-orm"
import { db } from "../.."
import { activitiesTable, InsertActivity } from "../../schema"

export const AddActivity = async (data: InsertActivity[]) => {
  return await db.insert(activitiesTable).values(data).returning()
}

export const getActivitiesById = async (ids: number[]) => {
  const results = await db
    .select()
    .from(activitiesTable)
    .where(inArray(activitiesTable.id, ids))
  return results ?? []
}
