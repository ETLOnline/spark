import { and, eq } from "drizzle-orm"
import { db } from "../.."
import { advisorRequestsTable, InsertAdvisorRequest } from "../../schema"

export const CreateAdvisorRequest = async (data: InsertAdvisorRequest) => {
  return await db.insert(advisorRequestsTable).values(data).returning()
}

export const GetActiveAdvisorRequestForSpace = async (spaceId: string) => {
  const [request] = await db
    .select()
    .from(advisorRequestsTable)
    .where(
      and(
        eq(advisorRequestsTable.space_id, spaceId),
        eq(advisorRequestsTable.status, "active")
      )
    )

  return request ?? null
}
