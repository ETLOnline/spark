import {
  and,
  asc,
  countDistinct,
  eq,
  exists,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  or,
  SQL,
  sql,
  SQLWrapper
} from "drizzle-orm"
import { db } from "../.."
import {
  mentorAvailabilityTable,
  profileTable,
  rolesTable,
  sessionRequestsTable,
  tagsTable,
  userRolesTable,
  userTagsTable,
  usersTable
} from "../../schema"

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

    // Get Mentor role ID
    const mentorRole = await db.query.rolesTable.findFirst({
      where: eq(rolesTable.name, "Mentor"),
      columns: { id: true }
    })

    if (!mentorRole) {
      return {
        mentors: [],
        pagination: { total: 0, page, limit, totalPages: 0 }
      }
    }

    const where = and(
      eq(userRolesTable.role_id, mentorRole.id),
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

    // Mentor <-> profile is one-to-one, but a mentor could in theory hold more
    // than one "Mentor" row in userRolesTable, so group by user id to keep
    // counts and pagination accurate.
    const [mentorRows, totalCountResult] = await Promise.all([
      db
        .select({ user: usersTable, profile: profileTable })
        .from(userRolesTable)
        .innerJoin(usersTable, eq(usersTable.unique_id, userRolesTable.user_id))
        .innerJoin(
          profileTable,
          eq(profileTable.user_id, userRolesTable.user_id)
        )
        .where(where)
        .groupBy(userRolesTable.user_id, usersTable.unique_id, profileTable.id)
        .orderBy(asc(userRolesTable.user_id))
        .limit(limit)
        .offset(offset),
      db
        .select({ value: countDistinct(userRolesTable.user_id) })
        .from(userRolesTable)
        .innerJoin(usersTable, eq(usersTable.unique_id, userRolesTable.user_id))
        .innerJoin(
          profileTable,
          eq(profileTable.user_id, userRolesTable.user_id)
        )
        .where(where)
    ])

    const totalCount = totalCountResult[0]?.value ?? 0
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
}

/**
 * A mentee can only have one *pending* request per exact slot occurrence —
 * once mentor accept/reject exists, a rejected request can be re-requested.
 */
export async function HasPendingSessionRequest(
  menteeId: string,
  availabilitySlotId: number,
  sessionDate: string
) {
  const existing = await db
    .select({ id: sessionRequestsTable.id })
    .from(sessionRequestsTable)
    .where(
      and(
        eq(sessionRequestsTable.mentee_id, menteeId),
        eq(sessionRequestsTable.availability_slot_id, availabilitySlotId),
        eq(sessionRequestsTable.session_date, sessionDate),
        eq(sessionRequestsTable.status, "pending")
      )
    )
    .limit(1)

  return existing.length > 0
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
      description: input.description ?? null
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
