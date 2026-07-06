"use server"

import { CreateServerAction } from ".."
import { db } from "@/src/db"
import { mentorAvailabilityTable } from "@/src/db/schema"
import { eq } from "drizzle-orm"
import { AuthUserAction } from "../User/AuthUserAction"
import { updateUserProfile } from "@/src/db/data-access/profile/query"

// ── Types ──────────────────────────────────────────────────────────────────────

interface SaveMentorSetupPayload {
  userId: string
  professional_title: string
  company: string
}

interface AvailabilitySlot {
  date: string // YYYY-MM-DD (anchor / start date)
  start_time: string
  end_time: string
  session_type: string
  repeat_type: string // "none" | "daily" | "weekly"
  repeat_end_date?: string | null
}

// ── Actions ────────────────────────────────────────────────────────────────────

/** Save mentor professional_title and company. */
export const SaveMentorSetupAction = CreateServerAction(
  true,
  async (payload: SaveMentorSetupPayload) => {
    try {
      await updateUserProfile(payload.userId, {
        professional_title: payload.professional_title,
        company: payload.company
      })
      return { success: true }
    } catch (error) {
      console.error("SaveMentorSetupAction error:", error)
      return { error: "Failed to save mentor setup" }
    }
  }
)

/** Fetch all availability slots for a mentor. */
export const GetMentorAvailabilityAction = CreateServerAction(
  true,
  async (mentorId: string) => {
    try {
      const slots = await db
        .select()
        .from(mentorAvailabilityTable)
        .where(eq(mentorAvailabilityTable.mentor_id, mentorId))

      return { success: true, data: slots }
    } catch (error) {
      console.error("GetMentorAvailabilityAction error:", error)
      return { error: "Failed to fetch availability" }
    }
  }
)

/** Replace all slots for a mentor atomically (delete + reinsert in one transaction). */
export const UpdateAvailabilityAction = CreateServerAction(
  true,
  async (payload: { mentorId: string; slots: AvailabilitySlot[] }) => {
    try {
      const { mentorId, slots } = payload

      // Auth guard — only the mentor themselves can update their slots
      const authUser = await AuthUserAction()
      if (!authUser || authUser.unique_id !== mentorId) {
        return { error: "Unauthorised" }
      }

      await db.transaction(async (tx) => {
        await tx
          .delete(mentorAvailabilityTable)
          .where(eq(mentorAvailabilityTable.mentor_id, mentorId))

        if (slots.length > 0) {
          await tx.insert(mentorAvailabilityTable).values(
            slots.map((slot) => ({
              mentor_id: mentorId,
              date: slot.date,
              start_time: slot.start_time,
              end_time: slot.end_time,
              session_type: slot.session_type,
              repeat_type: slot.repeat_type,
              repeat_end_date: slot.repeat_end_date ?? null,
              is_active: true
            }))
          )
        }
      })

      return { success: true }
    } catch (error) {
      console.error("UpdateAvailabilityAction error:", error)
      return { error: "Failed to update availability" }
    }
  }
)
