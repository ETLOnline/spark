"use server"

import {
  AddLedgerEntry,
  AddVerificationEntry,
  GetActivityRule,
  GetRewardLevel,
  GetUserRewardBalance,
  InsertUserRewardBalance,
  updateTrustVerification,
  UpdateUserRewardBalance
} from "@/src/db/data-access/reward/query"
import { CreateServerAction } from ".."
import { InsertPointLedger, InsertTrustVerification } from "@/src/db/schema"
import { AuthUserAction } from "../User/AuthUserAction"
import {
  ActivityTypes,
  TrustVerificationStatus
} from "@/src/types/Rewards/rewards"
import { triggerPusherEvent } from "@/src/services/trigger"
import { getFeatureFlagAction } from "../FeatureFlag/FeatureFlag"

export const AddRewardAction = CreateServerAction(
  true,
  async (
    action_type: string,
    user_id: string,
    proof_url: string,
    metadata?: any,
    verification_id?: number
  ) => {
    try {
      const fetureFlag = await getFeatureFlagAction("Trust_Engine_Enabled")
      if (!fetureFlag?.success || !fetureFlag.data?.is_enabled) {
        return { success: true, data: null }
      }

      const activityRule = await GetActivityRule({ action_type })

      if (!activityRule) {
        return { success: false, error: "Activity rule not found" }
      }

      const ledgerData = {
        user_id: user_id,
        reward_id: activityRule.reward_id,
        rule_id: activityRule.rule_id,
        amount: activityRule.base_points,
        source_system: "internal_app",
        external_ref_id: "",
        trust_verification_id: verification_id || null,
        metadata: {
          milestone_id: null,
          milestone_type: null,
          milestone_url: null,
          ...metadata
        },
        transection_type: "debit"
      }

      const ledgerEntry = await AddLedgerEntry(ledgerData as InsertPointLedger)

      const existingBalanceResponse = await GetUserRewardBalanceAction(
        user_id,
        activityRule.reward_id
      )

      let userRewardBalance

      if (existingBalanceResponse?.success && existingBalanceResponse.data) {
        const existingBalance = existingBalanceResponse.data
        const newTotal =
          (existingBalance.current_balance || 0) + activityRule.base_points
        userRewardBalance = await UpdateUserRewardBalanceAction(
          user_id,
          activityRule.reward_id,
          newTotal
        )
      } else {
        userRewardBalance = await InsertUserRewardBalanceAction(
          user_id,
          activityRule.reward_id,
          activityRule.base_points
        )
      }

      if (activityRule.required_verification) {
        const activity = await GetActivityRule({
          action_type: ActivityTypes.MilestoneApproval
        })

        const verificationData = {
          user_id: user_id,
          rule_id: activityRule.rule_id,
          status: TrustVerificationStatus.Pending,
          points: activity?.base_points,
          proof_url: proof_url
        }

        const verificationEntry = await AddVerificationEntry(
          verificationData as InsertTrustVerification
        )
      }
      // add pusher for send real time
      await triggerPusherEvent(user_id, "reward_added", userRewardBalance)

      return { success: true, data: ledgerEntry }
    } catch (error) {
      console.log(error, "error")
      return { success: false, error: error }
    }
  }
)

export const UpdateTrustVerificationAction = CreateServerAction(
  true,
  async (verification_id: number, status: string, feedback: string) => {
    try {
      const user = await AuthUserAction()
      if (!user) {
        throw new Error("Unauthorized", { cause: 401 })
      }

      const data = {
        status,
        feedback,
        approved_by: user.unique_id,
        verified_at: new Date().toISOString()
      }

      const res = await updateTrustVerification(verification_id, data)

      const isApproved = res?.status === TrustVerificationStatus.Approved
      const isRejected = res?.status === TrustVerificationStatus.Rejected

      if (isApproved) {
        await AddRewardAction(
          ActivityTypes.MilestoneApproval,
          res.user_id,
          res.proof_url,
          {},
          verification_id
        )
      }

      if (isApproved || isRejected) {
        await AddRewardAction(
          ActivityTypes.MilestoneVerified,
          res.approved_by || "",
          res.proof_url,
          {},
          verification_id
        )
      }

      return { success: true, data: res }
    } catch (error) {
      return { success: false, error }
    }
  }
)

/**
 * Action to fetch the current balance for a specific user and reward type.
 */
export const GetUserRewardBalanceAction = CreateServerAction(
  true,
  async (user_id: string, reward_id: number) => {
    try {
      const balance = await GetUserRewardBalance(user_id, reward_id)
      return { success: true, data: balance }
    } catch (error) {
      return { success: false, error: "Failed to fetch balance" }
    }
  }
)

/**
 * Action to update an existing reward balance with a new total.
 */
export const UpdateUserRewardBalanceAction = CreateServerAction(
  true,
  async (user_id: string, reward_id: number, new_balance: number) => {
    try {
      const res = await UpdateUserRewardBalance(user_id, reward_id, new_balance)
      return { success: true, data: res }
    } catch (error) {
      return { success: false, error: "Failed to update balance" }
    }
  }
)

/**
 * Action to create a new reward balance entry for a user.
 */
export const InsertUserRewardBalanceAction = CreateServerAction(
  true,
  async (user_id: string, reward_id: number, amount: number) => {
    try {
      const res = await InsertUserRewardBalance(user_id, reward_id, amount)
      return { success: true, data: res }
    } catch (error) {
      return { success: false, error: "Failed to insert balance" }
    }
  }
)
export const GetRewardLevelAction = CreateServerAction(
  true,
  async (points: number) => {
    try {
      const res = await GetRewardLevel(points)
      return { success: true, data: res }
    } catch (error) {
      return { success: false, error }
    }
  }
)
