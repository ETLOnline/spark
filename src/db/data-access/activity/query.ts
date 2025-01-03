import { eq, inArray } from "drizzle-orm"
import { db } from "../.."
import {
  activitiesTable,
  InsertActivity,
  InsertUserActivity,
  userActivitiesTable
} from "../../schema"

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

export const AddActivityForUser = async (data: InsertUserActivity[]) => {
  return await db.insert(userActivitiesTable).values(data).returning()
}

export const GetActivityIdsForUser = async (id: string) => {
  const results = await db
    .select({ id: userActivitiesTable.activity_id })
    .from(userActivitiesTable)
    .where(eq(userActivitiesTable.user_id, id))
  return results.map((result) => result.id)
}
