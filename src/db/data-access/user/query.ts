import {
  and,
  asc,
  count,
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
  InsertUser,
  mentorAvailabilityTable,
  profileTable,
  rolesTable,
  SelectUser,
  tagsTable,
  userContactsTable,
  userRolesTable,
  userTagsTable,
  usersTable
} from "../../schema"

export interface GetUserFilters {
  userId?: string
  userIds?: string[]
  email?: string
}

export async function CreateUser(data: InsertUser) {
  await db.insert(usersTable).values(data)
}

export async function SelectUserByExternalId(id: string) {
  const user = await db.query.usersTable.findFirst({
    columns: {
      first_name: true,
      last_name: true,
      email: true,
      external_auth_id: true,
      profile_url: true,
      cover_image: true,
      unique_id: true,
      role: true,
      meta_profile: true
    },
    where: eq(usersTable.external_auth_id, id),
    with: {
      roles: {
        with: {
          role: true
        }
      },
      profile: true,
      certificates: true
    }
  })

  return user
}

export async function SelectUserByEmail(email: string) {
  return await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email)
  })
}

export async function SelectUserByUniqueId(unique_id: string) {
  return await db.query.usersTable.findFirst({
    where: eq(usersTable.unique_id, unique_id),
    with: {
      profile: true,
      roles: {
        with: {
          role: true
        }
      }
    }
  })
}

export async function FindUserWildCard(wildcard: string) {
  try {
    const users = await db.query.usersTable.findMany({
      columns: {
        first_name: true,
        last_name: true,
        email: true,
        external_auth_id: true,
        profile_url: true,
        cover_image: true,
        unique_id: true,
        role: true,
        meta_profile: true
      },
      with: {
        roles: {
          with: {
            role: true
          }
        }
      },
      where: (usersTable, { or }) =>
        or(
          ilike(
            sql`${usersTable.first_name} || ' ' || ${usersTable.last_name}`,
            `%${wildcard}%`
          )
        )
    })
    return users
  } catch (error: any) {
    throw new Error(error.message as string)
  }
}

export const GetUserProfileData = async (userId: string) => {
  const result = await db.query.usersTable.findFirst({
    where: eq(usersTable.unique_id, userId),
    with: {
      userActivities: {
        with: {
          activity: true
        }
      },
      userRewards: {
        with: {
          reward: true
        }
      },
      userTags: {
        with: {
          tag: true
        }
      },
      recommendations: {
        with: {
          recommender: {
            columns: {
              first_name: true,
              last_name: true
            }
          }
        }
      }
    }
  })
  return {
    recommendations: result?.recommendations || [],
    activities: result?.userActivities.map((ua) => ua.activity) || [],
    rewards: result?.userRewards.map((ur) => ur.reward) || [],
    tags: result?.userTags.map((ut) => ut.tag) || []
  }
}

export const UpdateUserProfilePicture = async (
  userId: string,
  profileUrl: string
) => {
  try {
    const updatedUser = await db
      .update(usersTable)
      .set({
        profile_url: profileUrl
      })
      .where(eq(usersTable.unique_id, userId))
      .returning()

    return updatedUser[0]
  } catch (error: any) {
    console.error("Error updating user profile picture:", error)
    throw new Error(error.message || "Failed to update user profile picture")
  }
}

export async function getUserContacts(currentUserId: string) {
  return await db
    .select({
      unique_id: usersTable.unique_id,
      first_name: usersTable.first_name,
      last_name: usersTable.last_name,
      email: usersTable.email,
      external_auth_id: usersTable.external_auth_id,
      profile_url: usersTable.profile_url,
      role: usersTable.role,
      meta_profile: usersTable.meta_profile
    })
    .from(userContactsTable)
    .innerJoin(
      usersTable,
      eq(usersTable.unique_id, userContactsTable.contact_id)
    )
    .where(eq(userContactsTable.user_id, currentUserId))
}

export async function GetRandomUsers() {
  try {
    const roles = await db.query.rolesTable.findMany({
      where: eq(rolesTable.role_type, "GLOBAL")
    })

    const usersRole = await db.query.userRolesTable.findMany({
      where: inArray(
        userRolesTable.role_id,
        roles.map((r) => r.id)
      ),
      limit: 3,
      orderBy: sql`RANDOM()`
    })

    const user_ids = usersRole.map((ur) => ur.user_id)

    const users = await db.query.usersTable.findMany({
      where: inArray(usersTable.unique_id, user_ids),
      with: {
        roles: {
          with: {
            role: true
          }
        }
      }
    })

    return users
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function UpdateUserName(
  user_id: string,
  firstName: string,
  lastName: string
) {
  try {
    const result = await db
      .update(usersTable)
      .set({
        first_name: firstName,
        last_name: lastName
      })
      .where(eq(usersTable.unique_id, user_id))
      .returning()

    return result[0]
  } catch (error: any) {
    throw new Error(error.message)
  }
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

const buildExistsCondition = (query: SQLWrapper) => exists(query)

const buildMentorRoleCondition = (mentorRoleId: number) =>
  eq(userRolesTable.role_id, mentorRoleId)

const buildActiveMentorCondition = (isActive?: boolean) => {
  if (!isActive) return undefined

  return buildExistsCondition(
    db
      .select({ id: profileTable.user_id })
      .from(profileTable)
      .where(
        and(
          eq(profileTable.user_id, userRolesTable.user_id),
          eq(profileTable.is_mentor_active, true)
        )
      )
  )
}

const buildSearchMentorCondition = (searchedItem?: string) => {
  if (!searchedItem?.trim()) return undefined

  const q = `%${searchedItem.trim()}%`

  return or(
    buildExistsCondition(
      db
        .select({ id: usersTable.unique_id })
        .from(usersTable)
        .where(
          and(
            eq(usersTable.unique_id, userRolesTable.user_id),
            or(ilike(usersTable.first_name, q), ilike(usersTable.last_name, q))
          )
        )
    ),
    buildExistsCondition(
      db
        .select({ id: profileTable.id })
        .from(profileTable)
        .where(
          and(
            eq(profileTable.user_id, userRolesTable.user_id),
            or(
              ilike(profileTable.professional_title, q),
              ilike(profileTable.company, q),
              ilike(profileTable.bio, q)
            )
          )
        )
    )
  )
}

const buildRatingCondition = (minRating?: number) => {
  if (!minRating) return undefined

  return buildExistsCondition(
    db
      .select({ id: profileTable.id })
      .from(profileTable)
      .where(
        and(
          eq(profileTable.user_id, userRolesTable.user_id),
          sql`${profileTable.total_average_rating}::numeric >= ${minRating}`
        )
      )
  )
}

const buildEngagementTypeCondition = (engagementTypes?: string[]) => {
  if (!engagementTypes?.length) return undefined

  return buildExistsCondition(
    db
      .select({ id: profileTable.id })
      .from(profileTable)
      .where(
        and(
          eq(profileTable.user_id, userRolesTable.user_id),
          inArray(profileTable.engagement_type, engagementTypes)
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
      buildMentorRoleCondition(mentorRole.id),
      ...([
        buildActiveMentorCondition(filters?.isActive),
        buildSearchMentorCondition(filters?.searchedItem),
        buildRatingCondition(filters?.minRating),
        buildEngagementTypeCondition(filters?.engagementTypes),
        buildTagCondition("skill", filters?.skills),
        buildTagCondition("interest", filters?.interests),
        buildAvailabilityCondition(
          filters?.availabilityFrom,
          filters?.availabilityTo
        )
      ].filter(Boolean) as SQL[])
    )

    const [filteredUserIds, [{ value: totalCount }]] = await Promise.all([
      db
        .select({ userId: userRolesTable.user_id })
        .from(userRolesTable)
        .where(where)
        .orderBy(asc(userRolesTable.user_id))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(userRolesTable).where(where)
    ])

    const userIds = filteredUserIds.map((r) => r.userId)

    const mentors =
      userIds.length > 0
        ? await db.query.usersTable.findMany({
            where: inArray(usersTable.unique_id, userIds),
            orderBy: asc(usersTable.unique_id),
            with: {
              profile: true,
              userTags: {
                with: {
                  tag: true
                }
              }
            }
          })
        : []

    return {
      mentors,
      pagination: {
        total: Number(totalCount) || 0,
        page,
        limit,
        totalPages: Math.ceil((Number(totalCount) || 0) / limit)
      }
    }
  } catch (err) {
    console.error("GetMentors error:", err)
    throw new Error("Failed to fetch mentors")
  }
}

export async function GetFeaturedUsers(filters: GetUserFilters) {
  try {
    const whereClause: (SQLWrapper | SQL)[] = []

    if (filters.userId) {
      whereClause.push(eq(usersTable.unique_id, filters.userId))
    }

    if (filters.userIds && filters.userIds.length > 0) {
      whereClause.push(inArray(usersTable.unique_id, filters.userIds))
    }

    if (filters.email) {
      whereClause.push(ilike(usersTable.email, `%${filters.email}%`))
    }

    const users = await db.query.usersTable.findMany({
      where: and(...whereClause),
      with: {
        roles: {
          with: {
            role: true
          }
        },
        profile: true,
        userTags: {
          with: {
            tag: true
          }
        }
      }
    })

    return users
  } catch (error: any) {
    console.error("Error fetching user:", error)
    throw new Error("Failed to fetch user")
  }
}

export async function UpdateCoverImage(
  userId: string,
  coverUrl: string | null
) {
  try {
    const updatedUser = await db
      .update(usersTable)
      .set({
        cover_image: coverUrl
      })
      .where(eq(usersTable.unique_id, userId))
      .returning()

    return updatedUser[0]
  } catch (error: any) {
    console.error("Error updating user profile picture:", error)
    throw new Error(error.message || "Failed to update user profile picture")
  }
}

export async function getBulkUsers(unique_ids: string[]) {
  return await db.query.usersTable.findMany({
    where: inArray(usersTable.unique_id, unique_ids)
  })
}

export async function getSuperAdmins() {
  try {
    const superAdmins = await db.query.userRolesTable.findMany({
      with: {
        user: true,
        role: { columns: { id: true, name: true } }
      }
    })

    const filtered = superAdmins.filter(
      (entry) => entry.role.name === "Super_Admin"
    )

    if (filtered.length === 0) {
      throw new Error("Super Admin role not found")
    }

    return filtered.map((entry) => entry.user) ?? []
  } catch (error: any) {
    console.error("Error fetching super admins:", error.message)
    throw new Error("Failed to fetch super admins")
  }
}
