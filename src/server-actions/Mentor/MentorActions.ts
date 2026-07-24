"use server"

import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { GetUserPermissionsParsedAction } from "../UserRoles/UserRole"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import {
  ArchiveSessionSpace,
  ConfirmSessionAttendance,
  CreateSessionRequest,
  DeletePendingSessionRequestsForSlot,
  GetAcceptedSessionRequestsForMentee,
  GetAcceptedSessionRequestsForMentor,
  GetEngagementsForUser,
  GetFeedbackSubmittersForSessions,
  GetMentorAvailability,
  GetMentors,
  GetPendingSessionRequestsForMentor,
  GetSessionRequestById,
  GetSessionRequestsForMenteeAndMentor,
  GetSessionRequestsForMentorByStatus,
  GetSharedSpacesForSessions,
  HasAcceptedOverlap,
  HasPendingSessionRequest,
  ReplaceMentorAvailability,
  ResubmitSessionRequest,
  SubmitMentorshipFeedback,
  SuggestSlots,
  UpdateSessionRequestStatus,
  type GetMentorFilters,
  type MentorAvailabilitySlotInput
} from "@/src/db/data-access/mentor/query"
import type {
  Engagement,
  EngagementStatus
} from "@/src/components/Dashboard/profile/engagements/types"
import type { SpaceBasic } from "@/src/db/data-access/mentor/query"
import { notifySessionSlotSuggested } from "@/src/services/notify/mentor/session"
import { NotificationEvent } from "@/src/services/notify/types/events"
import { SendMentorSlotSuggestionNotification } from "@/src/services/notifications/Mentor/utils"
import {
  updateUserProfile,
  SearchUserProfile
} from "@/src/db/data-access/profile/query"
import { GetUserRewardBalance } from "@/src/db/data-access/reward/query"
import {
  REPUTATION_POINTS_REWARD_ID,
  RP_THRESHOLD,
  SESSION_REQUEST_DESCRIPTION_MAX_LENGTH,
  SESSION_REQUEST_TOPIC_MAX_LENGTH
} from "@/src/utils/constants"
import { MIN_DURATION_MINS, toMins } from "@/src/utils/time"
import { SendSystemNotification } from "@/src/services/system-notification/SystemNotification.utils"
import { sendPushNotification } from "@/src/services/notifications/PushNotification.utils"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"
import {
  createSessionRequestEmailNotification,
  createSessionResponseEmailNotification
} from "@/src/services/notify/sessionRequest/sessionRequest"
import moment from "moment-timezone"

// ── Types ──────────────────────────────────────────────────────────────────────

interface SaveMentorSetupPayload {
  userId: string
  professional_title: string
  company: string
  engagement_type: string
}

export interface SlotOccurrence {
  key: string
  slotId: number
  displayDate: string
  start_time: string
  end_time: string
  session_type: string
  repeat_type: string
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

export const GetMentorSuggestableSlotsAction = CreateServerAction(
  true,
  async (payload: { mentorId: string; afterDate: string }) => {
    try {
      const [slots, acceptedBookings] = await Promise.all([
        GetMentorAvailability(payload.mentorId),
        GetAcceptedSessionRequestsForMentor(payload.mentorId)
      ])

      const after = moment(payload.afterDate, "YYYY-MM-DD")
      const occurrences: SlotOccurrence[] = []

      const isBooked = (dateStr: string, slotStart: string, slotEnd: string) =>
        acceptedBookings.some(
          (r) =>
            r.session_date === dateStr &&
            toMins(r.start_time) < toMins(slotEnd) &&
            toMins(slotStart) < toMins(r.end_time)
        )

      for (const slot of slots) {
        const slotStart = moment(slot.date, "YYYY-MM-DD")
        const endDate = slot.repeat_end_date
          ? moment(slot.repeat_end_date, "YYYY-MM-DD")
          : moment(payload.afterDate, "YYYY-MM-DD").add(60, "days")

        if (slot.repeat_type === "none") {
          if (
            slotStart.isAfter(after) &&
            !isBooked(slot.date, slot.start_time, slot.end_time)
          ) {
            occurrences.push({
              key: `${slot.id}-${slot.date}`,
              slotId: slot.id,
              displayDate: slot.date,
              start_time: slot.start_time,
              end_time: slot.end_time,
              session_type: slot.session_type,
              repeat_type: slot.repeat_type
            })
          }
          continue
        }

        const cursor = after.clone().add(1, "day")

        while (!cursor.isAfter(endDate)) {
          const applies =
            slot.repeat_type === "daily" ||
            (slot.repeat_type === "weekly" && cursor.day() === slotStart.day())

          if (applies && !cursor.isBefore(slotStart)) {
            const dateStr = cursor.format("YYYY-MM-DD")
            if (!isBooked(dateStr, slot.start_time, slot.end_time)) {
              occurrences.push({
                key: `${slot.id}-${dateStr}`,
                slotId: slot.id,
                displayDate: dateStr,
                start_time: slot.start_time,
                end_time: slot.end_time,
                session_type: slot.session_type,
                repeat_type: slot.repeat_type
              })
            }
          }
          cursor.add(1, "day")
        }
      }

      return { success: true, data: occurrences }
    } catch (error) {
      console.error("GetMentorSuggestableSlotsAction error:", error)
      return { error: "Failed to fetch available slots" }
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
  recurring?: boolean
  repeatEndDate?: string | null
}

/** Mentee submits a request for a specific occurrence of a mentor's availability slot. */
export const CreateSessionRequestAction = CreateServerAction(
  true,
  async (payload: CreateSessionRequestPayload) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser) return { error: "Unauthorised" }

      // Super admins can view mentor availability but never submit a request
      // themselves — the platform's usual "admins bypass everything" rule is
      // intentionally NOT applied here, so isSuperAdmin is forced to false.
      const permsResponse = await GetUserPermissionsParsedAction(
        authUser.unique_id
      )
      if (!permsResponse.success) return { error: permsResponse.error }
      const permissionChecker = new PermissionChecker(
        "global",
        permsResponse.data,
        false
      )
      if (!permissionChecker.canAccess("session.request")) {
        return { error: "You do not have permission to request a session" }
      }

      if (!payload.topic?.trim()) {
        return { error: "Topic is required" }
      }
      if (payload.topic.trim().length > SESSION_REQUEST_TOPIC_MAX_LENGTH) {
        return {
          error: `Topic must be ${SESSION_REQUEST_TOPIC_MAX_LENGTH} characters or fewer`
        }
      }
      if (
        (payload.description?.length ?? 0) >
        SESSION_REQUEST_DESCRIPTION_MAX_LENGTH
      ) {
        return {
          error: `Description must be ${SESSION_REQUEST_DESCRIPTION_MAX_LENGTH} characters or fewer`
        }
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

      if (payload.recurring && slot.repeat_type === "none") {
        return { error: "This slot doesn't repeat" }
      }
      const repeatType = payload.recurring ? slot.repeat_type : "none"
      let repeatEndDate: string | null = null
      if (payload.recurring) {
        repeatEndDate = payload.repeatEndDate?.trim() || slot.repeat_end_date
        if (
          repeatEndDate &&
          moment(repeatEndDate, "YYYY-MM-DD").isBefore(
            moment(payload.sessionDate, "YYYY-MM-DD")
          )
        ) {
          return {
            error: "Repeat-until date can't be before the session date"
          }
        }
        if (
          slot.repeat_end_date &&
          repeatEndDate &&
          repeatEndDate > slot.repeat_end_date
        ) {
          return {
            error:
              "Repeat-until date can't be after the mentor's availability ends"
          }
        }
        if (
          repeatType === "weekly" &&
          repeatEndDate &&
          moment(repeatEndDate, "YYYY-MM-DD").day() !==
            moment(payload.sessionDate, "YYYY-MM-DD").day()
        ) {
          return {
            error: "Repeat-until date must fall on the same weekday as the slot"
          }
        }
      }

      const alreadyRequested = await HasPendingSessionRequest(
        authUser.unique_id,
        payload.mentorId,
        payload.sessionDate,
        requestedStart,
        requestedEnd,
        repeatType,
        repeatEndDate
      )
      if (alreadyRequested) {
        return { error: "You already have a pending request for this slot" }
      }

      const alreadyBooked = await HasAcceptedOverlap(
        payload.mentorId,
        payload.sessionDate,
        requestedStart,
        requestedEnd,
        repeatType,
        repeatEndDate,
        slot.session_type,
        authUser.unique_id
      )
      if (alreadyBooked) {
        return { error: "This time has already been booked" }
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
        description: payload.description?.trim() || null,
        repeatType,
        repeatEndDate
      })

      const menteeName = `${authUser.first_name} ${authUser.last_name}`.trim()
      const requestsInboxUrl = createAbsoluteUrl("/profile/session-requests")
      const newRequestTemplate = {
        title: "New session request",
        body: `${menteeName} wants to discuss "${request.topic}"`,
        deep_link: requestsInboxUrl,
        icon: authUser.profile_url || ""
      }

      await SendSystemNotification({
        user_id: authUser.unique_id,
        receivers: [payload.mentorId],
        template: newRequestTemplate
      })

      await sendPushNotification({
        receivers: [payload.mentorId],
        template: newRequestTemplate
      })

      await createSessionRequestEmailNotification(
        payload.mentorId,
        request,
        menteeName
      )

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

/** Fetch a mentor's session requests for one status tab (Pending/Accepted/Rejected) of their Requests inbox. */
export const GetSessionRequestsForMentorByStatusAction = CreateServerAction(
  true,
  async (
    mentorId: string,
    status: "pending" | "accepted" | "rejected",
    page = 1,
    limit = 10
  ) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser || authUser.unique_id !== mentorId) {
        return { error: "Unauthorised" }
      }

      const result = await GetSessionRequestsForMentorByStatus(
        mentorId,
        status,
        page,
        limit
      )
      return {
        success: true,
        data: result.requests,
        pagination: result.pagination
      }
    } catch (error) {
      console.error("GetSessionRequestsForMentorByStatusAction error:", error)
      return { error: "Failed to fetch session requests" }
    }
  }
)

/** Fetch a mentor's accepted bookings — used to grey out already-booked times on the calendar. */
export const GetAcceptedSessionRequestsForMentorAction = CreateServerAction(
  true,
  async (mentorId: string) => {
    try {
      const requests = await GetAcceptedSessionRequestsForMentor(mentorId)
      return { success: true, data: requests }
    } catch (error) {
      console.error("GetAcceptedSessionRequestsForMentorAction error:", error)
      return { error: "Failed to fetch booked sessions" }
    }
  }
)

/** A mentee's own accepted bookings — private, only the mentee themselves can fetch this. */
export const GetAcceptedSessionRequestsForMenteeAction = CreateServerAction(
  true,
  async (menteeId: string) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser || authUser.unique_id !== menteeId) {
        return { error: "Unauthorised" }
      }
      const requests = await GetAcceptedSessionRequestsForMentee(menteeId)
      return { success: true, data: requests }
    } catch (error) {
      console.error("GetAcceptedSessionRequestsForMenteeAction error:", error)
      return { error: "Failed to fetch booked sessions" }
    }
  }
)

/** Fetch a mentor's pending requests — used for badge counts on the mentor's own calendar. */
export const GetPendingSessionRequestsForMentorAction = CreateServerAction(
  true,
  async (mentorId: string) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser || authUser.unique_id !== mentorId) {
        return { error: "Unauthorised" }
      }
      const requests = await GetPendingSessionRequestsForMentor(mentorId)
      return { success: true, data: requests }
    } catch (error) {
      console.error("GetPendingSessionRequestsForMentorAction error:", error)
      return { error: "Failed to fetch pending requests" }
    }
  }
)

/** Mentor accepts or rejects a pending session request. Pass `spaceId` when
 * accepting with a workspace attached, so the session can link straight to it. */
export const RespondToSessionRequestAction = CreateServerAction(
  true,
  async (
    requestId: number,
    status: "accepted" | "rejected",
    spaceId?: string | null
  ) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser) return { error: "Unauthorised" }

      const request = await GetSessionRequestById(requestId)
      if (!request || request.mentor_id !== authUser.unique_id) {
        return { error: "Unauthorised" }
      }
      if (request.status !== "pending" && request.status !== "resubmitted") {
        return { error: "This request has already been responded to" }
      }

      const updated = await UpdateSessionRequestStatus(
        requestId,
        status,
        spaceId
      )

      const mentorName = `${authUser.first_name} ${authUser.last_name}`.trim()
      const responseTemplate = {
        title:
          status === "accepted"
            ? "Session request accepted"
            : "Session request declined",
        body:
          status === "accepted"
            ? `${mentorName} accepted your session request: "${request.topic}"`
            : `${mentorName} declined your session request: "${request.topic}"`,
        deep_link: createAbsoluteUrl(
          `/profile/${request.mentor_id}/availability`
        ),
        icon: authUser.profile_url || ""
      }

      await SendSystemNotification({
        user_id: authUser.unique_id,
        receivers: [request.mentee_id],
        template: responseTemplate
      })

      await sendPushNotification({
        receivers: [request.mentee_id],
        template: responseTemplate
      })

      await createSessionResponseEmailNotification(request, mentorName, status)

      return { success: true, data: updated }
    } catch (error) {
      console.error("RespondToSessionRequestAction error:", error)
      return { error: "Failed to respond to session request" }
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

// ── Engagements ─────────────────────────────────────────────────────────────────

function deriveEngagementStatus(
  sessionDate: string,
  endTime: string,
  viewerId: string,
  confirmations: Record<string, string>,
  submitters: string[]
): EngagementStatus {
  const end = moment(`${sessionDate} ${endTime}`, "YYYY-MM-DD HH:mm")
  if (end.isAfter(moment())) return "upcoming"

  const viewerConfirmed = !!confirmations[viewerId]
  const viewerSubmitted = submitters.includes(viewerId)

  return viewerConfirmed && viewerSubmitted ? "completed" : "overdue"
}

type SessionRequestRow = Awaited<
  ReturnType<typeof GetEngagementsForUser>
>[number]

function buildEngagement(
  req: SessionRequestRow,
  viewerId: string,
  feedbackSubmitters: string[],
  fallbackSpace: SpaceBasic | null
): Engagement {
  const isMentor = req.mentor_id === viewerId
  const counterpartUser = isMentor ? req.mentee : req.mentor

  const firstName = counterpartUser?.first_name ?? ""
  const lastName = counterpartUser?.last_name ?? ""
  const roleParts = [
    counterpartUser?.profile?.professional_title,
    counterpartUser?.profile?.company
  ].filter(Boolean)

  const confirmations = (req.attendee_confirmations ?? {}) as Record<
    string,
    string
  >
  const space = req.space ?? fallbackSpace

  return {
    id: req.id,
    topic: req.topic,
    description: req.description ?? "",
    sessionDate: req.session_date,
    startTime: req.start_time,
    endTime: req.end_time,
    sessionType: req.session_type as "1:1" | "group",
    status: deriveEngagementStatus(
      req.session_date,
      req.end_time,
      viewerId,
      confirmations,
      feedbackSubmitters
    ),
    counterpart: {
      name: `${firstName} ${lastName}`.trim() || "Unknown",
      role: roleParts.join(" · ") || (isMentor ? "Mentee" : "Mentor"),
      initials: `${firstName[0] ?? "?"}${lastName[0] ?? "?"}`.toUpperCase(),
      avatarUrl: counterpartUser?.profile_url ?? undefined
    },
    spaceId: req.space_id ?? fallbackSpace?.id ?? undefined,
    spaceName: space?.space_name ?? undefined,
    spaceSlug: space?.space_slug ?? undefined,
    spaceCreatedBy: space?.created_by ?? undefined,
    isSpaceArchived: req.is_space_archived ?? false,
    isMentor,
    iViewerConfirmed: !!confirmations[viewerId],
    feedbackSubmittedByViewer: feedbackSubmitters.includes(viewerId)
  }
}

/** Fetch all engagements (accepted + completed sessions) for the authenticated user. */
export const GetEngagementsAction = CreateServerAction(true, async () => {
  try {
    const authUser = await AuthUserAction()
    if (!authUser) return { error: "Unauthorised" }

    const requests = await GetEngagementsForUser(authUser.unique_id)
    const feedbackMap = await GetFeedbackSubmittersForSessions(
      requests.map((r) => r.id)
    )

    // For sessions accepted before space_id was saved, fall back to finding
    // a shared independent space between mentor and mentee
    const sessionsWithoutSpace = requests.filter((r) => !r.space_id)
    const fallbackSpaces = await GetSharedSpacesForSessions(
      sessionsWithoutSpace.map((r) => ({
        sessionId: r.id,
        mentorId: r.mentor_id,
        menteeId: r.mentee_id
      }))
    )

    const engagements = requests.map((req) =>
      buildEngagement(
        req,
        authUser.unique_id,
        feedbackMap[req.id] ?? [],
        fallbackSpaces[req.id] ?? null
      )
    )

    return { success: true, data: engagements }
  } catch (error) {
    console.error("GetEngagementsAction error:", error)
    return { error: "Failed to fetch engagements" }
  }
})

/** Confirm that the authenticated user attended the session. */
export const ConfirmSessionCompletionAction = CreateServerAction(
  true,
  async (sessionId: number) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser) return { error: "Unauthorised" }

      const session = await GetSessionRequestById(sessionId)
      if (!session) return { error: "Session not found" }
      if (
        session.mentor_id !== authUser.unique_id &&
        session.mentee_id !== authUser.unique_id
      ) {
        return { error: "Unauthorised" }
      }

      await ConfirmSessionAttendance(sessionId, authUser.unique_id)
      return { success: true }
    } catch (error) {
      console.error("ConfirmSessionCompletionAction error:", error)
      return { error: "Failed to confirm session" }
    }
  }
)

/** Mentor archives the space for a specific session. Only affects this session — the space and other sessions are untouched. */
export const ArchiveSpaceAction = CreateServerAction(
  true,
  async (sessionId: number) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser) return { error: "Unauthorised" }

      const updated = await ArchiveSessionSpace(sessionId)
      if (!updated) return { error: "Session not found" }

      return { success: true }
    } catch (error) {
      console.error("ArchiveSpaceAction error:", error)
      return { error: "Failed to archive space" }
    }
  }
)

/** Submit star-rating feedback for a completed session. */
export const SubmitMentorshipFeedbackAction = CreateServerAction(
  true,
  async (sessionId: number, rating: number, comment?: string) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser) return { error: "Unauthorised" }

      if (rating < 1 || rating > 5)
        return { error: "Rating must be between 1 and 5" }

      const session = await GetSessionRequestById(sessionId)
      if (!session) return { error: "Session not found" }
      if (
        session.mentor_id !== authUser.unique_id &&
        session.mentee_id !== authUser.unique_id
      ) {
        return { error: "Unauthorised" }
      }

      const row = await SubmitMentorshipFeedback(
        sessionId,
        authUser.unique_id,
        rating,
        comment
      )
      if (!row) return { error: "Feedback already submitted" }

      return { success: true }
    } catch (error) {
      console.error("SubmitMentorshipFeedbackAction error:", error)
      return { error: "Failed to submit feedback" }
    }
  }
)

/** Mentor suggests alternative slots to the mentee. */
interface SuggestNewSlotPayload {
  requestId: number
  slotIds: string[]
  suggestionMessage?: string
}

export const SuggestNewSlotAction = CreateServerAction(
  true,
  async (payload: SuggestNewSlotPayload) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser) return { error: "Unauthorised" }

      if (!payload.slotIds?.length) {
        return { error: "At least one slot must be provided" }
      }

      const updated = await SuggestSlots(
        payload.requestId,
        authUser.unique_id,
        payload.slotIds,
        payload.suggestionMessage?.trim() || null
      )

      if (!updated) {
        return { error: "Request not found or cannot be updated" }
      }

      await notifySessionSlotSuggested(
        NotificationEvent.SESSION_SLOT_SUGGESTED,
        updated
      )
      await SendMentorSlotSuggestionNotification(updated)

      return { success: true, data: updated }
    } catch (error) {
      console.error("SuggestNewSlotAction error:", error)
      return { error: "Failed to suggest new slot" }
    }
  }
)

/** Mentee picks one of the suggested slots and resubmits the request. */
interface ResubmitSessionRequestPayload {
  requestId: number
  slotId: number
  sessionDate: string
  startTime: string
  endTime: string
}

export const ResubmitSessionRequestAction = CreateServerAction(
  true,
  async (payload: ResubmitSessionRequestPayload) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser) return { error: "Unauthorised" }

      const result = await ResubmitSessionRequest(
        payload.requestId,
        authUser.unique_id,
        payload.slotId,
        payload.sessionDate,
        payload.startTime,
        payload.endTime
      )

      if (!result) {
        return { error: "Request not found or cannot be resubmitted" }
      }

      // Notify mentor that mentee resubmitted
      const menteeName = `${authUser.first_name} ${authUser.last_name}`.trim()
      await SendSystemNotification({
        user_id: authUser.unique_id,
        receivers: [result.mentor_id as string],
        template: {
          title: "Mentee resubmitted a session request",
          body: `${menteeName} selected a new slot for "${result.topic}". Please review and respond.`,
          deep_link: createAbsoluteUrl(`/profile/session-requests`),
          icon: authUser.profile_url || ""
        }
      })

      return { success: true, data: result }
    } catch (error) {
      console.error("ResubmitSessionRequestAction error:", error)
      return { error: "Failed to resubmit session request" }
    }
  }
)
