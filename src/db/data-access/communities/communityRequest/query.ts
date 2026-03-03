import { db } from "@/src/db"
import { communityRequestsTable, InsertCommunityRequest } from "@/src/db/schema"
import { eq } from "drizzle-orm"

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
