"use server"

import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import {
  AcceptAdvisorRequest,
  AddAdvisorsInRequest,
  CreateAdvisorRequest,
  GetActiveAdvisorRequestForSpace,
  GetAdvisorRequestById,
  GetAdvisorRequestsForAdvisor,
  GetEligibleAdvisorsForDomain,
  GetLatestAdvisorRequestForSpace,
  GetRecentPendingAdvisorRequests,
  getStudentRequestStatus,
  RejectAdvisorRequest,
  UpdateRequestStatus
} from "@/src/db/data-access/advisor-requests/query"
import { HasUsersWithTagId } from "@/src/db/data-access/tag/query"
import { permissions } from "@/src/utils/constants"
import {
  base64ToBuffer,
  uploadFileAndSaveMetadata
} from "@/src/services/storage/utils/fileUtils"
import { AttachSpaceUserAction } from "@/src/server-actions/Space/Space"
import { sendAdvisorRequestResponseNotification } from "@/src/services/notifications/AdvisorRequest/utils"
import { createAdvisorRequestResponseEmailNotification } from "@/src/services/notify/advisorRequest/advisorRequest"
import { advisorRequestsTable } from "@/src/db/schema"
import type { SelectFile, SelectTag, SelectUser } from "@/src/db/schema"
import { notifyAdvisorsOfNewAdvisorRequest } from "@/src/services/notify/advisor-request/advisor-request"
import { AdvisorRequestStatus } from "@/src/types/AdvisorRequest/AdvisorRequest"
import {
  ADVISOR_REQUEST_PROPOSAL_ALLOWED_MIME_TYPES,
  ADVISOR_REQUEST_PROPOSAL_MAX_FILE_SIZE
} from "@/src/utils/constants"


const ADVISOR_REQUEST_EXPIRY_DAYS = 14

export interface AdvisorRequestFormData {
  group_members: { name: string; registration_number: string }[]
  supervisor_name: string
  fyp_title: string
  abstract: string
  problem_statement: string
  tech_stack: string
  domain_tag_id: number
  proposal_link?: string
}

export interface AdvisorRequestProposalFile {
  name: string
  sizeBytes: number
  base64: string
  mimeType: string
}

export const GetActiveAdvisorRequestForSpaceAction = CreateServerAction(
  true,
  async (spaceId: string) => {
    try {
      const request = await GetActiveAdvisorRequestForSpace(spaceId)
      return { success: true, data: request }
    } catch (error) {
      return { success: false, error }
    }
  }
)

export const GetLatestAdvisorRequestForSpaceAction = CreateServerAction(
  true,
  async (spaceId: string) => {
    try {
      const request = await GetLatestAdvisorRequestForSpace(spaceId)
      return { success: true, data: request }
    } catch (error) {
      return { success: false, error }
    }
  }
)

export const CreateAdvisorRequestAction = CreateServerAction(
  true,
  async (
    spaceId: string,
    formData: AdvisorRequestFormData,
    proposalFile?: AdvisorRequestProposalFile | null
  ) => {
    try {
      const user = await AuthUserAction()

      const existingRequest = await GetActiveAdvisorRequestForSpace(spaceId)
      if (existingRequest) {
        return {
          success: false,
          error: "This space already has an active advisor request."
        }
      }

      if (!proposalFile && !formData.proposal_link) {
        return {
          success: false,
          error: "A proposal file or link is required."
        }
      }

      const hasUsersInDomain = await HasUsersWithTagId(formData.domain_tag_id)
      if (!hasUsersInDomain) {
        return {
          success: false,
          error: "There are no users in this domain.",
          field: "domain_tag_id"
        }
      }

      let proposal_file_id: number | undefined

      if (proposalFile) {
        if (
          !ADVISOR_REQUEST_PROPOSAL_ALLOWED_MIME_TYPES.includes(
            proposalFile.mimeType
          )
        ) {
          return {
            success: false,
            error: "Proposal must be a PDF, DOC, or DOCX file."
          }
        }
        if (proposalFile.sizeBytes > ADVISOR_REQUEST_PROPOSAL_MAX_FILE_SIZE) {
          return {
            success: false,
            error: "Proposal file must be 200MB or smaller."
          }
        }

        const fileBuffer = base64ToBuffer(proposalFile.base64)
        const { fileRecord } = await uploadFileAndSaveMetadata(
          fileBuffer,
          proposalFile.name,
          proposalFile.mimeType,
          "advisor-requests"
        )
        proposal_file_id = fileRecord.id
      }

      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + ADVISOR_REQUEST_EXPIRY_DAYS)

      const [request] = await CreateAdvisorRequest({
        ...formData,
        space_id: spaceId,
        requested_by: user.unique_id,
        proposal_file_id,
        expiry_date: expiryDate.toISOString()
      })

      return { success: true, data: request }
    } catch (error) {
      return { success: false, error }
    }
  }
)

export type AdvisorViewerStatus =
  | "accepted"
  | "rejected"
  | "already_assigned"
  | "expired"
  | "awaiting_approval"

export type AdvisorRequestListItem =
  typeof advisorRequestsTable.$inferSelect & {
    requester: SelectUser
    domain: SelectTag
    proposalFile: SelectFile | null
    viewerStatus: AdvisorViewerStatus
  }

function getAdvisorViewerStatus(
  request: {
    accepted_by: string | null
    rejected_by: { advisor_id: string; reason: string }[] | null
    expiry_date: string
  },
  advisorId: string
): AdvisorViewerStatus {
  if (request.accepted_by === advisorId) return "accepted"
  if (request.accepted_by) return "already_assigned"
  if (request.rejected_by?.some((r) => r.advisor_id === advisorId))
    return "rejected"
  if (new Date(request.expiry_date) < new Date()) return "expired"
  return "awaiting_approval"
}

export const GetAdvisorRequestsForAdvisorAction = CreateServerAction(
  true,
  async () => {
    try {
      const user = await AuthUserAction()
      const requests = await GetAdvisorRequestsForAdvisor(user.unique_id)
      const data = requests.map((request) => ({
        ...request,
        viewerStatus: getAdvisorViewerStatus(request, user.unique_id)
      }))
      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    }
  }
)

export const AcceptAdvisorRequestAction = CreateServerAction(
  true,
  async (requestId: string) => {
    try {
      const user = await AuthUserAction()
      const request = await AcceptAdvisorRequest(requestId, user.unique_id)
      if (!request) {
        return {
          success: false,
          error: "This request has already been resolved by another advisor."
        }
      }

      const attachResult = await AttachSpaceUserAction(
        request.space_id,
        user.unique_id
      )
      if (!attachResult?.success) {
        console.error(
          "Failed to add accepted advisor to space:",
          attachResult?.error
        )
      }

      try {
        const withSpace = await GetAdvisorRequestById(requestId)
        if (withSpace) {
          const advisorName = `${user.first_name} ${user.last_name}`.trim()
          const notifyContext = {
            requested_by: withSpace.requested_by,
            fyp_title: withSpace.fyp_title,
            space_slug: withSpace.space.space_slug,
            channel_slug: withSpace.space.channel?.channel_slug
          }

          await sendAdvisorRequestResponseNotification(
            notifyContext,
            "accepted",
            { unique_id: user.unique_id, profile_url: user.profile_url },
            advisorName
          )
          await createAdvisorRequestResponseEmailNotification(
            notifyContext,
            "accepted",
            advisorName
          )
        }
      } catch (notifyError) {
        console.error(
          "Failed to send advisor acceptance notification:",
          notifyError
        )
      }

      return { success: true, data: request }
    } catch (error) {
      return { success: false, error }
    }
  }
)

export const RejectAdvisorRequestAction = CreateServerAction(
  true,
  async (requestId: string, reason: string) => {
    try {
      const user = await AuthUserAction()

      const before = await GetAdvisorRequestById(requestId)
      if (!before) {
        return { success: false, error: "Request not found." }
      }
      const wasAlreadyRejected = getStudentRequestStatus(before) === "rejected"

      const request = await RejectAdvisorRequest(
        requestId,
        user.unique_id,
        reason
      )

      try {
        const after = await GetAdvisorRequestById(requestId)
        if (
          after &&
          !wasAlreadyRejected &&
          getStudentRequestStatus(after) === "rejected"
        ) {
          const notifyContext = {
            requested_by: after.requested_by,
            fyp_title: after.fyp_title,
            space_slug: after.space.space_slug,
            channel_slug: after.space.channel?.channel_slug
          }

          await sendAdvisorRequestResponseNotification(
            notifyContext,
            "rejected",
            { unique_id: user.unique_id, profile_url: null }
          )
          await createAdvisorRequestResponseEmailNotification(
            notifyContext,
            "rejected"
          )
        }
      } catch (notifyError) {
        console.error(
          "Failed to send advisor rejection notification:",
          notifyError
        )
      }

      return { success: true, data: request }
    } catch (error) {
      return { success: false, error }
    }
  }
)

export const getEligibleRequestAdvisorsAction = CreateServerAction(
  false,
  async () => {
    try {
      const recentRequests = await GetRecentPendingAdvisorRequests()
      if (!recentRequests.length) {
        return { success: false, error: "No recent pending advisor requests." }
      }

      const proccessingRequest = recentRequests.map(async (request) => {
        const advisors = await GetEligibleAdvisorsForDomain(
          request.domain_tag_id,
          "fyp",
          permissions.fyp.canReceiveAdvisorRequest
        )

        await AddAdvisorsInRequest(
          request.id,
          advisors.map((advisor) => advisor.unique_id)
        )

        await UpdateRequestStatus(
          request.id,
          AdvisorRequestStatus.AWAITING_APPROVAL
        )

        if (!request.space?.channel) return

        await notifyAdvisorsOfNewAdvisorRequest(advisors, request)
      })

      await Promise.all(proccessingRequest)

      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }
)
