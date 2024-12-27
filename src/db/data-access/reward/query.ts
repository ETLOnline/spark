import { inArray } from "drizzle-orm"
import { db } from "../.."
import { rewardsTable, InsertReward } from "../../schema"

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
