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
  SelectCommunityCategory
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
  filters?: CommunityQueryFilters,
  page: number = 1,
  limit: number = 6
): Promise<{
  communities: CommunityWithRelations[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}> {
  const {
    searchTerm,
    communityCategory, // this will be the category id
    sortBy = "newest",
    createdByUserId
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
 * Retrieves communities that a specific user has joined, with optional filters and pagination.
 */
export async function GetJoinedCommunities(
  userId: string,
  filters?: CommunityQueryFilters,
  page: number = 1,
  limit: number = 6
): Promise<{
  communities: SelectCommunity[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}> {
  const { sortBy = "newest", searchTerm, communityCategory } = filters || {}
  const offset = (page - 1) * limit

  const whereClause: (SQLWrapper | SQL)[] = [
    eq(communityUsersTable.user_id, userId)
  ]

  if (searchTerm) {
    whereClause.push(sql`(${ilike(communitiesTable.title, `%${searchTerm}%`)})`)
  }

  if (communityCategory && communityCategory !== "all") {
    whereClause.push(eq(communitiesTable.category_id, communityCategory))
  }

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
      .select({
        community: communitiesTable,
        category: communityCategoriesTable
      })
      .from(communityUsersTable)
      .leftJoin(
        communitiesTable,
        eq(communityUsersTable.community_id, communitiesTable.id)
      )
      .leftJoin(
        communityCategoriesTable,
        eq(communitiesTable.category_id, communityCategoriesTable.id)
      )
      .where(and(...whereClause))
      .limit(limit)
      .offset(offset)
      .orderBy(orderByClause)
      .then((rows) => {
        return rows
          .map((row) => {
            if (!row.community) return null
            const communityData: SelectCommunity = {
              ...row.community,
              category: row.category || undefined
            }
            return communityData
          })
          .filter((comm): comm is SelectCommunity => comm !== null)
      }) as Promise<SelectCommunity[]>

    const totalCountPromise = db
      .select({ count: sql`count(distinct ${communitiesTable.id})` })
      .from(communityUsersTable)
      .leftJoin(
        communitiesTable,
        eq(communityUsersTable.community_id, communitiesTable.id)
      )
      .leftJoin(
        communityCategoriesTable,
        eq(communitiesTable.category_id, communityCategoriesTable.id)
      )
      .where(and(...whereClause))

    const [communities, totalResult] = await Promise.all([
      joinedCommunitiesPromise,
      totalCountPromise
    ])

    const total = totalResult[0].count as number
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
    await db
      .delete(communityUsersTable)
      .where(eq(communityUsersTable.community_id, communityId))
    await db
      .delete(channelsTable)
      .where(eq(channelsTable.community_id, communityId))

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
  channels: {
    id: string
    name: string
    createdAt: Date | null
    membersCount: number
  }[]
}

export async function GetCommunityById(
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
        channels: {
          columns: {
            id: true,
            channel_name: true,
            created_at: true
          }
        },
        category: {
          columns: {
            name: true
          }
        }
      }
    })

    if (!communityDetails) {
      return null
    }
    const categoryName = communityDetails.category?.name || ""
    const membersResult = await db
      .select({
        count: count(communityUsersTable.user_id)
      })
      .from(communityUsersTable)
      .where(eq(communityUsersTable.community_id, communityDetails.id))
    const totalCommunityMembers = membersResult[0]?.count || 0

    const totalMessages = 0
    const enrichedChannels = await Promise.all(
      communityDetails.channels.map(async (channel) => {
        const channelMembersCountResult = await db
          .select({
            count: count(ChannelUsersTable.user_id)
          })
          .from(ChannelUsersTable)
          .where(eq(ChannelUsersTable.channel_id, channel.id))

        const channelMembersCount = channelMembersCountResult[0]?.count || 0

        return {
          id: channel.id,
          name: channel.channel_name,
          createdAt: channel.created_at ? new Date(channel.created_at) : null,
          membersCount: channelMembersCount
        }
      })
    )

    const createdAtDate = communityDetails.created_at
      ? new Date(communityDetails.created_at)
      : null

    const finalCommunityData: CommunityDetailData = {
      id: communityDetails.id,
      title: communityDetails.title,
      description: communityDetails.description || "",
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
      channels: enrichedChannels
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
