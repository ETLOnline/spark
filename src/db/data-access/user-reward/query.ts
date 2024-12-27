import { eq } from "drizzle-orm"
import { db } from "../.."
import { userRewardsTable, InsertUserReward } from "../../schema"

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
