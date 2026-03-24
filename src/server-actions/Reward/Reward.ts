import {
  AddLedgerEntry,
  AddVerificationEntry,
  GetActivityRule,
  UpsertUserRewardBalance
} from "@/src/db/data-access/reward/query"
import { CreateServerAction } from ".."
import { InsertPointLedger, InsertTrustVerification } from "@/src/db/schema"
import { AuthUserAction } from "../User/AuthUserAction"

export const AddRewardAction = CreateServerAction(
  true,
  async (action_type: string, user_id: string) => {
    try {
      const activityRule = await GetActivityRule(action_type)

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
        metadata: {}
      }

      const ledgerEntry = await AddLedgerEntry(ledgerData as InsertPointLedger)

      await UpsertUserRewardBalance(
        user_id,
        activityRule.reward_id,
        activityRule.base_points
      )

      if (activityRule.required_verification) {
        const verificationData = {
          user_id: user_id,
          rule_id: activityRule.rule_id,
          status: "pending",
          points_awarded: activityRule.base_points
        }

        const verificationEntry = await AddVerificationEntry(
          verificationData as InsertTrustVerification
        )
      }

      return { success: true, data: ledgerEntry }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)