import { and, desc, eq, sql } from "drizzle-orm"
import { db } from "../.."
import { advisorRequestsTable, InsertAdvisorRequest } from "../../schema"

export const CreateAdvisorRequest = async (data: InsertAdvisorRequest) => {
  return await db.insert(advisorRequestsTable).values(data).returning()
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

export const GetLatestAdvisorRequestForSpace = async (spaceId: string) => {
  const request = await db.query.advisorRequestsTable.findFirst({
    where: eq(advisorRequestsTable.space_id, spaceId),
    with: { domain: true, proposalFile: true },
    orderBy: [desc(advisorRequestsTable.created_at)]
  })

  return request ?? null
}

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
        eq(advisorRequestsTable.status, "pending")
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
  const [request] = await db
    .update(advisorRequestsTable)
    .set({
      rejected_by: sql`${advisorRequestsTable.rejected_by} || ${JSON.stringify([{ advisor_id: advisorId, reason }])}::jsonb`
    })
    .where(eq(advisorRequestsTable.id, requestId))
    .returning()

  return request ?? null
}
