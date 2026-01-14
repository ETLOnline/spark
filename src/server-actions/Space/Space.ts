"use server"

import {
  attachSpaceUser,
  CreateSpace,
  DeleteSpace,
  dettachSpaceUser,
  getSpaceByChannelId,
  GetSpaceById,
  GetSpaceBySlug,
  GetSpaces,
  getSpaceUsers,
  IsSlugAvailable,
  spaceQueryFilters,
  UpdateSpace,
  updateSpaceUser
} from "@/src/db/data-access/spaces/query"
import { CreateServerAction } from ".."
import {
  InsertSpace,
  SelectChannel,
  SelectSpace,
  SelectSpaceUser
} from "@/src/db/schema"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import { AuthUserAction } from "../User/AuthUserAction"
import { isSuperAdmin } from "@/src/utils/helpers"
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
import { deleteShortcutsByUrlAction, UpdateShortcutTitleAction } from "../Shortcut/Shortcut"

// Define the broadcast channel name constant for cleaner code
const BROADCAST_CHANNEL = "broadcast-channels-spaces-update";

export const CreateSpaceAction = CreateServerAction(
  true,
  async (SpaceData: InsertSpace) => {
    try {
      const overview = defaultSpaceOverviewTemplate(SpaceData.space_name)
      const newSpace = await CreateSpace({ ...SpaceData, overview: overview })
      
      await pusherServer.trigger(BROADCAST_CHANNEL, "space-add", newSpace);

      const result = await createScopedSpaceRolesAndAssignAdmin(
        newSpace.id,
        newSpace.space_name,
        newSpace.created_by
      )

      const channelUsersAfter = await getChannelUsers(SpaceData?.channel_id)

      const channel_user_id = channelUsersAfter.find(
        (cu) => cu.user_id === newSpace.created_by
      )?.id
      await attachSpaceUser(
        newSpace.id,
        newSpace.created_by,
        channel_user_id as number,
        result.adminRole?.name
      )
      return { success: true, data: newSpace }
    } catch (error: any) {
      return {
        error: error
      }
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
      if (updatedSpace instanceof Error) {
        throw updatedSpace
      }
      await UpdateShortcutTitleAction(spaceID,"space", updatedSpace?.space_name)
      
      await pusherServer.trigger(BROADCAST_CHANNEL, "space-edit", updatedSpace);

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
      
      await pusherServer.trigger(BROADCAST_CHANNEL, "space-del", deletedSpaceData);

      await deleteRoleBasedOnEntityType("SPACE", deletedSpaceData.id)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSpaceBySlugAction = CreateServerAction(
  true,
  async (spaceSlug: string, channelSlug: string, withSpaceUsers?: boolean) => {
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

      if (!space.channel_id)
        return { success: false, error: "Space has no associated channel" }

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


export const DetachSpaceUserAction = CreateServerAction(
  true,
  async (spaceId: string, userId: string, roleId: number) => {
    try {
     
      const space = await GetSpaceById(spaceId, false)
      
      const spaceUser = await dettachSpaceUser(spaceId, userId)
      const deleteRole = await deleteUserRole(userId, roleId)
      
      if (space?.space_slug) {
        await deleteShortcutsByUrlAction(userId, "space", `${space.channel.channel_slug}/spaces/${space.space_slug}`)
      }
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
