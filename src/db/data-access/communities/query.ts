import { db } from "../.."
import {
  communitiesTable,
  InsertCommunity,
  SelectCommunity,
  communityUsersTable,
  channelsTable,
  SelectCommunityUser,
  SelectChannel,
  ChannelUsersTable,
  communityCategoriesTable,
  SelectCommunityCategory,
  SelectUser,
  leaderboardSnapshotsTable,
  InsertLeaderboardSnapshot,
  SelectLeaderboardSnapshot,
  pointLedgerTable
} from "../../schema"
import {
  eq,
  or,
  sql,
  count,
  SQLWrapper,
  SQL,
  and,
  ilike,
  ne,
  inArray,
  desc,
  max
} from "drizzle-orm"

export type CommunityType = "public" | "private" | "restricted"
export type SortByOptions =
  | "newest"
  | "oldest"
  | "membersCount"
  | "channelsCount"
  | "activeToday"
  | "titleAsc"
  | "titleDesc"

export interface CommunityQueryFilters {
  searchTerm?: string
  communityCategory?: string
  sortBy?: SortByOptions
  createdByUserId?: string
  type?: "all" | "joined"
}

export type CommunityWithRelations = SelectCommunity & {
  communityMembers: SelectCommunityUser[]
  channels: SelectChannel[]
  category: SelectCommunityCategory
}

/**
 * Retrieves a list of communities based on various filters, with pagination.
 * Includes related data like member count and channel count.
 */
export async function GetCommunities(
  authUser: SelectUser,
  filters?: CommunityQueryFilters,
  page: number = 1,
  limit: number = 6
): Promise<{
  communities: CommunityWithRelations[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
  joinedCount: number
}> {
  const {
    searchTerm,
    communityCategory,
    sortBy = "newest",
    createdByUserId,
    type
  } = filters || {}
  const offset = (page - 1) * limit
  const whereClause: (SQLWrapper | SQL)[] = []
  if (searchTerm) {
    whereClause.push(sql`(${ilike(communitiesTable.title, `%${searchTerm}%`)})`)
  }
  if (communityCategory && communityCategory !== "all") {
    whereClause.push(eq(communitiesTable.category_id, communityCategory))
  }
  if (createdByUserId) {
    whereClause.push(eq(communitiesTable.created_by, createdByUserId))
  }

  if (type === "joined" && authUser?.unique_id) {
    const joinedCommunityIds = await db
      .select({ community_id: communityUsersTable.community_id })
      .from(communityUsersTable)
      .where(eq(communityUsersTable.user_id, authUser.unique_id))

    const ids = joinedCommunityIds.map((row) => row.community_id)

    if (ids.length === 0) {
      const joinedCount = 0
      return {
        communities: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
        joinedCount
      }
    } else {
      whereClause.push(inArray(communitiesTable.id, ids))
    }
  }
  let orderByClause: SQL<unknown>
  switch (sortBy) {
    case "titleAsc":
      orderByClause = sql`${communitiesTable.title} asc`
      break
    case "titleDesc":
      orderByClause = sql`${communitiesTable.title} desc`
      break
    case "oldest":
      orderByClause = sql`${communitiesTable.created_at} asc`
      break
    case "membersCount":
    case "channelsCount":
    case "activeToday":
    default:
      orderByClause = sql`${communitiesTable.created_at} desc`
  }

  try {
    const communitiesPromise = db.query.communitiesTable.findMany({
      where: and(...whereClause),
      limit: limit,
      offset: offset,
      orderBy: orderByClause,
      with: {
        communityMembers: true,
        channels: true,
        category: true
      }
    }) as Promise<CommunityWithRelations[]>

    const totalCountPromise = db
      .select({ count: count() })
      .from(communitiesTable)
      .where(and(...whereClause))

    const joinedCountPromise = db
      .select({ count: count() })
      .from(communityUsersTable)
      .where(eq(communityUsersTable.user_id, authUser.unique_id))

    const [communities, totalResult, joinedCountResult] = await Promise.all([
      communitiesPromise,
      totalCountPromise,
      joinedCountPromise
    ])

    const total = totalResult[0].count
    const totalPages = Math.ceil(total / limit)
    const joinedCount = joinedCountResult[0].count

    return {
      communities,
      pagination: {
        total,
        page,
        limit,
        totalPages
      },
      joinedCount
    }
  } catch (e: any) {
    console.error("Error fetching communities:", e)
    throw new Error(`Failed to retrieve communities: ${e.message}`)
  }
}

/**
 * Creates a new community in the database.
 */
export async function CreateCommunity(
  communityData: InsertCommunity
): Promise<SelectCommunity> {
  try {
    const newCommunity = await db
      .insert(communitiesTable)
      .values(communityData)
      .returning()

    if (!newCommunity[0]) {
      throw new Error(
        "Failed to create community: No record returned after insertion."
      )
    }

    return newCommunity[0]
  } catch (e: any) {
    console.log("Error creating community", e)
    console.error("Error creating community:", e)
    throw new Error(`Failed to create community: ${e.message}`)
  }
}

/**
 * Checks if a given community slug is available (not already in use).
 */
export async function IsCommunitySlugAvailable(
  slug: string,
  communityId?: string
): Promise<boolean> {
  try {
    let whereClause: SQL<boolean> | undefined
    if (communityId) {
      whereClause = and(
        eq(communitiesTable.slug, slug),
        ne(communitiesTable.id, communityId)
      ) as SQL<boolean>
    } else {
      whereClause = eq(communitiesTable.slug, slug) as SQL<boolean>
    }

    const searchedCount = await db.$count(communitiesTable, whereClause)

    return searchedCount === 0
  } catch (e: any) {
    console.error("Error checking community slug availability:", e)
    throw new Error(`Failed to check slug availability: ${e.message}`)
  }
}

/**
 * Updates an existing community in the database.
 * @param communityId The ID of the community to update.
 * @param communityData The data to update. Note: `id` and `created_by` cannot be updated this way.
 */
export async function UpdateCommunity(
  communityId: string,
  communityData: Partial<InsertCommunity>
): Promise<SelectCommunity> {
  try {
    const { id, created_by, ...updatableData } = communityData

    const updatedCommunity = await db
      .update(communitiesTable)
      .set(updatableData)
      .where(eq(communitiesTable.id, communityId))
      .returning()

    if (!updatedCommunity[0]) {
      throw new Error(
        `Failed to update community with ID ${communityId}: No record found or updated.`
      )
    }

    return updatedCommunity[0]
  } catch (e: any) {
    console.error(`Error updating community with ID ${communityId}:`, e)
    throw new Error(`Failed to update community: ${e.message}`)
  }
}

/**
 * Deletes a community from the database.
 * @param communityId The ID of the community to delete.
 * @returns A promise that resolves to the deleted community, or throws an error if not found/deleted.
 */
export async function DeleteCommunity(
  communityId: string
): Promise<SelectCommunity> {
  try {
    await db
      .delete(communityUsersTable)
      .where(eq(communityUsersTable.community_id, communityId))

    const deletedCommunity = await db
      .delete(communitiesTable)
      .where(eq(communitiesTable.id, communityId))
      .returning()

    if (!deletedCommunity[0]) {
      throw new Error(
        `Failed to delete community with ID ${communityId}: Community not found.`
      )
    }

    return deletedCommunity[0]
  } catch (e: any) {
    console.error(`Error deleting community with ID ${communityId}:`, e)
    throw new Error(`Failed to delete community: ${e.message}`)
  }
}

// Define a type for the enriched community data, matching what the query will return
export type CommunityDetailData = {
  id: string
  title: string
  description: string
  cover_image: string
  category: string
  slug: string
  type: "public" | "private"
  created_at: Date | null
  totalMembers: number
  onlineNow: number
  totalMessages: number
  owner: {
    id: string
    firstName: string
    lastName: string
    fullName: string
  }
  users: {
    id: string
    community_id: string
    user_id: string
  }[]
}

export async function GetCommunityBySlug(
  communitySlug: string
): Promise<CommunityDetailData | null> {
  try {
    const communityDetails = await db.query.communitiesTable.findFirst({
      where: eq(communitiesTable.slug, communitySlug),
      with: {
        creator: {
          columns: {
            unique_id: true,
            first_name: true,
            last_name: true
          }
        },
        category: {
          columns: {
            name: true
          }
        },
        communityMembers: true
      }
    })

    if (!communityDetails) {
      return null
    }
    const categoryName = communityDetails.category?.name || ""
    const totalCommunityMembers =
      communityDetails?.communityMembers?.length || 0

    const totalMessages = 0

    const createdAtDate = communityDetails.created_at
      ? new Date(communityDetails.created_at)
      : null

    const finalCommunityData: CommunityDetailData = {
      id: communityDetails.id,
      title: communityDetails.title,
      description: communityDetails.description || "",
      cover_image: communityDetails.cover_image || "",
      category: categoryName,
      slug: communityDetails.slug,
      type:
        communityDetails.type === "public" ||
        communityDetails.type === "private"
          ? communityDetails.type
          : "public",
      created_at: createdAtDate,
      totalMembers: totalCommunityMembers,
      onlineNow: 0, // Still hardcoded
      totalMessages: totalMessages,
      owner: {
        id: communityDetails.creator?.unique_id || "",
        firstName: communityDetails.creator?.first_name || "Unknown",
        lastName: communityDetails.creator?.last_name || "",
        fullName:
          `${communityDetails.creator?.first_name || "Unknown"} ${communityDetails.creator?.last_name || ""}`.trim()
      },
      users: communityDetails.communityMembers
    }

    return finalCommunityData
  } catch (e: any) {
    console.error("Error in GetCommunityById:", e)
    throw new Error(`Failed to retrieve community: ${e.message}`)
  }
}

export interface CommunityCategory {
  id: string
  name: string
}

export async function getCategories(): Promise<CommunityCategory[]> {
  try {
    const categories = await db
      .select({
        id: communityCategoriesTable.id,
        name: communityCategoriesTable.name
      })
      .from(communityCategoriesTable)

    return categories ?? []
  } catch (error) {
    console.error("Error fetching categories:", error)
    throw new Error("Failed to fetch categories")
  }
}

export async function getCommunityUsers(communityId: string) {
  try {
    const communityUsers = await db.query.communityUsersTable.findMany({
      where: eq(communityUsersTable.community_id, communityId),
      with: {
        user: {
          with: {
            roles: {
              with: {
                role: true
              }
            }
          }
        }
      }
    })
    return communityUsers
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function attachCommunityUser(
  communityId: string,
  userId: string,
  user_role?: string
) {
  try {
    const existingCommunityUser = await db
      .select()
      .from(communityUsersTable)
      .where(
        and(
          eq(communityUsersTable.community_id, communityId),
          eq(communityUsersTable.user_id, userId)
        )
      )
      .limit(1)

    if (existingCommunityUser.length > 0) {
      console.log(
        `User ${userId} already exists in community ${communityId}. Returning existing record.`
      )
      return existingCommunityUser[0]
    }

    const newCommunityUser = await db
      .insert(communityUsersTable)
      .values({
        community_id: communityId,
        user_id: userId,
        role: user_role
      })
      .returning()

    if (newCommunityUser.length > 0) {
      return newCommunityUser[0]
    } else {
      throw new Error(
        "Failed to attach community user: No record returned after insertion."
      )
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetCommunityById(
  communityId: string,
  withCommunityUsers?: boolean
) {
  try {
    const community = await db.query.communitiesTable.findFirst({
      where: eq(communitiesTable.id, communityId),
      with: {
        communityMembers: withCommunityUsers
          ? {
              with: {
                user: true
              }
            }
          : undefined
      }
    })
    return community
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function updateCommunityUser(
  communityId: string,
  userId: string,
  updatedData: Partial<SelectCommunityUser>
) {
  try {
    const communityUser = await db
      .update(communityUsersTable)
      .set(updatedData)
      .where(
        and(
          eq(communityUsersTable.community_id, communityId),
          eq(communityUsersTable.user_id, userId)
        )
      )
      .returning()
    return communityUser[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}
export async function detachCommunityUser(communityId: string, userId: string) {
  try {
    const deleted = await db
      .delete(communityUsersTable)
      .where(
        and(
          eq(communityUsersTable.community_id, communityId),
          eq(communityUsersTable.user_id, userId)
        )
      )
      .returning()
    return deleted[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const getCommunitiesByIds = async function (communityIds: string[]) {
  try {
    const communities = await db.query.communitiesTable.findMany({
      where: inArray(communitiesTable.id, communityIds),
      with: {
        category: true,
        communityMembers: true,
        channels: true
      }
    })
    return communities
  } catch (error) {
    console.error("Error fetching communities:", error)
    throw new Error("Failed to fetch communities")
  }
}

/**
 * Get leaderboard snapshot for a community (top N users)
 * Gets the most recent snapshot for the given date
 */
export async function getCommunityLeaderboard(
  communityId: string,
  limit: number = 10,
  offset: number = 0
) {
  const [data, totalResult] = await Promise.all([
    db.query.leaderboardSnapshotsTable.findMany({
      where: eq(leaderboardSnapshotsTable.community_id, communityId),
      with: { user: true },
      columns: {
        user_id: true,
        rank: true,
        points: true,
        points_gained: true,
        trend: true,
        rank_change: true,
        snapshot_date: true
      },
      orderBy: desc(leaderboardSnapshotsTable.points),
      limit,
      offset
    }),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(leaderboardSnapshotsTable)
      .where(eq(leaderboardSnapshotsTable.community_id, communityId))
  ])

  return { data, total: Number(totalResult[0]?.count ?? 0) }
}

/**
 * Get current user's rank in a community
 * Gets the most recent snapshot for the given date
 */
export async function getCurrentUserRank(userId: string, communityId: string) {
  const result = await db.query.leaderboardSnapshotsTable.findFirst({
    where: and(
      eq(leaderboardSnapshotsTable.community_id, communityId),
      eq(leaderboardSnapshotsTable.user_id, userId)
    ),
    columns: {
      user_id: true,
      rank: true,
      points: true,
      points_gained: true,
      trend: true,
      rank_change: true,
      snapshot_date: true
    },
    with: { user: true }
  })

  return result ?? null
}
/**
 * Get all communities user is a member of
 */
export async function getUserCommunitiesWithRanking(userId: string) {
  try {
    const [joinedRows, rankedRows] = await Promise.all([
      db
        .select({ community_id: communityUsersTable.community_id })
        .from(communityUsersTable)
        .where(eq(communityUsersTable.user_id, userId)),
      db
        .selectDistinct({
          community_id: leaderboardSnapshotsTable.community_id
        })
        .from(leaderboardSnapshotsTable)
        .where(eq(leaderboardSnapshotsTable.user_id, userId))
    ])
    const allIds = [
      ...new Set([
        ...joinedRows.map((r) => r.community_id),
        ...rankedRows.map((r) => r.community_id)
      ])
    ]

    if (allIds.length === 0) return []
    return db.query.communitiesTable.findMany({
      where: inArray(communitiesTable.id, allIds),
      with: { category: true }
    })
  } catch (error: any) {
    console.error("Error fetching user communities with ranking:", error)
    throw new Error(`Failed to fetch communities: ${error.message}`)
  }
}

export async function getCommunityLedgerTotals(communityId: string) {
  return db
    .select({
      user_id: pointLedgerTable.user_id,
      reward_id: pointLedgerTable.reward_id,
      total_points: sql<number>`CAST(SUM(${pointLedgerTable.amount}) AS INTEGER)`
    })
    .from(pointLedgerTable)
    .where(sql`${pointLedgerTable.metadata}->>'community_id' = ${communityId}`)
    .groupBy(pointLedgerTable.user_id, pointLedgerTable.reward_id)
    .orderBy(sql`SUM(${pointLedgerTable.amount}) DESC`)
}

export async function replaceLeaderboardSnapshots(
  communityId: string,
  snapshots: InsertLeaderboardSnapshot[]
) {
  return db.transaction(async (tx) => {
    await tx
      .delete(leaderboardSnapshotsTable)
      .where(eq(leaderboardSnapshotsTable.community_id, communityId))

    if (snapshots.length === 0) return []

    return tx.insert(leaderboardSnapshotsTable).values(snapshots).returning()
  })
}

export async function getUserTopCommunityRank(userId: string) {
  const result = await db
    .select({
      rank: leaderboardSnapshotsTable.rank,
      points: leaderboardSnapshotsTable.points,
      community_id: leaderboardSnapshotsTable.community_id,
      community_title: communitiesTable.title
    })
    .from(leaderboardSnapshotsTable)
    .innerJoin(
      communitiesTable,
      eq(leaderboardSnapshotsTable.community_id, communitiesTable.id)
    )
    .where(eq(leaderboardSnapshotsTable.user_id, userId))
    .orderBy(leaderboardSnapshotsTable.rank)
    .limit(1)

  return result[0] ?? null
}
