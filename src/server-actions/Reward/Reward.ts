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
  updateTrustVerification,
  GetActivityRule,
  HasUserBeenRewardedForResource
} from "@/src/db/data-access/reward/query"
import { CreateServerAction } from ".."
import { SelectActivityRules } from "@/src/db/schema"
import { AuthUserAction } from "../User/AuthUserAction"
import { ActivityTypes, RewardTypes } from "@/src/types/Rewards/rewards"
import { triggerPusherEvent } from "@/src/services/trigger"
import { enqueue } from "@/src/services/jobs/queue"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"

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
    verification_id?: number,
    idempotency_field?: string,
    idempotency_value?: string
  ) => {
    try {
      await enqueue("rewards", "add-reward", {
        action_type,
        user_id,
        proof_url,
        metadata,
        verification_id,
        idempotency_field,
        idempotency_value
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

      const taskCompletionRule = await GetActivityRule({
        action_type: ActivityTypes.TaskCompletion
      })

      const isTaskCompletion =
        taskCompletionRule && res.rule_id === taskCompletionRule.rule_id

      if (isApproved) {
        if (isTaskCompletion) {
          // Task completion verified — reward assignee
          await AddRewardAction(
            ActivityTypes.TaskCompletionVerification,
            res.user_id,
            res.proof_url,
            {},
            verification_id
          )

          // Reward the reviewer
          if (res.approved_by) {
            await AddRewardAction(
              ActivityTypes.TaskCompletionReview,
              res.approved_by,
              res.proof_url,
              {},
              verification_id
            )
          }
        } else {
          // Milestone approval flow
          await AddRewardAction(
            ActivityTypes.MilestoneApproval,
            res.user_id,
            res.proof_url,
            {},
            verification_id
          )
        }
      }

      if ((isApproved || isRejected) && !isTaskCompletion) {
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
  async (user_id: string, page: number = 1, pageSize: number = 10) => {
    try {
      const result = await GetUserPointLedger(user_id, page, pageSize)
      return { success: true, data: result.data, total: result.total }
    } catch (error) {
      console.error("Error fetching user transactions:", error)
      return { success: false, error: "Failed to fetch transactions" }
    }
  }
)

export const AddTaskRewardAction = CreateServerAction(
  true,
  async (
    activityType: ActivityTypes,
    payload: {
      user_id: string
      task_id?: string
      project_id?: string
      sprint_id?: string
      comment_id?: number
    },
    idempotency_field?: string,
    idempotency_value?: string
  ) => {
    try {
      const { user_id, task_id, project_id, sprint_id, comment_id } = payload

      if (!user_id) return { success: false, error: "user_id is required" }

      let proof_url: string | undefined
      let metadata: Record<string, any> = {}

      if (task_id && project_id) {
        proof_url = createAbsoluteUrl(`/project/${project_id}/task/${task_id}`)
        metadata = {
          task_id,
          project_id,
          ...(comment_id ? { comment_id } : {})
        }
      } else if (sprint_id && project_id) {
        proof_url = createAbsoluteUrl(`/project/${project_id}/sprint`)
        metadata = { sprint_id, project_id }
      } else if (project_id) {
        proof_url = createAbsoluteUrl(`/project/${project_id}/details`)
        metadata = { project_id }
      }

      return await AddRewardAction(
        activityType,
        user_id,
        proof_url,
        metadata,
        undefined,
        idempotency_field,
        idempotency_value
      )
    } catch (error) {
      return { success: false, error }
    }
  }
)
export const getRewardLevelsAction = CreateServerAction(true, async () => {
  try {
    const levels = await GetRewardLevels()
    return { success: true, data: levels }
  } catch (error) {
    return { success: false, error }
  }
})

/**
 * Check whether a user has already been rewarded for a specific resource.
 *
 * @param user_id     - The user to check
 * @param action_type - The ActivityTypes key (used to look up the rule_id)
 * @param field       - The JSONB metadata key to match (e.g. "post_id", "task_id", "sprint_id")
 * @param value       - The resource ID value to match
 *
 * Returns { alreadyRewarded: true } when a matching ledger entry already exists,
 * so callers can skip AddRewardAction and avoid duplicate points.
 */
export const CheckRewardAlreadyGivenAction = CreateServerAction(
  false,
  async (
    user_id: string,
    action_type: string,
    field: string,
    value: string
  ) => {
    try {
      const activityRule = await GetActivityRule({ action_type })

      if (!activityRule) {
        // Rule doesn't exist — treat as not rewarded so the reward flow can handle it
        return { success: true, data: { alreadyRewarded: false } }
      }

      const alreadyRewarded = await HasUserBeenRewardedForResource(
        user_id,
        activityRule.rule_id,
        field,
        value
      )

      return { success: true, data: { alreadyRewarded } }
    } catch (error) {
      return { success: false, error }
    }
  }
)
