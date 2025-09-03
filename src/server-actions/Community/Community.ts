"use server"

import {
  CreateCommunity,
  GetCommunities,
  IsCommunitySlugAvailable,
  CommunityQueryFilters,
  UpdateCommunity,
  DeleteCommunity,
  CommunityDetailData,
  GetCommunityBySlug,
  getCategories,
  getCommunityUsers,
  attachCommunityUser,
  GetCommunityById,
  detachCommunityUser,
  getCommunitiesByIds
} from "@/src/db/data-access/communities/query"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import { InsertCommunity, SelectCommunity } from "@/src/db/schema"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import {
  createScopedCommunityRolesAndAssignAdmin,
  getAndAssignViewerRoles
} from "@/src/db/data-access/roles/query"
import {
  base64ToBuffer,
  uploadFileAndSaveMetadata
} from "@/src/services/storage/utils/fileUtils"
import pusherServer from "@/src/services/realtime/pusherServer"

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
      await attachCommunityUser(
        newCommunity.id,
        newCommunity.created_by,
        result.adminRole?.name
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
  joinedCount: number
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
    limit: number = 6
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
        authUser,
        { ...filters },
        page,
        limit
      )

      const joinedCommunitiesResult = allCommunitiesResult.communities.filter(
        (community) =>
          community.communityMembers?.some(
            (member) => member.user_id === authUser.unique_id
          )
      )

      return {
        success: true,
        data: {
          communities: allCommunitiesResult.communities,
          allCommunitiesPagination: allCommunitiesResult.pagination,
          joinedCommunities: joinedCommunitiesResult,
          joinedCommunitiesPagination: allCommunitiesResult.pagination,
          joinedCount: allCommunitiesResult.joinedCount
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
export const GetJoinedCommunitiesAction = CreateServerAction(
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

      if (!authUser?.unique_id) {
        throw new Error("Authentication required to fetch communities.")
      }
      const allCommunitiesResult = await GetCommunities(
        authUser,
        { ...filters },
        page,
        limit
      )

      const joinedCommunitiesResult = allCommunitiesResult.communities.filter(
        (community) =>
          community.communityMembers?.some(
            (member) => member.user_id === authUser.unique_id
          )
      )

      return {
        success: true,
        data: {
          communities: allCommunitiesResult.communities,
          allCommunitiesPagination: allCommunitiesResult.pagination,
          joinedCommunities: joinedCommunitiesResult,
          joinedCommunitiesPagination: allCommunitiesResult.pagination,
          joinedCount: allCommunitiesResult.joinedCount
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
      const community = await GetCommunityBySlug(communitySlug)
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

export const GetCommunityUsersAction = CreateServerAction(
  true,
  async (communityId: string) => {
    try {
      const spaceUsers = await getCommunityUsers(communityId)
      return { success: true, data: spaceUsers }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetCommunityByIdAction = CreateServerAction(
  true,
  async (communityId: string, withCommunityUsers?: boolean) => {
    try {
      const space = await GetCommunityById(communityId, withCommunityUsers)
      return { success: true, data: space }
    } catch (error) {
      return { error: error }
    }
  }
)

export const AttachCommunityUserAction = CreateServerAction(
  true,
  async (communityId: string, userId: string) => {
    try {
      const attachUserRole = await getAndAssignViewerRoles(
        userId,
        "community_viewer",
        communityId
      )
      const channelUser = await attachCommunityUser(
        communityId,
        userId,
        attachUserRole?.viewerRole?.name
      )
      pusherServer.trigger(`user-${userId}`, "update-role", attachUserRole)
      return { success: true, data: channelUser }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DetachCommunityUserAction = CreateServerAction(
  true,
  async (communityId: string, userId: string) => {
    try {
      const deleted = await detachCommunityUser(communityId, userId)
      pusherServer.trigger(`user-${userId}`, "update-role", deleted)
      return { success: true, data: deleted }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
)

export const GetFeaturedCommunitiesAction = CreateServerAction(
  false,
  async (communityIds: string[]) => {
    try {
      const communities = await getCommunitiesByIds(communityIds)
      return { success: true, data: communities }
    } catch (error) {
      return { success: false, error: error }
    }
  }
)

// this function will check if the user is a member of the community
export const ensureCommunityMembership = async (
  communityId: string,
  userId: string
): Promise<void> => {
  const communityMembers = await getCommunityUsers(communityId)
  const communityUserIds = communityMembers.map((cu) => cu.user_id)

  const isMember = communityUserIds.includes(userId)

  if (!isMember) {
    const attachCommunityUserRole = await getAndAssignViewerRoles(
      userId,
      "community_viewer",
      communityId
    )

    await attachCommunityUser(
      communityId,
      userId,
      attachCommunityUserRole?.viewerRole?.name
    )
  }
}

export const communityCoverImageAction = CreateServerAction(
  true,
  async (fileName: string, fileB64string: string, fileType: string) => {
    try {
      const fileBuffer = base64ToBuffer(fileB64string)

      const { fileUrl } = await uploadFileAndSaveMetadata(
        fileBuffer,
        fileName,
        fileType,
        "communities"
      )

      if (!fileUrl) {
        throw new Error("Upload failed: missing fileUrl or file metadata.")
      }

      return {
        success: true,
        data: fileUrl
      }
    } catch (error) {
      return {
        success: false,
        error: error
      }
    }
  }
)
