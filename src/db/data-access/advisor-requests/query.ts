import { and, eq, sql } from "drizzle-orm"
import { db } from "../.."
import {
  advisorRequestsTable,
  InsertAdvisorRequest,
  SelectUser
} from "../../schema"

// Creates a new advisor request row in the database. This is called when a user requests an advisor for their FYP.
export const CreateAdvisorRequest = async (data: InsertAdvisorRequest) => {
  try {
    return await db.insert(advisorRequestsTable).values(data).returning()
  } catch (e: any) {
    throw new Error(e.message)
  }
}

// Fetches the active advisor request for a given space. Returns null if no active request exists.
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

export const GetRecentPendingAdvisorRequests = async () => {
  try {
    const recentRequests = await db.query.advisorRequestsTable.findMany({
      where: and(eq(advisorRequestsTable.status, "pending")),
      with: {
        domain: true,
        requester: true,
        space: { with: { channel: true } }
      }
    })

    return recentRequests
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const GetEligibleAdvisorsForDomain = async (
  domainTagId: number,
  namespace: string,
  action: string
) => {
  const res = await db.execute(
    sql`
    select u.*
    from permissions p
    inner join role_permissions rp 
    on rp.permission_id = p.id
    inner join user_roles ur 
    on ur.role_id = rp.role_id
    inner join users u 
    on u.unique_id = ur.user_id
    inner join user_tags ut 
    on ut.user_id = ur.user_id
    where p.namespace = ${namespace} and p.action = ${action} and ut.tag_id = ${domainTagId}
  `
  )

  return res as unknown as SelectUser[]
}

export const AddAdvisorsInRequest = async (
  requestId: string,
  advisorIds: string[]
) => {
  try {
    const res = await db
      .update(advisorRequestsTable)
      .set({
        advisor_ids: advisorIds
      })
      .where(eq(advisorRequestsTable.id, requestId))
      .returning()

    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}
export const UpdateRequestStatus = async (
  requestId: string,
  status: string
) => {
  try {
    const res = await db
      .update(advisorRequestsTable)
      .set({
        status: status
      })
      .where(eq(advisorRequestsTable.id, requestId))
      .returning()

    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}
