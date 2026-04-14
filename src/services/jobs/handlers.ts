import type { SelectJob } from "@/src/db/schema"
import {
  AddLedgerEntry,
  AddVerificationEntry,
  GetActivityRule,
  GetRewardLevel,
  GetRewardLevels,
  GetUserRewardBalance,
  InsertUserRewardBalance,
  UpdateUserRewardBalance,
  assignUserRewardLevel,
  UpdateUserRewardlevel
} from "@/src/db/data-access/reward/query"
import { InsertPointLedger, InsertTrustVerification, SelectActivityRules } from "@/src/db/schema"
import { triggerPusherEvent } from "@/src/services/trigger"
import { getFeatureFlag } from "@/src/db/data-access/feature-flags/query"
import { ActivityTypes, RewardTypes, TrustVerificationStatus } from "@/src/types/Rewards/rewards"

/**
 * Central job dispatcher.
 *
 * Add a `case` for each job type using the pattern "<queue>:<name>".
 * Define the handler function below and call it from the switch.
 *
 * Example — enqueue from anywhere:
 *   await enqueue("rewards", "add-reward", { action_type: "post_created", user_id: "123" })
 */
export async function processJob(job: SelectJob) {
  const key = `${job.queue}:${job.name}`
  const payload = job.payload as Record<string, any>

  console.log(`[jobs] Processing: ${key} (id=${job.id})`)

  switch (key) {
    case "rewards:add-reward":
      await handleAddReward(payload as {
        action_type: string
        user_id: string
        proof_url?: string
        metadata?: any
        verification_id?: number
      })
      break

    case "maintenance:cleanup-old-jobs":
      await handleCleanupOldJobs()
      break

    // Catch-all — fail loudly so unregistered jobs don't silently disappear
    default:
      throw new Error(`Unknown job: ${key}`)
  }
}

// ---------------------------------------------------------------------------
// Handler implementations
// ---------------------------------------------------------------------------

async function handleAddReward(payload: {
  action_type: string
  user_id: string
  proof_url?: string
  metadata?: any
  verification_id?: number
}) {
  const { action_type, user_id, proof_url, metadata, verification_id } = payload

  const featureFlag = await getFeatureFlag(["Trust_Engine_Enabled"])
  if (!featureFlag?.is_enabled) return

  const activityRule = await GetActivityRule({ action_type })
  if (!activityRule) throw new Error(`Activity rule not found for: ${action_type}`)

  const ledgerEntry = await AddLedgerEntry({
    user_id,
    reward_id: activityRule.reward_id,
    rule_id: activityRule.rule_id,
    amount: activityRule.base_points,
    source_system: "internal_app",
    external_ref_id: "",
    trust_verification_id: verification_id ?? null,
    metadata: {
      milestone_id: null,
      milestone_type: null,
      milestone_url: null,
      proof_url: proof_url ?? null,
      ...metadata
    },
    transection_type: "debit"
  } as InsertPointLedger)

  const existingBalance = await GetUserRewardBalance(user_id, activityRule.reward_id)

  let currentBalance: number
  let userRewardBalance

  if (existingBalance) {
    currentBalance = (existingBalance.current_balance ?? 0) + activityRule.base_points
    userRewardBalance = await UpdateUserRewardBalance(user_id, activityRule.reward_id, currentBalance)
  } else {
    currentBalance = activityRule.base_points
    userRewardBalance = await InsertUserRewardBalance(user_id, activityRule.reward_id, currentBalance)
  }

  await syncUserRewardLevel(user_id, currentBalance, activityRule)

  if (activityRule.required_verification) {
    const milestoneRule = await GetActivityRule({ action_type: ActivityTypes.MilestoneApproval })
    await AddVerificationEntry({
      user_id,
      rule_id: activityRule.rule_id,
      status: TrustVerificationStatus.Pending,
      points: milestoneRule?.base_points,
      proof_url
    } as InsertTrustVerification)
  }

  await triggerPusherEvent(user_id, "reward_added", { ledgerEntry, userRewardBalance })
}

async function handleCleanupOldJobs() {
  const { db } = await import("@/src/db")
  const { jobsTable } = await import("@/src/db/schema")
  const { eq, and, lte } = await import("drizzle-orm")

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1_000)
  await db
    .delete(jobsTable)
    .where(and(eq(jobsTable.status, "done"), lte(jobsTable.updated_at, sevenDaysAgo)))
  console.log("[jobs] Cleaned up done jobs older than 7 days")
}

async function syncUserRewardLevel(
  user_id: string,
  currentBalance: number,
  activity_rule: SelectActivityRules
) {
  const [currentLevel, levelBasedOnPoints, rewardLevels] = await Promise.all([
    import("@/src/db/data-access/reward/query").then(m => m.GetUserRewardLevel(user_id)),
    GetRewardLevel(currentBalance),
    GetRewardLevels()
  ])

  if (!levelBasedOnPoints) return

  if (!currentLevel) {
    await assignUserRewardLevel(user_id, rewardLevels[0].id)
    return
  }

  if (activity_rule.reward?.internal_name !== RewardTypes.Reputation_Points) return
  if (currentLevel.level_id === levelBasedOnPoints.id) return

  await UpdateUserRewardlevel(user_id, levelBasedOnPoints.id)
  await triggerPusherEvent(user_id, "level_up", {
    newLevel: levelBasedOnPoints,
    currentUserBalance: currentBalance
  })
}
