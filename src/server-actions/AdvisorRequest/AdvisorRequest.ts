"use server"

import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import {
  AddAdvisorsInRequest,
  CreateAdvisorRequest,
  GetActiveAdvisorRequestForSpace,
  GetEligibleAdvisorsForDomain,
  GetRecentPendingAdvisorRequests,
  UpdateRequestStatus
} from "@/src/db/data-access/advisor-requests/query"
import { HasUsersWithTagId } from "@/src/db/data-access/tag/query"
import { permissions } from "@/src/utils/constants"
import {
  base64ToBuffer,
  uploadFileAndSaveMetadata
} from "@/src/services/storage/utils/fileUtils"
import { notifyAdvisorsOfNewAdvisorRequest } from "@/src/services/notify/advisor-request/advisor-request"

const MAX_PROPOSAL_FILE_SIZE = 200 * 1024 * 1024
const ADVISOR_REQUEST_EXPIRY_DAYS = 14
const ALLOWED_PROPOSAL_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

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
        if (!ALLOWED_PROPOSAL_MIME_TYPES.includes(proposalFile.mimeType)) {
          return {
            success: false,
            error: "Proposal must be a PDF, DOC, or DOCX file."
          }
        }
        if (proposalFile.sizeBytes > MAX_PROPOSAL_FILE_SIZE) {
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

export const getEligibleRequestAdvisorsAction = CreateServerAction(
  true,
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

        await UpdateRequestStatus(request.id, "awaiting_approval")

        if (!request.space?.channel) return

        await notifyAdvisorsOfNewAdvisorRequest(advisors, request)
      })
    } catch (error) {
      return { success: false, error }
    }
  }
)
