"use server"

import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import {
  CreateProgramFeedback,
  GetProgramFeedbackBySpaceAndUser,
  GetProgramFeedbackForSpace
} from "@/src/db/data-access/programFeedback/query"
import { InsertProgramFeedback } from "@/src/db/schema"

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
    >
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

      return { success: true, data: created }
    } catch (error) {
      return { error: error }
    }
  }
)
