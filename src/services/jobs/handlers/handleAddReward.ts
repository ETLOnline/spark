import { getFeatureFlag } from "@/src/db/data-access/feature-flags/query"
import {
  AddLedgerEntry,
  AddVerificationEntry,
  GetActivityRule,
  GetUserRewardBalance,
  InsertUserRewardBalance,
  UpdateUserRewardBalance
} from "@/src/db/data-access/reward/query"
import { InsertPointLedger, InsertTrustVerification } from "@/src/db/schema"
import {
  ActivityTypes,
  TrustVerificationStatus
} from "@/src/types/Rewards/rewards"
import { triggerPusherEvent } from "../../trigger"
import { syncUserRewardLevel } from "./syncUserRewardLevel"
import { CheckRewardAlreadyGivenAction } from "@/src/server-actions/Reward/Reward"

export async function handleAddReward(payload: {
  action_type: string
  user_id: string
  proof_url?: string
  metadata?: any
  verification_id?: number
  idempotency_field?: string
  idempotency_value?: string
}) {
  const {
    action_type,
    user_id,
    proof_url,
    metadata,
    verification_id,
    idempotency_field,
    idempotency_value
  } = payload

  const featureFlag = await getFeatureFlag(["Trust_Engine_Enabled"])
  if (!featureFlag?.is_enabled) return

  const activityRule = await GetActivityRule({ action_type })
  if (!activityRule)
    throw new Error(`Activity rule not found for: ${action_type}`)

  if (idempotency_field && idempotency_value) {
    const checkResult = await CheckRewardAlreadyGivenAction(
      user_id,
      action_type,
      idempotency_field,
      idempotency_value
    )

    if (checkResult?.data?.alreadyRewarded) {
      return { success: true, data: null, skipped: true }
    }
  }

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

  const existingBalance = await GetUserRewardBalance(
    user_id,
    activityRule.reward_id
  )

  let currentBalance: number
  let userRewardBalance

  if (existingBalance) {
    currentBalance =
      (existingBalance.current_balance ?? 0) + activityRule.base_points
    userRewardBalance = await UpdateUserRewardBalance(
      user_id,
      activityRule.reward_id,
      currentBalance
    )
  } else {
    currentBalance = activityRule.base_points
    userRewardBalance = await InsertUserRewardBalance(
      user_id,
      activityRule.reward_id,
      currentBalance
    )
  }

  await syncUserRewardLevel(user_id, currentBalance, activityRule)

  if (activityRule.required_verification) {
    const milestoneRule = await GetActivityRule({
      action_type: ActivityTypes.MilestoneApproval
    })
    await AddVerificationEntry({
      user_id,
      rule_id: activityRule.rule_id,
      status: TrustVerificationStatus.Pending,
      points: milestoneRule?.base_points,
      proof_url
    } as InsertTrustVerification)
  }

  await triggerPusherEvent(user_id, "reward_added", {
    ledgerEntry,
    userRewardBalance
  })
}
