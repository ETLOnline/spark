import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../.."
import {
  advisorRequestsTable,
  InsertAdvisorRequest,
  SelectUser
} from "../../schema"
import { AdvisorRequestStatus } from "@/src/types/AdvisorRequest/AdvisorRequest"

// Creates a new advisor request row in the database. This is called when a user requests an advisor for their FYP.
export const CreateAdvisorRequest = async (data: InsertAdvisorRequest) => {
  try {
    return await db.insert(advisorRequestsTable).values(data).returning()
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export type StudentRequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "expired"

export function getStudentRequestStatus(request: {
  status: string
  accepted_by: string | null
  rejected_by: { advisor_id: string; reason: string }[] | null
  advisor_ids: string[] | null
  expiry_date: string
}): StudentRequestStatus {
  if (request.status === "accepted" || request.accepted_by) return "accepted"

  const advisorIds = request.advisor_ids ?? []
  const rejectedCount = request.rejected_by?.length ?? 0
  const allRejected =
    advisorIds.length > 0 && rejectedCount >= advisorIds.length
  const isPastDeadline = new Date(request.expiry_date) < new Date()

  if (allRejected) return "rejected"
  if (isPastDeadline && rejectedCount > 0) return "rejected"
  if (isPastDeadline) return "expired"
  return "pending"
}

// Fetches the most recently submitted advisor request for a space, including its domain and proposal file.
export const GetLatestAdvisorRequestForSpace = async (spaceId: string) => {
  const request = await db.query.advisorRequestsTable.findFirst({
    where: eq(advisorRequestsTable.space_id, spaceId),
    with: { domain: true, proposalFile: true },
    orderBy: [desc(advisorRequestsTable.created_at)]
  })

  return request ?? null
}

// Fetches the active advisor request for a given space. Returns null if no active request exists.
export const GetActiveAdvisorRequestForSpace = async (spaceId: string) => {
  const request = await GetLatestAdvisorRequestForSpace(spaceId)
  if (!request) return null
  return getStudentRequestStatus(request) === "pending" ? request : null
}

export const GetAdvisorRequestById = async (requestId: string) => {
  const request = await db.query.advisorRequestsTable.findFirst({
    where: eq(advisorRequestsTable.id, requestId),
    with: { space: { with: { channel: true } } }
  })

  return request ?? null
}

export const GetAdvisorRequestsForAdvisor = async (advisorId: string) => {
  return await db.query.advisorRequestsTable.findMany({
    where: sql`${advisorRequestsTable.advisor_ids} @> ${JSON.stringify([advisorId])}::jsonb`,
    with: {
      requester: true,
      domain: true,
      proposalFile: true
    },
    orderBy: [desc(advisorRequestsTable.created_at)]
  })
}

export const AcceptAdvisorRequest = async (
  requestId: string,
  advisorId: string
) => {
  const [request] = await db
    .update(advisorRequestsTable)
    .set({ status: "accepted", accepted_by: advisorId })
    .where(
      and(
        eq(advisorRequestsTable.id, requestId),
        eq(advisorRequestsTable.status, "awaiting_approval")
      )
    )
    .returning()

  return request ?? null
}

export const RejectAdvisorRequest = async (
  requestId: string,
  advisorId: string,
  reason: string
) => {
  const request = await db.query.advisorRequestsTable.findFirst({
    where: eq(advisorRequestsTable.id, requestId)
  })
  if (!request) return null

  const rejectedBy = [
    ...(request.rejected_by ?? []),
    { advisor_id: advisorId, reason }
  ]
  const advisorIds = request.advisor_ids ?? []
  const isLastAdvisor = rejectedBy.length >= advisorIds.length

  const [updated] = await db
    .update(advisorRequestsTable)
    .set({
      rejected_by: rejectedBy,
      ...(isLastAdvisor && { status: "rejected" })
    })
    .where(eq(advisorRequestsTable.id, requestId))
    .returning()

  return updated ?? null
}

export const GetRecentPendingAdvisorRequests = async () => {
  try {
    const recentRequests = await db.query.advisorRequestsTable.findMany({
      where: and(eq(advisorRequestsTable.status, AdvisorRequestStatus.PENDING)),
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
  status: AdvisorRequestStatus
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
