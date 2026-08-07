"use server"

import {
  attachSpaceFeatures,
  attachSpaceUser,
  CreateSpace,
  DeleteSpace,
  dettachSpaceUser,
  getSpaceByChannelId,
  GetSpaceById,
  GetSpaceBySlug,
  GetSpaces,
  getSpaceUsers,
  IsIndependentSpaceSlugAvailable,
  IsSlugAvailable,
  spaceQueryFilters,
  UpdateSpace,
  updateSpaceUser
} from "@/src/db/data-access/spaces/query"
import { getFeatures } from "@/src/db/data-access/feature/query"
import { CreateServerAction } from ".."
import {
  InsertSpace,
  SelectChannel,
  SelectSpace,
  SelectSpaceUser
} from "@/src/db/schema"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import { AuthUserAction } from "../User/AuthUserAction"
import { GetSpaceURL, isSuperAdmin } from "@/src/utils/helpers"
import {
  attachChannelUser,
  GetChannelById,
  GetChannelBySlug,
  GetChannels,
  getChannelUsers
} from "@/src/db/data-access/channels/query"
import {
  createScopedSpaceRolesAndAssignAdmin,
  deleteUserRole,
  getAndAssignViewerRoles
} from "@/src/db/data-access/roles/query"
import { defaultSpaceOverviewTemplate } from "@/src/app/(dashboard)/channels/[channel_slug]/spaces/[space_slug]/(space-layout)/components/constants"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { GetUserPermissionsParsedAction } from "../UserRoles/UserRole"
import { ensureCommunityMembership } from "../Community/Community"
import { deleteRoleBasedOnEntityType } from "../CommonHelper/Helper"
import {
  attachCommunityUser,
  getCommunityUsers
} from "@/src/db/data-access/communities/query"
import pusherServer from "@/src/services/realtime/pusherServer"
import { EntityUpdateBroadCast } from "@/src/utils/constants"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"
import { ActivityTypes } from "@/src/types/Rewards/rewards"
import { AddRewardAction } from "../Reward/Reward"

// Define the broadcast channel name constant for cleaner code
const BROADCAST_CHANNEL = EntityUpdateBroadCast

// Every independent space comes with chat, file sharing, and
// project management enabled by default.
const DEFAULT_INDEPENDENT_SPACE_FEATURE_SLUGS = [
  "chat",
  "file-sharing",
  "project-management"
]

export const CreateSpaceAction = CreateServerAction(
  true,
  async (SpaceData: InsertSpace) => {
    try {
      const overview = defaultSpaceOverviewTemplate(SpaceData.space_name)
      const newSpace = await CreateSpace({ ...SpaceData, overview: overview })

      await pusherServer.trigger(BROADCAST_CHANNEL, "space-add", newSpace)

      const result = await createScopedSpaceRolesAndAssignAdmin(
        newSpace.id,
        newSpace.space_name,
        newSpace.created_by
      )

      const channelUsersAfter = await getChannelUsers(
        SpaceData.channel_id as string
      )

      const channel_user_id = channelUsersAfter.find(
        (cu) => cu.user_id === newSpace.created_by
      )?.id
      await attachSpaceUser(
        newSpace.id,
        newSpace.created_by,
        channel_user_id as number,
        result.adminRole?.name
      )

      const spaceWithRelations = await GetSpaceById(newSpace.id, true)

      const spaceURL = GetSpaceURL(
        spaceWithRelations?.channel?.channel_slug || "",
        spaceWithRelations?.space_slug || ""
      )

      await AddRewardAction(
        ActivityTypes.SpaceCreation,
        newSpace.created_by,
        spaceURL,
        {
          community_id: spaceWithRelations?.channel?.community_id,
          channel_id: spaceWithRelations?.channel?.id,
          space_id: newSpace.id
        }
      )

      return { success: true, data: newSpace }
    } catch (error: any) {
      return {
        error: error
      }
    }
  }
)

export const CreateIndependentSpaceAction = CreateServerAction(
  true,
  async (spaceData: Omit<InsertSpace, "channel_id">) => {
    try {
      const overview = defaultSpaceOverviewTemplate(spaceData.space_name)
      const newSpace = await CreateSpace({
        ...spaceData,
        channel_id: null,
        overview
      })

      const result = await createScopedSpaceRolesAndAssignAdmin(
        newSpace.id,
        newSpace.space_name,
        newSpace.created_by
      )

      await attachSpaceUser(
        newSpace.id,
        newSpace.created_by,
        null,
        result.adminRole?.name
      )

      const allFeatures = await getFeatures({ feature_type: "space" })
      const defaultFeatureIds = allFeatures
        .filter((f) =>
          DEFAULT_INDEPENDENT_SPACE_FEATURE_SLUGS.includes(f.feature_slug)
        )
        .map((f) => f.id)
      if (defaultFeatureIds.length) {
        await attachSpaceFeatures(newSpace.id, defaultFeatureIds)
      }

      return { success: true, data: newSpace }
    } catch (error: any) {
      return {
        error: error
      }
    }
  }
)

export const GetSpacesByCreatorAction = CreateServerAction(
  true,
  async (creatorId: string, page?: number, limit?: number) => {
    try {
      const result = await GetSpaces({
        created_by: creatorId,
        isIndependent: true,
        excludeArchived: true,
        page,
        limit
      })
      return { success: true, data: result }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSpacesForUserAction = CreateServerAction(
  true,
  async (userId: string, page?: number, limit?: number) => {
    try {
      const result = await GetSpaces({
        forUserId: userId,
        isIndependent: true,
        excludeArchived: true,
        page,
        limit
      })
      return { success: true, data: result }
    } catch (error) {
      return { error: error }
    }
  }
)

export const IsIndependentSlugAvailableAction = CreateServerAction(
  true,
  async (slug: string) => {
    try {
      const isAvailable = await IsIndependentSpaceSlugAvailable(slug)
      return { success: true, data: isAvailable }
    } catch (error) {
      return { error: error }
    }
  }
)

export interface GetSpacesResponseType {
  spaces: SelectSpace[]
  pagination: PaginationType
}
export const GetSpacesAction = CreateServerAction(
  true,
  async (filters?: spaceQueryFilters) => {
    try {
      let spaces: GetSpacesResponseType
      let joinedSpaces: SelectSpace[] = []
      let channel: SelectChannel | undefined

      const authUser = await AuthUserAction()
      const authUserId = authUser?.unique_id

      const isAdmin = await isSuperAdmin(authUser)

      const response = await GetUserPermissionsParsedAction(authUserId)

      if (!response.success) {
        return { error: response.error }
      }

      if (filters?.channel_slug) {
        channel = await GetChannelBySlug(filters?.channel_slug || "")
      } else if (filters?.channel_id) {
        channel = await GetChannelById(filters?.channel_id || "")
      }

      if (channel) {
        filters = {
          ...filters,
          channel_id: channel.id
        }
      }

      const permissionChecker = new PermissionChecker(
        "scoped",
        response.data,
        isAdmin,
        "CHANNEL",
        channel?.id
      )

      if (isAdmin || permissionChecker.canAccess("channel.space.create")) {
        spaces = await GetSpaces({ ...filters })
      } else {
        const spacesResponse = await GetSpaces({
          ...filters,
          isPublished: true
        })
        const spaceIds = (channel?.spaces || []).map((s) => s.id)
        joinedSpaces = spacesResponse.spaces.filter(
          (space) =>
            space.users &&
            space.users.some((user) => user.user_id === authUserId)
        )

        spaces = {
          ...spacesResponse,
          spaces: spacesResponse.spaces.filter(
            (space) =>
              !(
                space.users &&
                space.users.some((user) => user.user_id === authUserId)
              )
          )
        }
      }

      return {
        success: true,
        data: { channel, paginatedSpaces: spaces, joinedSpaces }
      }
    } catch (error) {
      return { error: error }
    }
  }
)

export const IsSlugAvailableAction = CreateServerAction(
  true,
  async (slug: string, channelId: string) => {
    try {
      const isAvailable = await IsSlugAvailable(slug, channelId)
      return { success: true, data: isAvailable }
    } catch (error) {
      return { error: error }
    }
  }
)

export const UpdateSpaceAction = CreateServerAction(
  true,
  async (spaceID: string, updatedData: Partial<SelectSpace>) => {
    try {
      const updatedSpace = await UpdateSpace(spaceID, updatedData)

      await pusherServer.trigger(BROADCAST_CHANNEL, "space-edit", updatedSpace)

      await pusherServer.trigger(
        "broadcast-entity-update-sidebar",
        "space-edit",
        updatedSpace
      )

      return { success: true, data: updatedSpace }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DeleteSpaceAction = CreateServerAction(
  true,
  async (deletedSpaceData: SelectSpace) => {
    try {
      await DeleteSpace(deletedSpaceData)

      await pusherServer.trigger(
        BROADCAST_CHANNEL,
        "space-del",
        deletedSpaceData
      )

      await deleteRoleBasedOnEntityType("SPACE", deletedSpaceData.id)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSpaceBySlugAction = CreateServerAction(
  true,
  async (
    spaceSlug: string,
    channelSlug?: string | null,
    withSpaceUsers?: boolean
  ) => {
    try {
      const space = await GetSpaceBySlug(spaceSlug, channelSlug, withSpaceUsers)
      return { success: true, data: space }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSpaceByIdAction = CreateServerAction(
  true,
  async (spaceId: string, withSpaceUsers?: boolean) => {
    try {
      const space = await GetSpaceById(spaceId, withSpaceUsers)
      return { success: true, data: space }
    } catch (error) {
      return { error: error }
    }
  }
)

export const AttachSpaceUserAction = CreateServerAction(
  true,
  async (spaceId: string, userId: string) => {
    try {
      const space = await GetSpaceById(spaceId, true)
      if (!space) return { success: false, error: "Space not found" }

      const existingSpaceUserIds = space.users.map((su) => su.user_id)
      if (existingSpaceUserIds.includes(userId)) {
        return { success: true, data: null } // already a member
      }

      if (!space.channel_id) {
        // Independent space (no channel/community) - skip the hierarchy
        // cascade entirely and attach the user directly to the space.
        const spaceViewerRole = await getAndAssignViewerRoles(
          userId,
          "space_viewer",
          spaceId
        )

        const newSpaceUser = await attachSpaceUser(
          spaceId,
          userId,
          null,
          spaceViewerRole?.viewerRole?.name
        )

        await pusherServer.trigger(
          `user-${userId}`,
          "update-role",
          spaceViewerRole
        )

        return { success: true, data: newSpaceUser }
      }

      const channel = await GetChannelById(space.channel_id)
      if (!channel) return { success: false, error: "Channel not found" }

      const { community_id: communityId } = channel
      const [channelUsers, communityUsers] = await Promise.all([
        getChannelUsers(space.channel_id),
        getCommunityUsers(communityId ?? "")
      ])

      const channelUserIds = channelUsers.map((cu) => cu.user_id)
      const communityUserIds = communityUsers.map((cu) => cu.user_id)

      // this will be used as a reference when we insert in the channel_user table
      let communityUserID = communityUsers.find(
        (cu) => cu.user_id === userId
      )?.id

      if (!communityUserIds.includes(userId)) {
        const communityViewerRole = await getAndAssignViewerRoles(
          userId,
          "community_viewer",
          communityId as string
        )

        const newCommunityUser = await attachCommunityUser(
          communityId as string,
          userId,
          communityViewerRole?.viewerRole?.name
        )

        communityUserID = newCommunityUser?.id
      }
      if (!communityUserID) {
        return {
          success: false,
          error: "Could not find community_user for space"
        }
      }
      if (!channelUserIds.includes(userId)) {
        const channelViewerRole = await getAndAssignViewerRoles(
          userId,
          "channel_viewer",
          space.channel_id
        )

        await attachChannelUser(
          space.channel_id,
          userId,
          communityUserID,
          channelViewerRole?.viewerRole?.name
        )
      }

      const spaceViewerRole = await getAndAssignViewerRoles(
        userId,
        "space_viewer",
        spaceId
      )

      const updatedChannelUsers = await getChannelUsers(space.channel_id)
      const channelUserId = updatedChannelUsers.find(
        (cu) => cu.user_id === userId
      )?.id

      if (!channelUserId)
        return {
          success: false,
          error: "Could not find channel_user for space"
        }

      const newSpaceUser = await attachSpaceUser(
        spaceId,
        userId,
        channelUserId,
        spaceViewerRole?.viewerRole?.name
      )

      await pusherServer.trigger(
        `user-${userId}`,
        "update-role",
        spaceViewerRole
      )

      return { success: true, data: newSpaceUser }
    } catch (error) {
      console.error("AttachSpaceUserAction failed:", error)
      return { success: false, error: "Internal server error" }
    }
  }
)

export const LeaveSpaceAction = CreateServerAction(
  true,
  async (spaceId: string, currentUserId: string) => {
    try {
      const deleted = await dettachSpaceUser(spaceId, currentUserId)

      return { success: true, data: deleted }
    } catch (error: any) {
      return { success: false, error: error.message || error }
    }
  }
)

export const DetachSpaceUserAction = CreateServerAction(
  true,
  async (spaceId: string, userId: string, roleId: number) => {
    try {
      const spaceUser = await dettachSpaceUser(spaceId, userId)
      const deleteRole = await deleteUserRole(userId, roleId)
      pusherServer.trigger(`user-${userId}`, "update-role", deleteRole)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const UpdateSpaceUserAction = CreateServerAction(
  true,
  async (
    spaceId: string,
    userId: string,
    updatedData: Partial<SelectSpaceUser>
  ) => {
    try {
      const spaceUser = await updateSpaceUser(spaceId, userId, updatedData)
      return { success: true, data: spaceUser }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSpaceUsersAction = CreateServerAction(
  true,
  async (spaceId: string) => {
    try {
      const spaceUsers = await getSpaceUsers(spaceId)
      return { success: true, data: spaceUsers }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSpaceByChannelIdsAction = CreateServerAction(
  true,
  async (channelIds: string[]) => {
    try {
      const spaces = await getSpaceByChannelId(channelIds)
      return { success: true, data: spaces }
    } catch (error) {
      return { error: error }
    }
  }
)
