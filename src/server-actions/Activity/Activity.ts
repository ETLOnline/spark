"use server"

import { InsertActivity, InsertUserActivity } from "@/src/db/schema"
import { CreateServerAction } from ".."
import { AddActivity } from "@/src/db/data-access/activity/query"
import { AddActivityForUser } from "@/src/db/data-access/activity/query"

export const AddActivityAction = CreateServerAction(
  true,
  async (data: InsertActivity[]) => {
    try {
      const insertedRewards = await AddActivity(data)
      return { success: true, data: insertedRewards }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)

export const AddActivityForUserAction = CreateServerAction(
  true,
  async (data: InsertUserActivity[]) => {
    try {
      const insertedRewards = await AddActivityForUser(data)
      return { success: true, data: insertedRewards }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)
