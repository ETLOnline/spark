"use server"

import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import {
  CreateSessionRequest,
  DeletePendingSessionRequestsForSlot,
  GetMentorAvailability,
  GetMentors,
  GetSessionRequestsForMenteeAndMentor,
  HasPendingSessionRequest,
  ReplaceMentorAvailability,
  type GetMentorFilters,
  type MentorAvailabilitySlotInput
} from "@/src/db/data-access/mentor/query"
import {
  updateUserProfile,
  SearchUserProfile
} from "@/src/db/data-access/profile/query"
import { GetUserRewardBalance } from "@/src/db/data-access/reward/query"
import {
  REPUTATION_POINTS_REWARD_ID,
  RP_THRESHOLD
} from "@/src/utils/constants"
import { MIN_DURATION_MINS, toMins } from "@/src/utils/time"
import moment from "moment-timezone"

// ── Types ──────────────────────────────────────────────────────────────────────

interface SaveMentorSetupPayload {
  userId: string
  professional_title: string
  company: string
  engagement_type: string
}

// ── Actions ────────────────────────────────────────────────────────────────────

/** Save mentor professional_title and company. */
export const SaveMentorSetupAction = CreateServerAction(
  true,
  async (payload: SaveMentorSetupPayload) => {
    try {
      await updateUserProfile(payload.userId, {
        professional_title: payload.professional_title,
        company: payload.company,
        engagement_type: payload.engagement_type || "both"
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
      const slots = await GetMentorAvailability(mentorId)

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
  async (payload: {
    mentorId: string
    slots: MentorAvailabilitySlotInput[]
  }) => {
    try {
      const { mentorId, slots } = payload

      // Auth guard — only the mentor themselves can update their slots
      const authUser = await AuthUserAction()
      if (!authUser || authUser.unique_id !== mentorId) {
        return { error: "Unauthorised" }
      }

      await ReplaceMentorAvailability(mentorId, slots)

      const profile = await SearchUserProfile(mentorId)
      const hasTitle = !!profile?.professional_title?.trim()
      const hasCompany = !!profile?.company?.trim()
      const hasSlots = slots.length > 0

      await updateUserProfile(mentorId, {
        is_mentor_active: hasTitle && hasCompany && hasSlots
      })

      return { success: true }
    } catch (error) {
      console.error("UpdateAvailabilityAction error:", error)
      return { error: "Failed to update availability" }
    }
  }
)

export const GetActiveMentorsAction = CreateServerAction(
  false,
  async (filters: GetMentorFilters = {}) => {
    try {
      const result = await GetMentors(filters)
      return {
        success: true,
        data: result.mentors,
        pagination: result.pagination
      }
    } catch (error) {
      console.error("GetActiveMentorsAction error:", error)
      return { success: false, error: "Failed to fetch active mentors" }
    }
  }
)

// ── Session Requests ────────────────────────────────────────────────────────────

interface CreateSessionRequestPayload {
  mentorId: string
  availabilitySlotId: number
  sessionDate: string
  startTime: string
  endTime: string
  topic: string
  description?: string
}

/** Mentee submits a request for a specific occurrence of a mentor's availability slot. */
export const CreateSessionRequestAction = CreateServerAction(
  true,
  async (payload: CreateSessionRequestPayload) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser) return { error: "Unauthorised" }

      if (!payload.topic?.trim()) {
        return { error: "Topic is required" }
      }

      const requestedStartDateTime = moment(
        `${payload.sessionDate} ${payload.startTime}`,
        "YYYY-MM-DD HH:mm"
      )
      if (requestedStartDateTime.isBefore(moment())) {
        return { error: "Cannot request a session in the past" }
      }

      const balance = await GetUserRewardBalance(
        authUser.unique_id,
        REPUTATION_POINTS_REWARD_ID
      )
      const currentBalance = balance?.current_balance ?? 0
      if (currentBalance < RP_THRESHOLD) {
        return { error: "Not enough RP to request a session" }
      }

      const slots = await GetMentorAvailability(payload.mentorId)
      const slot = slots.find((s) => s.id === payload.availabilitySlotId)
      if (!slot || !slot.is_active) {
        return { error: "This slot is no longer available" }
      }

      const requestedStart = toMins(payload.startTime)
      const requestedEnd = toMins(payload.endTime)
      if (
        requestedEnd - requestedStart < MIN_DURATION_MINS ||
        requestedStart < toMins(slot.start_time) ||
        requestedEnd > toMins(slot.end_time)
      ) {
        return { error: "Selected time is outside the mentor's availability" }
      }

      const alreadyRequested = await HasPendingSessionRequest(
        authUser.unique_id,
        payload.mentorId,
        payload.sessionDate,
        requestedStart,
        requestedEnd
      )
      if (alreadyRequested) {
        return { error: "You already have a pending request for this slot" }
      }

      const request = await CreateSessionRequest({
        mentorId: payload.mentorId,
        menteeId: authUser.unique_id,
        availabilitySlotId: payload.availabilitySlotId,
        sessionDate: payload.sessionDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        sessionType: slot.session_type,
        topic: payload.topic.trim(),
        description: payload.description?.trim() || null
      })

      return { success: true, data: request }
    } catch (error) {
      console.error("CreateSessionRequestAction error:", error)
      return { error: "Failed to submit session request" }
    }
  }
)

/** Fetch the current mentee's own session requests toward a given mentor. */
export const GetMySessionRequestsForMentorAction = CreateServerAction(
  true,
  async (mentorId: string) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser) return { error: "Unauthorised" }

      const requests = await GetSessionRequestsForMenteeAndMentor(
        authUser.unique_id,
        mentorId
      )
      return { success: true, data: requests }
    } catch (error) {
      console.error("GetMySessionRequestsForMentorAction error:", error)
      return { error: "Failed to fetch session requests" }
    }
  }
)

/**
 * Mentor removes a slot they offered — clears any pending requests that were
 * made against it. Pass sessionDate for a single-occurrence delete, or omit
 * it when the whole recurring series is removed. Accepted requests are left
 * alone; only "pending" ones are cleared.
 */
export const DeleteSessionRequestsForRemovedSlotAction = CreateServerAction(
  true,
  async (payload: {
    mentorId: string
    startTime: string
    endTime: string
    sessionDate?: string
  }) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser || authUser.unique_id !== payload.mentorId) {
        return { error: "Unauthorised" }
      }

      const deleted = await DeletePendingSessionRequestsForSlot(
        payload.mentorId,
        payload.startTime,
        payload.endTime,
        payload.sessionDate
      )
      return { success: true, data: deleted }
    } catch (error) {
      console.error("DeleteSessionRequestsForRemovedSlotAction error:", error)
      return { error: "Failed to clean up session requests" }
    }
  }
)
