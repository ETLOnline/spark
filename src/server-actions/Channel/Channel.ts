"use server"

import {
  CreateChannel,
  DeleteChannel,
  GetChannels,
  UpdateChannel,
  IsSlugAvailable,
  GetChannelBySlug,
  GetChannelById,
  attachChannelUser,
  dettachChannelUser,
  updateChannelUser,
  getChannelUsers,
  channelQueryFilters,
  getChannelsByCommunityId
} from "@/src/db/data-access/channels/query"
import { CreateServerAction } from ".."
import {
  InsertChannel,
  SelectChannel,
  SelectChannelUser
} from "@/src/db/schema"
import { AblyClientRest } from "@/src/services/realtime/AblyClient"
import { AuthUserAction } from "../User/AuthUserAction"
import { isSuperAdmin } from "@/src/utils/helpers"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import {
  createScopedChannelRolesAndAssignAdmin,
  deleteUserRole,
  getAndAssignViewerRoles
} from "@/src/db/data-access/roles/query"
import { GetUserPermissionsParsedAction } from "../UserRoles/UserRole"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { ensureCommunityMembership } from "../Community/Community"
import pusherServer from "@/src/services/realtime/pusherServer"
import { deleteRoleBasedOnEntityType } from "../CommonHelper/Helper"

export const CreateChannelAction = CreateServerAction(
  true,
  async (channelData: InsertChannel) => {
    try {
      const newChannel = await CreateChannel(channelData)
      const channel = AblyClientRest.channels.get(
        "broadcast-channels-spaces-update"
      )
      await channel.publish("channel-add", newChannel)
      const result = await createScopedChannelRolesAndAssignAdmin(
        newChannel.id,
        newChannel.channel_name,
        newChannel.created_by
      )
      await attachChannelUser(
        newChannel.id,
        newChannel.created_by,
        result.adminRole?.name
      )
      const channelWithUsers = await GetChannelById(newChannel.id, true)
      return { success: true, data: channelWithUsers }
    } catch (error) {
      return { error: error }
    }
  }
)

export interface GetChannelsResponseType {
  channels: SelectChannel[]
  pagination: PaginationType
}
export const GetChannelsAction = CreateServerAction(
  true,
  async (filters?: channelQueryFilters) => {
    try {
      const authUser = await AuthUserAction()
      const isAdmin = await isSuperAdmin(authUser)

      const response = await GetUserPermissionsParsedAction(authUser.unique_id)

      if (!response.success) {
        return { error: response.error }
      }

      const permissionChecker = new PermissionChecker(
        "scoped",
        response.data,
        isAdmin,
        "COMMUNITY",
        filters?.communityId
      )

      let channels: GetChannelsResponseType
      let joinedChannels: SelectChannel[] = []

      if (isAdmin || permissionChecker.canAccess("community.channel.create")) {
        channels = await GetChannels({ ...filters })
      } else {
        channels = await GetChannels({
          ...filters,
          isPublished: true
        })
        const authUserId = authUser?.unique_id
        joinedChannels = []
      }

      // const result = await GetChannels(filters)
      return { success: true, data: channels, joinedChannels }
    } catch (error) {
      return { error: error }
    }
  }
)

export const UpdateChannelAction = CreateServerAction(
  true,
  async (channelID: string, updatedData: Partial<SelectChannel>) => {
    try {
      const updatedChannel = await UpdateChannel(channelID, updatedData)
      const channel = AblyClientRest.channels.get(
        "broadcast-channels-spaces-update"
      )
      await channel.publish("channel-edit", updatedChannel)
      return { success: true, data: updatedChannel }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DeleteChannelAction = CreateServerAction(
  true,
  async (deletedChannelData: SelectChannel) => {
    try {
      await DeleteChannel(deletedChannelData)
      const channel = AblyClientRest.channels.get(
        "broadcast-channels-spaces-update"
      )
      await channel.publish("channel-del", deletedChannelData)
      await deleteRoleBasedOnEntityType("CHANNEL", deletedChannelData.id)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const IsSlugAvailableAction = CreateServerAction(
  true,
  async (slug: string) => {
    try {
      const isAvailable = await IsSlugAvailable(slug)
      return { success: true, data: isAvailable }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetChannelBySlugAction = CreateServerAction(
  true,
  async (slug: string) => {
    try {
      const channel = await GetChannelBySlug(slug)
      return { success: true, data: channel }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetChannelByIdAction = CreateServerAction(
  true,
  async (id: string, withChannelUsers?: boolean) => {
    try {
      const channel = await GetChannelById(id, withChannelUsers)
      return { success: true, data: channel }
    } catch (error) {
      return { error: error }
    }
  }
)

export const AttachChannelUserAction = CreateServerAction(
  true,
  async (channelId: string, userId: string) => {
    try {
      // get channel by id and attach user
      const channel = await GetChannelById(channelId)

      if (!channel) {
        return { success: false, error: "Channel not found" }
      }
      const attachUserRole = await getAndAssignViewerRoles(
        userId,
        "channel_viewer",
        channelId
      )
      const channelUser = await attachChannelUser(
        channelId,
        userId,
        attachUserRole?.viewerRole?.name
      )
      if (channel?.community_id) {
        await ensureCommunityMembership(channel.community_id, userId)
      }
      pusherServer.trigger(`user-${userId}`, "update-role", attachUserRole)
      return { success: true, data: channelUser }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DettachChannelUserAction = CreateServerAction(
  true,
  async (channelId: string, userId: string, roleId: number) => {
    try {
      const channelUser = await dettachChannelUser(channelId, userId)
      const deleteRole = await deleteUserRole(userId, roleId)
      pusherServer.trigger(`user-${userId}`, "update-role", deleteRole)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const UpdateChannelUserAction = CreateServerAction(
  true,
  async (
    channelId: string,
    userId: string,
    updatedData: Partial<SelectChannelUser>
  ) => {
    try {
      const updatedChannelUser = await updateChannelUser(
        channelId,
        userId,
        updatedData
      )
      return { success: true, data: updatedChannelUser }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetChannelUsersAction = CreateServerAction(
  true,
  async (channelId: string) => {
    try {
      const channelUsers = await getChannelUsers(channelId)
      return { success: true, data: channelUsers }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetChannelsByCommunityIdAction = CreateServerAction(
  true,
  async (communityId: string) => {
    try {
      const channels = await getChannelsByCommunityId(communityId)
      return { success: true, data: channels }
    } catch (error) {
      return { error: error }
    }
  }
)
