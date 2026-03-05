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
    const page = filters?.page ?? 1
    const limit = filters?.limit ?? 10
    const offset = (page - 1) * limit

    const whereClauses: (SQLWrapper | undefined)[] = []

    if (filters?.status) {
      whereClauses.push(eq(communityRequestsTable.status, filters.status))
    }

    const response = await db
      .select()
      .from(communityRequestsTable)
      .where(whereClauses.length ? and(...whereClauses) : undefined)
      .limit(limit)
      .offset(offset)

    const totalCount = await db.$count(communityRequestsTable)

    return {
      communityRequests: response,
      pagination: {
        total: Number(totalCount),
        page,
        limit,
        totalPages: limit ? Math.ceil(Number(totalCount) / limit) : 1
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
