import { and, eq, sql } from "drizzle-orm"
import { db } from "../.."
import {
  activityRulesTable,
  InsertPointLedger,
  InsertTrustVerification,
  pointLedgerTable,
  SelectTrustVerification,
  trustVerificationTable,
  userRewardBalanceTable
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
