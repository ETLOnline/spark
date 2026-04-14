"use server"

import {
  GetUserPointLedger,
  GetUserRewardBalance,
  InsertUserRewardBalance,
  UpdateUserRewardBalance,
  GetUserRewardLevel,
  GetRewardLevel,
  GetRewardLevels,
  assignUserRewardLevel,
  UpdateUserRewardlevel,
  updateTrustVerification
} from "@/src/db/data-access/reward/query"
import { CreateServerAction } from ".."
import { SelectActivityRules } from "@/src/db/schema"
import { AuthUserAction } from "../User/AuthUserAction"
import { ActivityTypes, RewardTypes } from "@/src/types/Rewards/rewards"
import { triggerPusherEvent } from "@/src/services/trigger"
import { enqueue } from "@/src/services/jobs/queue"

/**
 * Enqueues an add-reward background job and returns immediately.
 * The actual reward logic runs asynchronously in the worker process.
 */
export const AddRewardAction = CreateServerAction(
  true,
  async (
    action_type: string,
    user_id: string,
    proof_url?: string,
    metadata?: any,
    verification_id?: number
  ) => {
    try {
      await enqueue("rewards", "add-reward", {
        action_type,
        user_id,
        proof_url,
        metadata,
        verification_id
      })
      return { success: true, data: null }
    } catch (error) {
      console.log(error, "error")
      return { success: false, error }
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

      const isApproved = res?.status === "approved"
      const isRejected = res?.status === "rejected"

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

export const GetUSerRewardLevelAction = CreateServerAction(
  true,
  async (user_id: string) => {
    try {
      const res = await GetUserRewardLevel(user_id)
      return { success: true, data: res }
    } catch (error) {
      return { success: false, error }
    }
  }
)

export const SyncUserRewardLevelAction = CreateServerAction(
  true,
  async (
    user_id: string,
    currentBalance: number,
    activity_rule: SelectActivityRules
  ) => {
    try {
      const [currentLevel, levelBasedOnPoints, rewardLevels] =
        await Promise.all([
          GetUserRewardLevel(user_id),
          GetRewardLevel(currentBalance),
          GetRewardLevels()
        ])

      if (!levelBasedOnPoints) {
        return { success: false, error: "Reward level not found" }
      }

      if (!currentLevel) {
        const newUserReward = await assignUserRewardLevel(
          user_id,
          rewardLevels[0].id
        )
        return { success: true, data: newUserReward }
      }

      if (activity_rule.reward?.internal_name !== RewardTypes.Reputation_Points)
        return { success: true }

      if (currentLevel.level_id === levelBasedOnPoints.id) {
        return { success: true }
      }

      const updatedUserRewardLevel = await UpdateUserRewardlevel(
        user_id,
        levelBasedOnPoints.id
      )

      await triggerPusherEvent(user_id, "level_up", {
        newLevel: levelBasedOnPoints,
        currentUserBalance: currentBalance
      })

      return { success: true, data: updatedUserRewardLevel }
    } catch (error) {
      return { success: false, error }
    }
  }
)

export const GetUserTransactionsAction = CreateServerAction(
  true,
  async (user_id: string) => {
    try {
      const transactions = await GetUserPointLedger(user_id)
      return { success: true, data: transactions }
    } catch (error) {
      console.error("Error fetching user transactions:", error)
      return { success: false, error: "Failed to fetch transactions" }
    }
  }
)
