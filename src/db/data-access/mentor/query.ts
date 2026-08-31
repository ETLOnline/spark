import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  ne,
  or,
  SQL,
  sql,
  SQLWrapper
} from "drizzle-orm"
import { db } from "../.."
import { recurrencesOverlap, toMins } from "@/src/utils/time"
import {
  mentorAvailabilityTable,
  mentorshipFeedbackTable,
  profileTable,
  sessionRequestsTable,
  spacesTable,
  SpaceUsersTable,
  tagsTable,
  userRolesTable,
  userTagsTable,
  usersTable
} from "../../schema"
import { permissions } from "@/src/utils/constants"
import { getRoleIdsWithPermission } from "../permissions/query"
import { SearchUserProfile, updateUserProfile } from "../profile/query"

export interface MentorAvailabilitySlotInput {
  date: string
  start_time: string
  end_time: string
  session_type: string
  repeat_type: string
  repeat_end_date?: string | null
}

export async function GetMentorAvailability(mentorId: string) {
  return await db
    .select()
    .from(mentorAvailabilityTable)
    .where(eq(mentorAvailabilityTable.mentor_id, mentorId))
}

/** Recomputes is_mentor_active from the mentor's current profile fields and
 * slot count. A mentor can fill in professional_title/company or set their
 * availability in any order — call this after any write to either so the
 * flag never gets stuck out of sync with whichever field was saved last. */
export async function RecalculateMentorActiveStatus(mentorId: string) {
  const profile = await SearchUserProfile(mentorId)
  const hasTitle = !!profile?.professional_title?.trim()
  const hasCompany = !!profile?.company?.trim()
  const slots = await GetMentorAvailability(mentorId)
  const hasSlots = slots.length > 0

  await updateUserProfile(mentorId, {
    is_mentor_active: hasTitle && hasCompany && hasSlots
  })
}

/** Replace all slots for a mentor atomically (delete + reinsert in one transaction). */
export async function ReplaceMentorAvailability(
  mentorId: string,
  slots: MentorAvailabilitySlotInput[]
) {
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
}

export interface GetMentorFilters {
  page?: number
  limit?: number
  isActive?: boolean
  availabilityFrom?: string
  availabilityTo?: string
  searchedItem?: string
  skills?: string[]
  interests?: string[]
  minRating?: number
  engagementTypes?: string[]
}

// Profile and Users are one-to-one with a mentor, so they're joined directly
// into the main query below instead of via EXISTS. Tags and availability are
// one-to-many, so they stay as EXISTS subqueries to avoid duplicating mentor
// rows when a mentor matches on more than one tag/slot.
const buildExistsCondition = (query: SQLWrapper) => exists(query)

const buildSearchCondition = (searchedItem?: string) => {
  if (!searchedItem?.trim()) return undefined

  const q = `%${searchedItem.trim()}%`

  return or(
    ilike(usersTable.first_name, q),
    ilike(usersTable.last_name, q),
    ilike(
      sql`trim(${usersTable.first_name}) || ' ' || trim(${usersTable.last_name})`,
      q
    ),
    ilike(profileTable.professional_title, q),
    ilike(profileTable.company, q),
    ilike(profileTable.bio, q),
    buildExistsCondition(
      db
        .select({ id: userTagsTable.id })
        .from(userTagsTable)
        .innerJoin(tagsTable, eq(userTagsTable.tag_id, tagsTable.id))
        .where(
          and(
            eq(userTagsTable.user_id, userRolesTable.user_id),
            ilike(tagsTable.name, q)
          )
        )
    )
  )
}

const buildTagCondition = (tagType: "skill" | "interest", tags?: string[]) => {
  if (!tags?.length) return undefined

  return buildExistsCondition(
    db
      .select({ id: userTagsTable.id })
      .from(userTagsTable)
      .innerJoin(tagsTable, eq(userTagsTable.tag_id, tagsTable.id))
      .where(
        and(
          eq(userTagsTable.user_id, userRolesTable.user_id),
          eq(tagsTable.type, tagType),
          inArray(tagsTable.name, tags)
        )
      )
  )
}

const buildAvailabilityCondition = (
  availabilityFrom?: string,
  availabilityTo?: string
) => {
  if (!availabilityFrom && !availabilityTo) return undefined

  const slotStart = sql<string>`${mentorAvailabilityTable.date} || 'T' || ${mentorAvailabilityTable.start_time}`
  const slotEnd = sql<string>`${mentorAvailabilityTable.date} || 'T' || ${mentorAvailabilityTable.end_time}`

  const noneClause = and(
    eq(mentorAvailabilityTable.repeat_type, "none"),
    availabilityFrom ? gte(slotEnd, availabilityFrom) : undefined,
    availabilityTo ? lte(slotStart, availabilityTo) : undefined
  )

  const recurClause = and(
    inArray(mentorAvailabilityTable.repeat_type, ["daily", "weekly"]),
    availabilityFrom ? gte(slotEnd, availabilityFrom) : undefined,
    availabilityTo ? lte(slotStart, availabilityTo) : undefined,
    availabilityFrom
      ? or(
          isNull(mentorAvailabilityTable.repeat_end_date),
          gte(mentorAvailabilityTable.repeat_end_date, availabilityFrom)
        )
      : undefined
  )

  return buildExistsCondition(
    db
      .select({ id: mentorAvailabilityTable.id })
      .from(mentorAvailabilityTable)
      .where(
        and(
          eq(mentorAvailabilityTable.mentor_id, userRolesTable.user_id),
          eq(mentorAvailabilityTable.is_active, true),
          or(noneClause, recurClause)
        )
      )
  )
}

export async function GetMentors(filters?: GetMentorFilters) {
  try {
    const page = filters?.page ?? 1
    const limit = filters?.limit ?? 12
    const offset = (page - 1) * limit

    const roleIds = await getRoleIdsWithPermission(
      "mentorship",
      permissions.mentorship.addAvailability
    )

    if (!roleIds.length) {
      return {
        mentors: [],
        pagination: { total: 0, page, limit, totalPages: 0 }
      }
    }

    const where = and(
      inArray(userRolesTable.role_id, roleIds),
      ...([
        filters?.isActive !== undefined
          ? eq(profileTable.is_mentor_active, filters.isActive)
          : undefined,
        filters?.minRating
          ? sql`${profileTable.total_average_rating}::numeric >= ${filters.minRating}`
          : undefined,
        filters?.engagementTypes?.length
          ? inArray(profileTable.engagement_type, filters.engagementTypes)
          : undefined,
        buildSearchCondition(filters?.searchedItem),
        buildTagCondition("skill", filters?.skills),
        buildTagCondition("interest", filters?.interests),
        buildAvailabilityCondition(
          filters?.availabilityFrom,
          filters?.availabilityTo
        )
      ].filter(Boolean) as SQL[])
    )

    const mentorRows = await db
      .select({
        user: usersTable,
        profile: profileTable,
        totalCount: sql<number>`count(*) over()`
      })
      .from(userRolesTable)
      .innerJoin(usersTable, eq(usersTable.unique_id, userRolesTable.user_id))
      .innerJoin(profileTable, eq(profileTable.user_id, userRolesTable.user_id))
      .where(where)
      .groupBy(userRolesTable.user_id, usersTable.unique_id, profileTable.id)
      .orderBy(asc(userRolesTable.user_id))
      .limit(limit)
      .offset(offset)

    const totalCount = Number(mentorRows[0]?.totalCount ?? 0)
    const userIds = mentorRows.map((row) => row.user.unique_id)

    // userTags is one-to-many, so it's loaded separately for just this page
    // of mentors rather than joined (which would duplicate mentor rows).
    const userTags = userIds.length
      ? await db.query.userTagsTable.findMany({
          where: inArray(userTagsTable.user_id, userIds),
          with: { tag: true }
        })
      : []

    const mentors = mentorRows.map((row) => ({
      ...row.user,
      profile: row.profile,
      completedSessionsCount: row.profile.total_completed_sessions ?? 0,
      userTags: userTags.filter((ut) => ut.user_id === row.user.unique_id)
    }))

    return {
      mentors,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    }
  } catch (err) {
    console.error("GetMentors error:", err)
    throw new Error("Failed to fetch mentors")
  }
}

// ── Session Requests ────────────────────────────────────────────────────────────

export interface CreateSessionRequestInput {
  mentorId: string
  menteeId: string
  availabilitySlotId: number
  sessionDate: string
  startTime: string
  endTime: string
  sessionType: string
  topic: string
  description?: string | null
  repeatType?: string
  repeatEndDate?: string | null
}

/**
 * A mentee can only have one *pending* request per overlapping occurrence —
 * once mentor accept/reject exists, a rejected request can be re-requested.
 *
 * Matches by mentor/recurrence/time overlap rather than availability_slot_id:
 * editing availability replaces every slot row with a fresh id, so an id
 * match would let a mentee silently re-request a slot they already have a
 * pending request against, just because the mentor touched their calendar.
 * Recurrence-aware so an existing recurring request (or a new recurring
 * request) is checked against every occurrence it covers, not just its
 * anchor date.
 */
export async function HasPendingSessionRequest(
  menteeId: string,
  mentorId: string,
  sessionDate: string,
  startMins: number,
  endMins: number,
  repeatType: string = "none",
  repeatEndDate?: string | null
) {
  const existing = await db
    .select({
      session_date: sessionRequestsTable.session_date,
      start_time: sessionRequestsTable.start_time,
      end_time: sessionRequestsTable.end_time,
      repeat_type: sessionRequestsTable.repeat_type,
      repeat_end_date: sessionRequestsTable.repeat_end_date
    })
    .from(sessionRequestsTable)
    .where(
      and(
        eq(sessionRequestsTable.mentee_id, menteeId),
        eq(sessionRequestsTable.mentor_id, mentorId),
        eq(sessionRequestsTable.status, "pending")
      )
    )

  return existing.some(
    (r) =>
      startMins < toMins(r.end_time) &&
      toMins(r.start_time) < endMins &&
      recurrencesOverlap(
        {
          date: r.session_date,
          repeat_type: r.repeat_type,
          repeat_end_date: r.repeat_end_date
        },
        {
          date: sessionDate,
          repeat_type: repeatType,
          repeat_end_date: repeatEndDate
        }
      )
  )
}

export async function CreateSessionRequest(input: CreateSessionRequestInput) {
  const [request] = await db
    .insert(sessionRequestsTable)
    .values({
      mentor_id: input.mentorId,
      mentee_id: input.menteeId,
      availability_slot_id: input.availabilitySlotId,
      session_date: input.sessionDate,
      start_time: input.startTime,
      end_time: input.endTime,
      session_type: input.sessionType,
      topic: input.topic,
      description: input.description ?? null,
      repeat_type: input.repeatType ?? "none",
      repeat_end_date: input.repeatEndDate ?? null
    })
    .returning()

  return request
}

/** All of this mentee's requests toward a specific mentor — used to mark Pending dates on the calendar. */
export async function GetSessionRequestsForMenteeAndMentor(
  menteeId: string,
  mentorId: string
) {
  return await db
    .select()
    .from(sessionRequestsTable)
    .where(
      and(
        eq(sessionRequestsTable.mentee_id, menteeId),
        eq(sessionRequestsTable.mentor_id, mentorId)
      )
    )
}
export async function SuggestSlots(
  requestId: number,
  mentorId: string,
  slotIds: string[], // occurrence keys: "slotId-YYYY-MM-DD"
  message: string | null
) {
  const [updated] = await db
    .update(sessionRequestsTable)
    .set({
      status: "slot_suggested",
      suggested_slot_ids: sql`${JSON.stringify(slotIds)}::jsonb`,
      suggestion_message: message
    })
    .where(
      and(
        eq(sessionRequestsTable.id, requestId),
        eq(sessionRequestsTable.mentor_id, mentorId),
        eq(sessionRequestsTable.status, "pending")
      )
    )
    .returning()
  if (!updated) return null

  return (
    (await db.query.sessionRequestsTable.findFirst({
      where: eq(sessionRequestsTable.id, requestId),
      with: { mentee: true, mentor: true }
    })) ?? null
  )
}

export async function GetSessionRequestsForMentorByStatus(
  mentorId: string,
  status: "pending" | "accepted" | "rejected",
  page = 1,
  limit = 10
) {
  const offset = (page - 1) * limit
  const where = and(
    eq(sessionRequestsTable.mentor_id, mentorId),
    status === "pending"
      ? inArray(sessionRequestsTable.status, ["pending", "resubmitted"])
      : eq(sessionRequestsTable.status, status)
  )

  const [requests, totalCountResult] = await Promise.all([
    db.query.sessionRequestsTable.findMany({
      where,
      orderBy: desc(sessionRequestsTable.created_at),
      limit,
      offset,
      with: {
        mentee: {
          with: { profile: true }
        }
      }
    }),
    db.select({ value: count() }).from(sessionRequestsTable).where(where)
  ])

  const total = totalCountResult[0]?.value ?? 0

  return {
    requests,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export async function GetSessionRequestById(requestId: number) {
  return await db.query.sessionRequestsTable.findFirst({
    where: eq(sessionRequestsTable.id, requestId)
  })
}

export async function UpdateSessionRequestStatus(
  requestId: number,
  status: "accepted" | "rejected",
  spaceId?: string | null,
  rejectReason?: string
) {
  const [request] = await db
    .update(sessionRequestsTable)
    .set({
      status,
      ...(spaceId !== undefined ? { space_id: spaceId } : {}),
      ...(status === "rejected" ? { reject_reason: rejectReason || null } : {})
    })
    .where(eq(sessionRequestsTable.id, requestId))
    .returning()

  return request
}

/** All accepted bookings for a mentor — used to grey out already-booked times
 * on the calendar, and (via the joined space) to link the mentor's session
 * card straight into the workspace created for it, if any. Shown publicly on
 * the mentor's profile, so this must never join mentee PII. */
export async function GetAcceptedSessionRequestsForMentor(mentorId: string) {
  return await db.query.sessionRequestsTable.findMany({
    where: and(
      eq(sessionRequestsTable.mentor_id, mentorId),
      eq(sessionRequestsTable.status, "accepted")
    ),
    with: {
      space: {
        columns: { id: true, space_slug: true }
      }
    }
  })
}

/** A mentor's accepted bookings that fall on one specific date — powers the
 * day-by-day "Booked Slots" navigator. Narrows at the DB level to requests
 * whose recurrence window could possibly cover `date`, then resolves the
 * exact day-of-week match for weekly recurrences in memory, so we never pull
 * (or expand) a mentor's entire booking history just to render a single day. */
export async function GetAcceptedSessionRequestsForMentorOnDate(
  mentorId: string,
  date: string
) {
  const candidates = await db.query.sessionRequestsTable.findMany({
    where: and(
      eq(sessionRequestsTable.mentor_id, mentorId),
      eq(sessionRequestsTable.status, "accepted"),
      // One-time bookings can only ever match `date` exactly; only recurring
      // ones need the open-below range, so a one-time booking from years ago
      // never gets pulled just to be filtered back out below.
      or(
        eq(sessionRequestsTable.session_date, date),
        and(
          ne(sessionRequestsTable.repeat_type, "none"),
          lte(sessionRequestsTable.session_date, date)
        )
      ),
      or(
        isNull(sessionRequestsTable.repeat_end_date),
        gte(sessionRequestsTable.repeat_end_date, date)
      )
    ),
    with: {
      space: {
        columns: { id: true, space_slug: true }
      },
      mentee: true
    }
  })

  return candidates
    .filter((r) =>
      recurrencesOverlap(
        {
          date: r.session_date,
          repeat_type: r.repeat_type,
          repeat_end_date: r.repeat_end_date
        },
        { date, repeat_type: "none" }
      )
    )
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
}

/** A mentee's own accepted bookings across every mentor — used to show their
 * next upcoming session(s) on their own profile. */
export async function GetAcceptedSessionRequestsForMentee(menteeId: string) {
  return await db.query.sessionRequestsTable.findMany({
    where: and(
      eq(sessionRequestsTable.mentee_id, menteeId),
      eq(sessionRequestsTable.status, "accepted")
    ),
    with: {
      mentor: {
        columns: {
          unique_id: true,
          first_name: true,
          last_name: true,
          profile_url: true
        }
      },
      space: {
        columns: { id: true, space_slug: true }
      }
    }
  })
}

/** All pending + resubmitted requests for a mentor — used for calendar badge
 * counts, and (with the mentee join) so the mentor can see whose request
 * they're suggesting an alternative slot for when deleting a booked slot. */
export async function GetPendingSessionRequestsForMentor(mentorId: string) {
  return await db.query.sessionRequestsTable.findMany({
    where: and(
      eq(sessionRequestsTable.mentor_id, mentorId),
      inArray(sessionRequestsTable.status, ["pending", "resubmitted"])
    ),
    with: {
      mentee: {
        columns: {
          unique_id: true,
          first_name: true,
          last_name: true,
          profile_url: true
        }
      }
    }
  })
}

/** True if an accepted booking already overlaps this occurrence for the mentor —
 * recurrence-aware, so an existing accepted recurring booking (or a new
 * recurring request) is checked against every occurrence it covers. */
export async function HasAcceptedOverlap(
  mentorId: string,
  sessionDate: string,
  startMins: number,
  endMins: number,
  repeatType: string = "none",
  repeatEndDate?: string | null,
  sessionType: string = "1:1",
  menteeId?: string
) {
  const isGroup = sessionType === "group"

  const accepted = await db
    .select({
      session_date: sessionRequestsTable.session_date,
      start_time: sessionRequestsTable.start_time,
      end_time: sessionRequestsTable.end_time,
      repeat_type: sessionRequestsTable.repeat_type,
      repeat_end_date: sessionRequestsTable.repeat_end_date
    })
    .from(sessionRequestsTable)
    .where(
      and(
        eq(sessionRequestsTable.mentor_id, mentorId),
        eq(sessionRequestsTable.status, "accepted"),
        ...(isGroup && menteeId
          ? [eq(sessionRequestsTable.mentee_id, menteeId)]
          : [])
      )
    )

  return accepted.some((booking) => {
    const bookedStart = toMins(booking.start_time)
    const bookedEnd = toMins(booking.end_time)
    return (
      startMins < bookedEnd &&
      bookedStart < endMins &&
      recurrencesOverlap(
        {
          date: booking.session_date,
          repeat_type: booking.repeat_type,
          repeat_end_date: booking.repeat_end_date
        },
        {
          date: sessionDate,
          repeat_type: repeatType,
          repeat_end_date: repeatEndDate
        }
      )
    )
  })
}

/**
 * Deletes pending requests that overlap a slot the mentor is removing.
 * Pass `sessionDate` to clear just that one occurrence; omit it to clear
 * every pending request at this time-of-day (deleting the whole series).
 * Accepted requests are never touched — an accepted booking is a commitment
 * regardless of later availability edits.
 */
export async function DeletePendingSessionRequestsForSlot(
  mentorId: string,
  startTime: string,
  endTime: string,
  sessionDate?: string
) {
  const candidates = await db
    .select({
      id: sessionRequestsTable.id,
      start_time: sessionRequestsTable.start_time,
      end_time: sessionRequestsTable.end_time
    })
    .from(sessionRequestsTable)
    .where(
      and(
        eq(sessionRequestsTable.mentor_id, mentorId),
        eq(sessionRequestsTable.status, "pending"),
        sessionDate
          ? eq(sessionRequestsTable.session_date, sessionDate)
          : undefined
      )
    )

  const startMins = toMins(startTime)
  const endMins = toMins(endTime)
  const idsToDelete = candidates
    .filter(
      (r) => startMins < toMins(r.end_time) && toMins(r.start_time) < endMins
    )
    .map((r) => r.id)

  if (idsToDelete.length === 0) return []

  return await db
    .delete(sessionRequestsTable)
    .where(inArray(sessionRequestsTable.id, idsToDelete))
    .returning()
}

// ── Engagements ─────────────────────────────────────────────────────────────────

export async function GetEngagementsForUser(userId: string) {
  const requests = await db.query.sessionRequestsTable.findMany({
    where: and(
      eq(sessionRequestsTable.status, "accepted"),
      or(
        eq(sessionRequestsTable.mentor_id, userId),
        eq(sessionRequestsTable.mentee_id, userId)
      )
    ),
    orderBy: desc(sessionRequestsTable.session_date),
    with: {
      mentor: { with: { profile: true } },
      mentee: { with: { profile: true } },
      space: true
    }
  })

  // A space can have several session_requests rows for the same mentor (e.g.
  // two sessions with the same mentee, or several mentees sharing a space).
  // Archiving happens per row, so a session's *own* is_space_archived can
  // still read false even though the mentor archived the space via another
  // one of its sessions. Resolve the space's real archived state up front so
  // every engagement tied to that space reflects it consistently.
  const spaceIds = [
    ...new Set(
      requests.map((r) => r.space_id).filter((id): id is string => !!id)
    )
  ]

  let archivedSpaceIds = new Set<string>()
  if (spaceIds.length) {
    const archivedRows = await db
      .selectDistinct({ space_id: sessionRequestsTable.space_id })
      .from(sessionRequestsTable)
      .innerJoin(spacesTable, eq(spacesTable.id, sessionRequestsTable.space_id))
      .where(
        and(
          inArray(sessionRequestsTable.space_id, spaceIds),
          eq(sessionRequestsTable.mentor_id, spacesTable.created_by),
          eq(sessionRequestsTable.is_space_archived, true)
        )
      )
    archivedSpaceIds = new Set(
      archivedRows.map((row) => row.space_id).filter((id): id is string => !!id)
    )
  }

  return requests.map((req) => ({
    ...req,
    is_space_archived: req.space_id
      ? archivedSpaceIds.has(req.space_id)
      : req.is_space_archived
  }))
}

/** All session_requests that share the same availability slot, date, AND start time (same group session occurrence). */
export async function GetSessionRequestsBySlot(
  availabilitySlotId: number,
  mentorId: string,
  sessionDate: string,
  startTime: string
) {
  return db
    .select({
      id: sessionRequestsTable.id,
      mentee_id: sessionRequestsTable.mentee_id
    })
    .from(sessionRequestsTable)
    .where(
      and(
        eq(sessionRequestsTable.availability_slot_id, availabilitySlotId),
        eq(sessionRequestsTable.mentor_id, mentorId),
        eq(sessionRequestsTable.session_date, sessionDate),
        eq(sessionRequestsTable.start_time, startTime),
        eq(sessionRequestsTable.session_type, "group"),
        eq(sessionRequestsTable.status, "accepted")
      )
    )
}

/** Batch-confirm a user's attendance across multiple session_request rows (group session). */
export async function ConfirmGroupSessionAttendance(
  sessionIds: number[],
  userId: string
) {
  if (!sessionIds.length) return []
  return Promise.all(
    sessionIds.map((id) => ConfirmSessionAttendance(id, userId))
  )
}

/** Batch-archive is_space_archived across multiple session_request rows (group session). */
export async function ArchiveGroupSessionSpace(sessionIds: number[]) {
  if (!sessionIds.length) return []
  return db
    .update(sessionRequestsTable)
    .set({ is_space_archived: true })
    .where(inArray(sessionRequestsTable.id, sessionIds))
    .returning()
}

async function incrementCompletedSessionsIfNowComplete(
  sessionId: number,
  userId: string
) {
  const session = await db.query.sessionRequestsTable.findFirst({
    where: eq(sessionRequestsTable.id, sessionId),
    columns: { mentor_id: true, attendee_confirmations: true }
  })
  if (!session || session.mentor_id !== userId) return

  const mentorConfirmed = !!(
    session.attendee_confirmations as Record<string, string> | null
  )?.[userId]
  if (!mentorConfirmed) return

  const feedback = await db
    .select({ id: mentorshipFeedbackTable.id })
    .from(mentorshipFeedbackTable)
    .where(
      and(
        eq(mentorshipFeedbackTable.session_request_id, sessionId),
        eq(mentorshipFeedbackTable.submitted_by, userId)
      )
    )
    .limit(1)
  if (feedback.length === 0) return

  await db
    .update(profileTable)
    .set({
      total_completed_sessions: sql`${profileTable.total_completed_sessions} + 1`
    })
    .where(eq(profileTable.user_id, userId))
}

/** Record that a user confirmed they attended a session (jsonb patch). */
export async function ConfirmSessionAttendance(
  sessionId: number,
  userId: string
) {
  const before = await db.query.sessionRequestsTable.findFirst({
    where: eq(sessionRequestsTable.id, sessionId),
    columns: { attendee_confirmations: true }
  })
  const alreadyConfirmed = !!(
    before?.attendee_confirmations as Record<string, string> | null
  )?.[userId]

  const [updated] = await db
    .update(sessionRequestsTable)
    .set({
      attendee_confirmations: sql`jsonb_set(
        COALESCE(${sessionRequestsTable.attendee_confirmations}, '{}'),
        ${`{${userId}}`},
        to_jsonb(now()::text)
      )`
    })
    .where(eq(sessionRequestsTable.id, sessionId))
    .returning()

  if (!alreadyConfirmed) {
    await incrementCompletedSessionsIfNowComplete(sessionId, userId)
  }

  return updated
}

/** Insert a feedback row. Returns null if this user already submitted for this session. */
export async function SubmitMentorshipFeedback(
  sessionId: number,
  userId: string,
  recipientId: string | null,
  rating: number,
  comment?: string,
  visibility: "public" | "private" = "public"
) {
  const existing = await db
    .select({ id: mentorshipFeedbackTable.id })
    .from(mentorshipFeedbackTable)
    .where(
      and(
        eq(mentorshipFeedbackTable.session_request_id, sessionId),
        eq(mentorshipFeedbackTable.submitted_by, userId)
      )
    )
    .limit(1)

  if (existing.length > 0) return null

  const [row] = await db
    .insert(mentorshipFeedbackTable)
    .values({
      session_request_id: sessionId,
      submitted_by: userId,
      recipient_id: recipientId,
      rating,
      comment: comment?.trim() || null,
      visibility
    })
    .returning()

  if (row) {
    await incrementCompletedSessionsIfNowComplete(sessionId, userId)
  }

  return row
}

/** Return all feedback for a session that the viewer is allowed to see.
 *
 * Visibility rules:
 *  - A user always sees their own submitted feedback.
 *  - recipient_id = null means mentor's group-wide feedback → visible to all participants.
 *  - viewer is the recipient → always visible.
 *  - visibility = 'public' in a 1:1 → both parties see each other's feedback.
 *  - In a group session, mentees never see other mentees' feedback.
 */
export async function GetFeedbackForSession(
  sessionId: number,
  viewerId: string,
  mentorId: string,
  sessionType: string
) {
  const rows = await db.query.mentorshipFeedbackTable.findMany({
    where: eq(mentorshipFeedbackTable.session_request_id, sessionId),
    with: {
      submittedBy: {
        with: { profile: true }
      }
    }
  })

  return rows
    .filter((row) => {
      // Never show a user their own submitted feedback
      if (row.submitted_by === viewerId) return false
      // Show feedback explicitly addressed to the viewer
      if (row.recipient_id === viewerId) return true
      // Group-wide mentor feedback (null recipient): visible to mentees only, not back to the mentor
      if (
        row.recipient_id === null &&
        row.submitted_by === mentorId &&
        row.submitted_by !== viewerId &&
        sessionType === "group"
      )
        return true
      return false
    })
    .map((row) => ({
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      visibility: row.visibility,
      submitted_by: row.submitted_by,
      recipient_id: row.recipient_id,
      created_at: row.created_at,
      first_name: row.submittedBy?.first_name ?? null,
      last_name: row.submittedBy?.last_name ?? null,
      profile_url: row.submittedBy?.profile_url ?? null,
      professional_title: row.submittedBy?.profile?.professional_title ?? null
    }))
}

/** Returns a map of sessionRequestId → [user_ids who submitted feedback].
 *  Used to derive feedbackSubmittedByViewer / feedbackSubmittedByCounterpart. */
export async function GetFeedbackSubmittersForSessions(
  sessionIds: number[]
): Promise<Record<number, string[]>> {
  if (!sessionIds.length) return {}

  const rows = await db
    .select({
      session_request_id: mentorshipFeedbackTable.session_request_id,
      submitted_by: mentorshipFeedbackTable.submitted_by
    })
    .from(mentorshipFeedbackTable)
    .where(inArray(mentorshipFeedbackTable.session_request_id, sessionIds))

  const map: Record<number, string[]> = {}
  for (const row of rows) {
    if (!map[row.session_request_id]) map[row.session_request_id] = []
    map[row.session_request_id].push(row.submitted_by)
  }
  return map
}

export async function ArchiveSessionSpace(sessionId: number) {
  const [updated] = await db
    .update(sessionRequestsTable)
    .set({ is_space_archived: true })
    .where(eq(sessionRequestsTable.id, sessionId))
    .returning()
  return updated
}

export type SpaceBasic = {
  id: string
  space_name: string
  space_slug: string
  created_by: string
}

export async function GetSharedSpacesForSessions(
  pairs: Array<{ sessionId: number; mentorId: string; menteeId: string }>
): Promise<Record<number, SpaceBasic | null>> {
  if (!pairs.length) return {}

  const menteeIds = [...new Set(pairs.map((p) => p.menteeId))]

  // Step 1 — which space IDs is each mentee an active member of?
  const memberRows = await db
    .select({
      space_id: SpaceUsersTable.space_id,
      user_id: SpaceUsersTable.user_id
    })
    .from(SpaceUsersTable)
    .where(
      and(
        inArray(SpaceUsersTable.user_id, menteeIds),
        eq(SpaceUsersTable.status, "active")
      )
    )

  const menteeToSpaceIds: Record<string, string[]> = {}
  for (const row of memberRows) {
    if (!menteeToSpaceIds[row.user_id]) menteeToSpaceIds[row.user_id] = []
    menteeToSpaceIds[row.user_id].push(row.space_id)
  }

  const allSpaceIds = [...new Set(Object.values(menteeToSpaceIds).flat())]
  if (!allSpaceIds.length) {
    return Object.fromEntries(pairs.map((p) => [p.sessionId, null]))
  }

  // Step 2 — fetch those independent spaces
  const spaces = await db
    .select({
      id: spacesTable.id,
      space_name: spacesTable.space_name,
      space_slug: spacesTable.space_slug,
      created_by: spacesTable.created_by
    })
    .from(spacesTable)
    .where(
      and(inArray(spacesTable.id, allSpaceIds), isNull(spacesTable.channel_id))
    )

  // Step 3 — match each session pair to its space
  const result: Record<number, SpaceBasic | null> = {}
  for (const pair of pairs) {
    const menteeMemberIds = menteeToSpaceIds[pair.menteeId] ?? []
    const space =
      spaces.find(
        (s) => s.created_by === pair.mentorId && menteeMemberIds.includes(s.id)
      ) ?? null
    result[pair.sessionId] = space
  }
  return result
}

export async function ResubmitSessionRequest(
  requestId: number,
  menteeId: string,
  slotId: number,
  sessionDate: string,
  startTime: string,
  endTime: string
): Promise<Record<string, unknown> | null> {
  const [result] = await db
    .update(sessionRequestsTable)
    .set({
      status: "resubmitted",
      availability_slot_id: slotId,
      session_date: sessionDate,
      start_time: startTime,
      end_time: endTime,
      suggested_slot_ids: null,
      suggestion_message: null
    })
    .where(
      and(
        eq(sessionRequestsTable.id, requestId),
        eq(sessionRequestsTable.mentee_id, menteeId),
        eq(sessionRequestsTable.status, "slot_suggested")
      )
    )
    .returning({
      id: sessionRequestsTable.id,
      mentor_id: sessionRequestsTable.mentor_id,
      topic: sessionRequestsTable.topic
    })

  if (!result) return null
  return result
}
