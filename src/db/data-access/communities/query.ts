// src/db/data-access/communities/query.ts

import { db } from "../.."
import {
  communitiesTable,
  InsertCommunity,
  SelectCommunity,
  communityUsersTable,
  channelsTable,
  SelectCommunityUser, // Make sure to import this
  SelectChannel // Make sure to import this
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
  ne
} from "drizzle-orm"

// 1. Define CommunityType
export type CommunityType = "public" | "private" | "restricted"

// 2. Define SortByOptions
export type SortByOptions =
  | "newest"
  | "oldest"
  | "membersCount"
  | "channelsCount"
  | "activeToday"
  | "titleAsc"
  | "titleDesc"

// 3. Update CommunityQueryFilters to use these types
export interface CommunityQueryFilters {
  searchTerm?: string
  communityCategory?: string
  sortBy?: SortByOptions
  page?: number
  limit?: number
  createdByUserId?: string
}

// *** NEW: Define a type for a community object that includes its relations ***
// This type is specifically for what GetCommunities returns when relations are loaded.
export type CommunityWithRelations = SelectCommunity & {
  communityMembers: SelectCommunityUser[] // Drizzle will load these as an array if 'with' is used
  channels: SelectChannel[] // Drizzle will load these as an array if 'with' is used
}

/**
 * Retrieves a list of communities based on various filters, with pagination.
 * Includes related data like member count and channel count.
 */
export async function GetCommunities(filters?: CommunityQueryFilters): Promise<{
  communities: CommunityWithRelations[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}> {
  const {
    searchTerm,
    communityCategory,
    sortBy = "newest",
    page = 1,
    limit = 6,
    createdByUserId
  } = filters || {}
  const offset = (page - 1) * limit
  const whereClause: (SQLWrapper | SQL)[] = []
  if (searchTerm) {
    whereClause.push(sql`(${ilike(communitiesTable.title, `%${searchTerm}%`)})`)
  }
  if (communityCategory && communityCategory !== "all") {
    whereClause.push(ilike(communitiesTable.category, communityCategory))
  }
  if (createdByUserId) {
    whereClause.push(eq(communitiesTable.created_by, createdByUserId))
  }
  let orderByClause: SQL<unknown>
  switch (sortBy) {
    case "titleAsc":
      orderByClause = sql`${communitiesTable.title} asc`
      break
    case "titleDesc":
      orderByClause = sql`${communitiesTable.title} desc`
      break
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
        channels: true
      }
    }) as Promise<CommunityWithRelations[]>

    const totalCountPromise = db
      .select({ count: count() })
      .from(communitiesTable)
      .where(and(...whereClause))

    const [communities, totalResult] = await Promise.all([
      communitiesPromise,
      totalCountPromise
    ])

    const total = totalResult[0].count
    const totalPages = Math.ceil(total / limit)

    return {
      communities,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    }
  } catch (e: any) {
    console.error("Error fetching communities:", e)
    throw new Error(`Failed to retrieve communities: ${e.message}`)
  }
}

/**
 * Retrieves communities that a specific user has joined.
 * NOTE: This function does not currently load 'communityMembers' or 'channels' relations
 * from the 'communitiesTable' as it's doing a select on 'communityUsersTable' and then
 * joining. If those relations are needed, the query would need to be structured differently
 * (e.g., query communitiesTable with a where clause that checks for user membership).
 * For now, the mapping in CommunitiesPage.tsx will use 0 for these counts for joined communities.
 */
export async function GetJoinedCommunities(
  userId: string,
  filters?: Omit<
    CommunityQueryFilters,
    "searchTerm" | "communityCategory" | "createdByUserId"
  >
): Promise<{
  communities: SelectCommunity[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}> {
  const { page = 1, limit = 6, sortBy = "newest" } = filters || {}

  const offset = (page - 1) * limit

  const whereClause: (SQLWrapper | SQL)[] = [
    eq(communityUsersTable.user_id, userId)
  ]

  let orderByClause: SQL<unknown> | undefined
  switch (sortBy) {
    case "newest":
      orderByClause = sql`${communitiesTable.created_at} desc`
      break
    case "oldest":
      orderByClause = sql`${communitiesTable.created_at} asc`
      break
    case "titleAsc":
      orderByClause = sql`${communitiesTable.title} asc`
      break
    case "titleDesc":
      orderByClause = sql`${communitiesTable.title} desc`
      break
    default:
      orderByClause = sql`${communitiesTable.created_at} desc`
  }

  try {
    const joinedCommunitiesPromise = db
      .select({ community: communitiesTable })
      .from(communityUsersTable)
      .where(and(...whereClause))
      .limit(limit)
      .offset(offset)
      .orderBy(orderByClause)
      .leftJoin(
        communitiesTable,
        eq(communityUsersTable.community_id, communitiesTable.id)
      )
      .then((rows) => {
        return rows
          .map((row) => row.community)
          .filter((comm): comm is SelectCommunity => comm !== null)
      }) as Promise<SelectCommunity[]>

    const totalCountPromise = db
      .select({ count: count() })
      .from(communityUsersTable)
      .where(and(...whereClause))

    const [communities, totalResult] = await Promise.all([
      joinedCommunitiesPromise,
      totalCountPromise
    ])

    const total = totalResult[0].count
    const totalPages = Math.ceil(total / limit)

    return {
      communities,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    }
  } catch (e: any) {
    console.error("Error fetching joined communities:", e)
    throw new Error(`Failed to retrieve joined communities: ${e.message}`)
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
    console.log(communityId, "communityIdcommunityIdcommunityId")
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
