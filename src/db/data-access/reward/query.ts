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

export const AddRewardForUser = async (data: InsertUserReward[]) => {
  return await db.insert(userRewardsTable).values(data).returning()
}
