"use server"

import {
  CreateCommunity,
  GetCommunities,
  IsCommunitySlugAvailable,
  CommunityQueryFilters,
  GetJoinedCommunities,
  UpdateCommunity,
  DeleteCommunity,
  CommunityDetailData,
  GetCommunityById,
  getCategories
} from "@/src/db/data-access/communities/query"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import { InsertCommunity, SelectCommunity } from "@/src/db/schema"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { createScopedCommunityRolesAndAssignAdmin } from "@/src/db/data-access/roles/query"

export const CreateCommunityAction = CreateServerAction(
  true,
  async (communityData: InsertCommunity) => {
    try {
      const newCommunity = await CreateCommunity(communityData)
      const result = await createScopedCommunityRolesAndAssignAdmin(
        newCommunity.id,
        newCommunity.title,
        newCommunity.created_by
      )

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
export interface GetCommunitiesActionResponse {
  communities: SelectCommunity[]
  allCommunitiesPagination: PaginationType
  joinedCommunities: SelectCommunity[]
  joinedCommunitiesPagination: PaginationType
}

export interface GetCommunitiesResponseType {
  communities: SelectCommunity[]
  pagination: PaginationType
}

export const GetCommunitiesAction = CreateServerAction(
  true,
  async (
    filters?: CommunityQueryFilters,
    page: number = 1,
    limit: number = 6,
    activeTab: "all" | "my" = "all"
  ): Promise<
    | { success: true; data: GetCommunitiesActionResponse }
    | { success: false; error: any }
  > => {
    try {
      const authUser = await AuthUserAction()

      if (!authUser?.unique_id) {
        throw new Error("Authentication required to fetch communities.")
      }
      const allCommunitiesResult = await GetCommunities(
        { ...filters },
        page,
        limit
      )

      const joinedCommunitiesResult = await GetJoinedCommunities(
        authUser.unique_id,
        { ...filters },
        page,
        limit
      )

      return {
        success: true,
        data: {
          communities: allCommunitiesResult.communities,
          allCommunitiesPagination: allCommunitiesResult.pagination,
          joinedCommunities: joinedCommunitiesResult.communities,
          joinedCommunitiesPagination: joinedCommunitiesResult.pagination
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
    filters?: Omit<CommunityQueryFilters, "createdByUserId">,
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

export const UpdateCommunityAction = CreateServerAction(
  true,
  async (communityID: string, updatedData: Partial<SelectCommunity>) => {
    try {
      const updatedCommunity = await UpdateCommunity(communityID, updatedData)
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

export const GetCommunityDetailsAction = CreateServerAction(
  true,
  async (communitySlug: string): Promise<CommunityDetailData | null> => {
    try {
      const community = await GetCommunityById(communitySlug)
      return community
    } catch (error) {
      console.error("Error in getCommunityDetailsAction:", error)
      return null
    }
  }
)

export const GetCommunityCategoriesAction = CreateServerAction(
  true,
  async () => {
    try {
      const community = await getCategories()
      return community
    } catch (error) {
      console.error("Error in getCommunityDetailsAction:", error)
      return []
    }
  }
)
