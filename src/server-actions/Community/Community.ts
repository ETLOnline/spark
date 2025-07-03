"use server"

import {
  CreateCommunity,
  GetCommunities,
  IsCommunitySlugAvailable,
  CommunityQueryFilters,
  GetJoinedCommunities,
  UpdateCommunity,
  DeleteCommunity
} from "@/src/db/data-access/communities/query"
import { isUserAdmin } from "@/src/utils/helpers"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import {
  InsertCommunity,
  SelectCommunity,
  SelectCommunityUser
} from "@/src/db/schema"
import { AblyClientRest } from "@/src/services/realtime/AblyClient"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"

export const CreateCommunityAction = CreateServerAction(
  true, // Requires authentication
  async (communityData: InsertCommunity) => {
    try {
      const newCommunity = await CreateCommunity(communityData)

      // Example: Realtime broadcast (adjust topic as needed)
      const channel = AblyClientRest.channels.get(
        "broadcast-communities-update"
      )
      await channel.publish("community-add", newCommunity)

      return { success: true, data: newCommunity }
    } catch (error: any) {
      console.error("Error in CreateCommunityAction:", error)
      return {
        success: false,
        error: error.message || "Failed to create community."
      }
    }
  }
)

export interface GetCommunitiesResponseType {
  communities: SelectCommunity[]
  pagination: PaginationType
}

export interface GetCommunitiesActionResponse {
  communities: SelectCommunity[]
  joinedCommunities: SelectCommunity[]
  pagination: PaginationType
}

export const GetCommunitiesAction = CreateServerAction(
  true,
  async (
    filters?: CommunityQueryFilters,
    page: number = 1,
    limit: number = 6
  ): Promise<
    | { success: true; data: GetCommunitiesActionResponse }
    | { success: false; error: any }
  > => {
    try {
      const authUser = await AuthUserAction()
      let allCommunitiesResponse: GetCommunitiesResponseType
      let joinedCommunities: SelectCommunity[] = []
      const combinedFilters: CommunityQueryFilters = {
        ...filters,
        page,
        limit
      }

      if (false) {
        allCommunitiesResponse = await GetCommunities(combinedFilters)
      } else {
        allCommunitiesResponse = await GetCommunities({
          ...combinedFilters
        })
        console.log(allCommunitiesResponse, "combinedFilters")
        if (authUser?.unique_id) {
          const joinedCommunitiesResponse = await GetJoinedCommunities(
            authUser.unique_id,
            {
              ...combinedFilters
            }
          )
          joinedCommunities = joinedCommunitiesResponse.communities
        }

        const joinedCommunityIds = joinedCommunities.map((c) => c.id)

        // Filter out joined communities from the 'allCommunitiesResponse'
        // allCommunitiesResponse.communities = allCommunitiesResponse.communities.filter(
        //     (community) => !joinedCommunityIds.includes(community.id)
        // )
      }

      return {
        success: true,
        data: {
          communities: allCommunitiesResponse.communities,
          joinedCommunities: joinedCommunities,
          pagination: allCommunitiesResponse.pagination
        }
      }
    } catch (error: any) {
      console.error("Error in GetCommunitiesAction:", error)
      return {
        success: false,
        error: error.message || "Failed to retrieve communities."
      }
    }
  }
)

export interface GetJoinedCommunitiesResponseType {
  communities: SelectCommunity[]
  pagination: PaginationType
}

export const GetJoinedCommunitiesAction = CreateServerAction(
  true,

  async (
    filters?: Omit<
      CommunityQueryFilters,
      "searchTerm" | "communityType" | "userId"
    >,
    page: number = 1,
    limit: number = 10
  ): Promise<
    | { success: true; data: GetJoinedCommunitiesResponseType }
    | { success: false; error: any }
  > => {
    try {
      const authUser = await AuthUserAction()

      if (!authUser?.unique_id) {
        throw new Error("User not authenticated.")
      }

      const combinedFilters = {
        ...filters,
        page,
        limit
      }

      const result = await GetJoinedCommunities(
        authUser.unique_id,
        combinedFilters
      )
      return { success: true, data: result }
    } catch (error: any) {
      console.error("Error in GetJoinedCommunitiesAction:", error)
      return {
        success: false,
        error: error.message || "Failed to retrieve joined communities."
      }
    }
  }
)

// --- Placeholder for other CRUD/management actions (following your channels/action.ts pattern) ---

export const UpdateCommunityAction = CreateServerAction(
  true,
  async (communityID: string, updatedData: Partial<SelectCommunity>) => {
    try {
      const updatedCommunity = await UpdateCommunity(communityID, updatedData)
      const channel = AblyClientRest.channels.get(
        "broadcast-communities-update"
      )
      await channel.publish("community-edit", updatedCommunity)
      return { success: true, data: updatedCommunity }
    } catch (error: any) {
      console.error("Error in UpdateCommunityAction:", error)
      return {
        success: false,
        error: error.message || "Failed to update community."
      }
    }
  }
)

export const DeleteCommunityAction = CreateServerAction(
  true,
  async (deletedCommunityData: SelectCommunity) => {
    try {
      const communityIdToDelete = deletedCommunityData.id
      await DeleteCommunity(communityIdToDelete)

      return { success: true, message: "Community deleted successfully." }
    } catch (error: any) {
      console.error("Error in DeleteCommunityAction:", error)
      return {
        success: false,
        error: error.message || "Failed to delete community."
      }
    }
  }
)

export const IsCommunitySlugAvailableAction = CreateServerAction(
  true,
  async (slug: string, communityId?: string) => {
    try {
      const isAvailable = await IsCommunitySlugAvailable(slug, communityId)
      return { success: true, data: isAvailable }
    } catch (error: any) {
      console.error("Error in IsCommunitySlugAvailableAction:", error)
      return {
        success: false,
        error: error.message || "Failed to check slug availability."
      }
    }
  }
)
