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

export const AddActivityForUser = async (data: InsertUserActivity[]) => {
  return await db.insert(userActivitiesTable).values(data).returning()
}
