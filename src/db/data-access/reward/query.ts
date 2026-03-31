import { and, between, eq, gt, lte, sql } from "drizzle-orm"
import { db } from "../.."
import {
  activityRulesTable,
  InsertPointLedger,
  InsertTrustVerification,
  pointLedgerTable,
  rewardLevelTable,
  SelectTrustVerification,
  trustVerificationTable,
  userRewardBalanceTable,
  userRewardsLevelTable
} from "../../schema"

export type GetActivityRuleFilters = {
  action_type: string
}

export async function GetActivityRule(
  GetactivityRuleFilters: GetActivityRuleFilters
) {
  try {
    const res = await db.query.activityRulesTable.findFirst({
      where: eq(
        activityRulesTable.action_type,
        GetactivityRuleFilters.action_type
      )
    })
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function AddLedgerEntry(data: InsertPointLedger) {
  try {
    const res = await db.insert(pointLedgerTable).values(data).returning()
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetLedgerEntryByUserAndRule(
  user_id: string,
  rule_id: number
) {
  try {
    const res = await db.query.pointLedgerTable.findFirst({
      where: and(
        eq(pointLedgerTable.user_id, user_id),
        eq(pointLedgerTable.rule_id, rule_id)
      )
    })
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function AddVerificationEntry(data: InsertTrustVerification) {
  try {
    const res = await db.insert(trustVerificationTable).values(data).returning()
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

// 1. Fetch current balance
export async function GetUserRewardBalance(user_id: string, reward_id: number) {
  return await db.query.userRewardBalanceTable.findFirst({
    where: and(
      eq(userRewardBalanceTable.user_id, user_id),
      eq(userRewardBalanceTable.reward_id, reward_id)
    )
  });
}

// 2. Simple Update
export async function UpdateUserRewardBalance(user_id: string, reward_id: number, new_balance: number) {
  return await db
    .update(userRewardBalanceTable)
    .set({
      current_balance: new_balance,
      last_updated_at: sql`now()`
    })
    .where(
      and(
        eq(userRewardBalanceTable.user_id, user_id),
        eq(userRewardBalanceTable.reward_id, reward_id)
      )
    )
    .returning();
}

// 3. Simple Insert
export async function InsertUserRewardBalance(user_id: string, reward_id: number, amount: number) {
  return await db
    .insert(userRewardBalanceTable)
    .values({
      user_id,
      reward_id,
      current_balance: amount
    })
    .returning();
}

export async function updateTrustVerification(
  verification_id: number,
  data: Partial<SelectTrustVerification>
) {
  try {
    const res = await db
      .update(trustVerificationTable)
      .set(data)
      .where(eq(trustVerificationTable.verification_id, verification_id))
      .returning()

    return res[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetRewardLevel(points: number) {
  try {
    const res = await db.query.rewardLevelTable.findFirst({
      where: and(
        lte(rewardLevelTable.min_points, points),
        gt(rewardLevelTable.max_points, points)
      )
    })
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function assignUserRewardLevel(user_id: string, level_id: number) {
  try {
    const res = await db
      .insert(userRewardsLevelTable)
      .values({
        user_id,
        level_id
      })
      .returning()
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function UpdateUserRewardlevel(user_id: string, level_id: number) {
  try {
    const res = await db
      .update(userRewardsLevelTable)
      .set({
        level_id
      })
      .where(eq(userRewardsLevelTable.user_id, user_id))
      .returning()
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetUserRewardLevel(user_id: string) {
  try {
    const res = await db.query.userRewardsLevelTable.findFirst({
      where: eq(userRewardsLevelTable.user_id, user_id)
    })
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}
