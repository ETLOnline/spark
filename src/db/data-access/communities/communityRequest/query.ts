import { db } from "@/src/db"
import { communityRequestsTable, InsertCommunityRequest } from "@/src/db/schema"
import { and, eq, SQLWrapper } from "drizzle-orm"

export type CommunityRequestFilters = {
  page?: number
  limit?: number
  status?: string
}

export async function createCommunityRequest(data: InsertCommunityRequest) {
  try {
    const response = await db
      .insert(communityRequestsTable)
      .values(data)
      .returning()

    return response[0] // Return the inserted record
  } catch (error) {
    console.error("Error creating community request:", error)
    throw error
  }
}

export async function getCommunityRequests(filters?: CommunityRequestFilters) {
  try {
    const page = filters?.page
    const limit = filters?.limit
    const offset = page && limit ? (page - 1) * limit : 0

    const whereClauses: (SQLWrapper | undefined)[] = []

    if (filters?.status) {
      whereClauses.push(eq(communityRequestsTable.status, filters.status))
    }

    const response = await db.query.communityRequestsTable.findMany({
      limit: limit,
      offset: offset,
      where: whereClauses.length ? and(...whereClauses) : undefined
    })

    const totalCount = await db.$count(
      communityRequestsTable,
      whereClauses.length ? and(...whereClauses) : undefined
    )

    return {
      communityRequests: response,
      pagination: {
        total: Number(totalCount),
        page: page || 1,
        limit: limit || 0,
        totalPages:
          limit && limit !== 0 ? Math.ceil(Number(totalCount) / limit) : 1
      }
    }
  } catch (error) {
    console.error("Error fetching community requests:", error)
    throw error
  }
}

export async function getCommunityRequestByUserId(id: string) {
  try {
    const response = await db
      .select()
      .from(communityRequestsTable)
      .where(eq(communityRequestsTable.contact_person_id, id))

    return response
  } catch (error) {
    console.error("Error creating community request:", error)
    throw error
  }
}

export async function UpdateCommunityRequest(
  CommunityRequestId: string,
  status: string
) {
  try {
    const response = await db
      .update(communityRequestsTable)
      .set({ status: status })
      .where(eq(communityRequestsTable.id, CommunityRequestId))
      .returning()

    return response[0]
  } catch (error) {
    console.error("Error updating community request:", error)
    throw error
  }
}
