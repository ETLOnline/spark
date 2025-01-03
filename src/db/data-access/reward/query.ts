import { eq, inArray } from "drizzle-orm"
import { db } from "../.."
import {
  rewardsTable,
  InsertReward,
  userRewardsTable,
  InsertUserReward
} from "../../schema"

export const AddReward = async (data: InsertReward[]) => {
  return await db.insert(rewardsTable).values(data).returning()
}

export const getRewardsById = async (ids: number[]) => {
  const results = await db
    .select()
    .from(rewardsTable)
    .where(inArray(rewardsTable.id, ids))
  return results ?? []
}

export const AddRewardForUser = async (data: InsertUserReward[]) => {
  return await db.insert(userRewardsTable).values(data).returning()
}

export const GetRewardIdsForUser = async (id: string) => {
  const results = await db
    .select({ id: userRewardsTable.reward_id })
    .from(userRewardsTable)
    .where(eq(userRewardsTable.user_id, id))
  return results.map((result) => result.id)
}
