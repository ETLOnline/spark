import { and, between, count, eq, gt, inArray, lte, sql } from "drizzle-orm"
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
      ),
      with: {
        reward: true
      }
    })
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function AddLedgerEntry(data: InsertPointLedger) {
  try {
    const res = await db.insert(pointLedgerTable).values(data).returning()

    const ledgerEntry = await GetLedgerEntryById(res[0].transection_id)

    return ledgerEntry
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetLedgerEntryById(ledger_id: number) {
  try {
    const res = await db.query.pointLedgerTable.findFirst({
      where: eq(pointLedgerTable.transection_id, ledger_id),
      with: {
        rule: true
      }
    })
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
      ),
      with: {
        rule: true
      }
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
  })
}

// 2. Simple Update
export async function UpdateUserRewardBalance(
  user_id: string,
  reward_id: number,
  new_balance: number
) {
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
    .returning()
}

// 3. Simple Insert
export async function InsertUserRewardBalance(
  user_id: string,
  reward_id: number,
  amount: number
) {
  return await db
    .insert(userRewardBalanceTable)
    .values({
      user_id,
      reward_id,
      current_balance: amount
    })
    .returning()
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
      where: eq(userRewardsLevelTable.user_id, user_id),
      with: {
        rewardLevel: true,
        user: true
      }
    })
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetUserPointLedger(
  user_id: string,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const offset = (page - 1) * pageSize

    const [data, totalResult] = await Promise.all([
      db.query.pointLedgerTable.findMany({
        where: eq(pointLedgerTable.user_id, user_id),
        with: {
          rule: true
        },
        orderBy: (ledger, { desc }) => [desc(ledger.created_at)],
        limit: pageSize,
        offset
      }),
      db
        .select({ total: count() })
        .from(pointLedgerTable)
        .where(eq(pointLedgerTable.user_id, user_id))
    ])

    return { data, total: totalResult[0]?.total ?? 0 }
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetRewardLevels() {
  try {
    const res = await db.query.rewardLevelTable.findMany()
    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetTaskVerificationStatuses(task_ids: string[]) {
  if (!task_ids.length) return []

  try {
    const taskIdExpr = sql<string>`(${trustVerificationTable.metadata}->>'task_id')`

    return await db
      .select({
        task_id: taskIdExpr,
        status: trustVerificationTable.status,
        verification_id: trustVerificationTable.verification_id,
        feedback: trustVerificationTable.feedback
      })
      .from(trustVerificationTable)
      .where(inArray(taskIdExpr, task_ids))
  } catch (e: any) {
    throw new Error(e.message)
  }
}

/**
 * Check whether a user has already been awarded for a specific resource.
 * Uses a JSONB metadata lookup: metadata->>'field' = 'value'
 * e.g. field = "post_id", value = "abc-123"
 */
export async function HasUserBeenRewardedForResource(
  user_id: string,
  rule_id: number,
  field: string,
  value: string
): Promise<boolean> {
  try {
    const res = await db.query.pointLedgerTable.findFirst({
      where: and(
        eq(pointLedgerTable.user_id, user_id),
        eq(pointLedgerTable.rule_id, rule_id),
        sql`${pointLedgerTable.metadata}->>${field} = ${value}`
      )
    })
    return !!res
  } catch (e: any) {
    throw new Error(e.message)
  }
}
