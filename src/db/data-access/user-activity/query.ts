import { eq } from "drizzle-orm"
import { db } from "../.."
import { userActivitiesTable, InsertUserActivity } from "../../schema"

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
