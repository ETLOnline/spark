"use server"

import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import {
  CreateProgramFeedback,
  GetProgramFeedbackBySpaceAndUser,
  GetProgramFeedbackForSpace
} from "@/src/db/data-access/programFeedback/query"
import { getSpaceUsers } from "@/src/db/data-access/spaces/query"
import { AddRecommendationAction } from "../Recommendation/recommendation"
import { InsertProgramFeedback, SelectRecommendation } from "@/src/db/schema"
import {
  FEEDBACK_ROLES,
  FeedbackRole,
  permissions
} from "@/src/utils/constants"
import { filterUserIdsByPermission } from "@/src/utils/serverHelpers"

// ─── Get my submission (or null) for a space ───────────────────────────────────
// Used to decide whether to show the feedback prompt/page.

export const GetMyProgramFeedbackAction = CreateServerAction(
  true,
  async (spaceId: string) => {
    try {
      const user = await AuthUserAction()
      if (!user) return { success: false, message: "Unauthorized" }

      const feedback = await GetProgramFeedbackBySpaceAndUser(
        spaceId,
        user.unique_id
      )
      return { success: true, data: feedback }
    } catch (error) {
      return { error: error }
    }
  }
)

// ─── Get all submissions for a space ───────────────────────────────────────────

export const GetProgramFeedbackForSpaceAction = CreateServerAction(
  true,
  async (spaceId: string) => {
    try {
      const feedback = await GetProgramFeedbackForSpace(spaceId)
      return { success: true, data: feedback }
    } catch (error) {
      return { error: error }
    }
  }
)

// ─── Submit feedback ────────────────────────────────────────────────────────────
// One submission per user per space, enforced here (not a DB constraint).

export const SubmitProgramFeedbackAction = CreateServerAction(
  true,
  async (
    spaceId: string,
    input: Pick<
      InsertProgramFeedback,
      | "overall_program_rating"
      | "spark_overall_rating"
      | "partner_rating"
      | "answers"
    > & { role: FeedbackRole }
  ) => {
    try {
      const user = await AuthUserAction()
      if (!user) return { success: false, message: "Unauthorized" }

      const existing = await GetProgramFeedbackBySpaceAndUser(
        spaceId,
        user.unique_id
      )
      if (existing) {
        return {
          success: false,
          message: "Feedback has already been submitted for this space"
        }
      }

      const created = await CreateProgramFeedback({
        space_id: spaceId,
        submitted_by: user.unique_id,
        overall_program_rating: input.overall_program_rating,
        spark_overall_rating: input.spark_overall_rating,
        partner_rating: input.partner_rating,
        answers: input.answers
      })

      try {
        const content = "Submitted via FYP Program Feedback"

        // Student feedback goes only to space members who can submit as an
        // advisor (i.e. the advisor(s)); advisor feedback goes only to
        // members who can submit as a student.
        const [recipientNamespace, recipientAction] =
          input.role === FEEDBACK_ROLES.advisor
            ? (["fyp", permissions.fyp.feedbackSubmitStudent] as const)
            : ([
                "advisory",
                permissions.advisory.feedbackSubmitAdvisor
              ] as const)
        const spaceUsers = await getSpaceUsers(spaceId)
        const memberIds = spaceUsers
          .map((su) => su.user?.unique_id)
          .filter((id): id is string => !!id && id !== user.unique_id)

        const recipientIds = await filterUserIdsByPermission(
          memberIds,
          recipientNamespace,
          recipientAction,
          { entityType: "SPACE", entityId: spaceId }
        )

        for (const recipientId of recipientIds) {
          await AddRecommendationAction({
            content,
            rating: input.partner_rating,
            recommender_id: user.unique_id,
            receiver_id: recipientId,
            type: "fyp"
          } as SelectRecommendation)
        }
      } catch (recommendationError) {
        console.error(
          "Failed to mirror program feedback rating to recommendations:",
          recommendationError
        )
      }

      return { success: true, data: created }
    } catch (error) {
      return { error: error }
    }
  }
)
