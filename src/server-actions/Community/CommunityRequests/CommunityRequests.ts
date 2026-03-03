"use server"
import {
  createCommunityRequest,
  getCommunityRequestByUserId
} from "@/src/db/data-access/communities/communityRequest/query"
import { InsertCommunityRequest } from "@/src/db/schema"
import { CreateServerAction } from "../.."
import { createCommunityRequestNotification } from "@/src/services/notify/community/community"
import { NotificationEvent } from "@/src/services/notify/types/events"

export const CreateCommunityRequestAction = CreateServerAction(
  true,
  async (data: InsertCommunityRequest) => {
    try {
      const res = await createCommunityRequest(data)

      if (res) {
        await createCommunityRequestNotification(
          NotificationEvent.COMMUNITY_REQUEST
        )
      }

      return { success: true, data: res }
    } catch (error) {
      return { success: false, error: "Failed to create community request" }
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
