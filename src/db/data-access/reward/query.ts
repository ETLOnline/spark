import { and, eq, sql } from "drizzle-orm"
import { db } from "../.."
import {
  activityRulesTable,
  InsertPointLedger,
  InsertTrustVerification,
  pointLedgerTable,
  trustVerificationTable,
  userRewardBalanceTable
} from "../../schema"

export async function  GetActivityRule(action_key: string) {
  try {
    const res = await db.query.activityRulesTable.findFirst({
      where: eq(activityRulesTable.action_type, action_key)
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

export async function UpsertUserRewardBalance(
  user_id: string,
  reward_id: number,
  amount: number
) {
  try {
    const existing = await db.query.userRewardBalanceTable.findFirst({
      where: and(
        eq(userRewardBalanceTable.user_id, user_id),
        eq(userRewardBalanceTable.reward_id, reward_id)
      )
    })

    if (existing) {
      const res = await db
        .update(userRewardBalanceTable)
        .set({
          current_balance: existing.current_balance + amount,
          last_updated_at: sql`now()`
        })
        .where(
          and(
            eq(userRewardBalanceTable.user_id, user_id),
            eq(userRewardBalanceTable.reward_id, reward_id)
          )
        )
        .returning()
      return res
    } else {
      const res = await db
        .insert(userRewardBalanceTable)
        .values({
          user_id,
          reward_id,
          current_balance: amount
        })
        .returning()
      return res
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}