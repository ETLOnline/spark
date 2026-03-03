"use server"
import {
  createCommunityRequest,
  getCommunityRequestByUserId
} from "@/src/db/data-access/communities/communityRequest/query"
import { InsertCommunityRequest } from "@/src/db/schema"
import { CreateServerAction } from "../.."

export const CreateCommunityRequestAction = CreateServerAction(
  true,
  async (data: InsertCommunityRequest) => {
    try {
      const res = await createCommunityRequest(data)
      return { success: true, data: res }
    } catch (error) {
      console.log("Error in CreateCommunityRequestAction:", error)
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
