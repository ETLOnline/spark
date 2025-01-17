"use server"

import { InsertReward, InsertUserReward } from "@/src/db/schema"
import { CreateServerAction } from ".."
import { AddReward } from "@/src/db/data-access/reward/query"
import {
  AddRewardForUser
} from "@/src/db/data-access/reward/query"

export const AddRewardAction = CreateServerAction(
  true,
  async (data: InsertReward[]) => {
    try {
      const insertedRewards = await AddReward(data)
      return { success: true, data: insertedRewards }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)

export const AddRewardForUserAction = CreateServerAction(
  true,
  async (data: InsertUserReward[]) => {
    try {
      const insertedRewards = await AddRewardForUser(data)
      return { success: true, data: insertedRewards }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)
