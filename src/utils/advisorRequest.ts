import { AdvisorRequestStatus } from "@/src/types/AdvisorRequest/AdvisorRequest"

export type StudentRequestStatus =
  | AdvisorRequestStatus.PENDING
  | AdvisorRequestStatus.ACCEPTED
  | AdvisorRequestStatus.REJECTED
  | AdvisorRequestStatus.EXPIRED

export function getStudentRequestStatus(request: {
  status: string
  accepted_by: string | null
  rejected_by: { advisor_id: string; reason: string }[] | null
  advisor_ids: string[] | null
  expiry_date: string
}): StudentRequestStatus {
  if (request.status === AdvisorRequestStatus.ACCEPTED || request.accepted_by)
    return AdvisorRequestStatus.ACCEPTED

  const advisorIds = request.advisor_ids ?? []
  const rejectedCount = request.rejected_by?.length ?? 0
  const allRejected =
    advisorIds.length > 0 && rejectedCount >= advisorIds.length
  const isPastDeadline = new Date(request.expiry_date) < new Date()

  if (allRejected) return AdvisorRequestStatus.REJECTED
  if (isPastDeadline && rejectedCount > 0) return AdvisorRequestStatus.REJECTED
  if (isPastDeadline) return AdvisorRequestStatus.EXPIRED
  return AdvisorRequestStatus.PENDING
}
