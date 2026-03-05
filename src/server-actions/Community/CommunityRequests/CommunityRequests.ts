"use server"
import {
  CommunityRequestFilters,
  createCommunityRequest,
  getCommunityRequestByUserId,
  getCommunityRequests,
  UpdateCommunityRequest
} from "@/src/db/data-access/communities/communityRequest/query"
import { InsertCommunityRequest } from "@/src/db/schema"
import { CreateServerAction } from "../.."
import {
  createCommunityRequestNotification,
  notifyAdminNewCommunityRequest,
  notifyUserCommunityRequestAccepted,
  notifyUserCommunityRequestDeclined
} from "@/src/services/notify/community/community"
import { NotificationEvent } from "@/src/services/notify/types/events"
import { RequestStatus } from "@/src/types/CommunityCreationRequest/CommunityCreationRequest"

export const CreateCommunityRequestAction = CreateServerAction(
  true,
  async (data: InsertCommunityRequest) => {
    try {
      const res = await createCommunityRequest(data)

      if (res) {
        await createCommunityRequestNotification(
          NotificationEvent.COMMUNITY_REQUEST
        )

        await notifyAdminNewCommunityRequest(
          NotificationEvent.ADMIN_NEW_COMMUNITY_REQUEST
        )
      }

      return { success: true, data: res }
    } catch (error) {
      return { success: false, error: "Failed to create community request" }
    }
  }
)

export const getCommunityRequestsAction = CreateServerAction(
  true,
  async (filters?: CommunityRequestFilters) => {
    try {
      const res = await getCommunityRequests({ ...filters })
      return { success: true, data: res }
    } catch (error) {
      console.error("Error in getCommunityRequestsAction:", error)
      return { success: false, error: "Failed to fetch community requests" }
    }
  }
)

export const GetCommunityRequestByUserIdAction = CreateServerAction(
  true,
  async (id: string) => {
    try {
      const res = await getCommunityRequestByUserId(id)
      return { success: true, data: res }
    } catch (error) {
      console.error("Error in GetCommunityRequestByUserIdAction:", error)
      return { success: false, error: "Failed to fetch community request" }
    }
  }
)

export const UpdateCommunityRequestAction = CreateServerAction(
  true,
  async (CommunityRequestId: string, status: string) => {
    try {
      const res = await UpdateCommunityRequest(CommunityRequestId, status)

      if (res.status === RequestStatus.ACCEPTED) {
        await notifyUserCommunityRequestAccepted(
          NotificationEvent.COMMUNITY_REQUEST_ACCEPTED,
          res
        )
      }

      if (res.status === RequestStatus.REJECTED) {
        await notifyUserCommunityRequestDeclined(
          NotificationEvent.COMMUNITY_REQUEST_REJECTED,
          res
        )
      }

      return { success: true, data: res }
    } catch (error) {
      console.error("Error in UpdateCommunityRequestAction:", error)
      return { success: false, error: "Failed to update community request" }
    }
  }
)
