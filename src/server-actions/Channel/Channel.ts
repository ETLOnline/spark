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
  channelQueryFilters
} from "@/src/db/data-access/channels/query"
import { CreateServerAction } from ".."
import {
  InsertChannel,
  SelectChannel,
  SelectChannelUser
} from "@/src/db/schema"
import { AblyClientRest } from "@/src/services/realtime/AblyClient"
import { AuthUserAction } from "../User/AuthUserAction"
import { isUserAdmin } from "@/src/utils/helpers"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import {
  createScopedChannelRolesAndAssignAdmin,
  deleteUserRole,
  getAndAssignViewerRoles
} from "@/src/db/data-access/roles/query"

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
      return { success: true, data: newChannel }
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
      let channels: GetChannelsResponseType
      let joinedChannels: SelectChannel[] = []
      if (isUserAdmin(authUser)) {
        channels = await GetChannels({ ...filters })
      } else {
        const channelsResponse = await GetChannels({
          ...filters,
          channelType: "public",
          isPublished: true
        })
        joinedChannels = authUser?.channels
          .map((uc) => uc.channel)
          .filter((c) => c.publish_channel === 1)
          .filter((c) => typeof c !== "undefined")

        // Get the IDs of joined spaces for exclusion
        const joinedSpaceIds = joinedChannels.map((s) => s.id)

        // Filter out joined spaces from the spaces array
        channels = {
          ...channelsResponse,
          channels: channelsResponse.channels.filter(
            (channel) => !joinedSpaceIds.includes(channel.id)
          )
        }
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
  async (id: string) => {
    try {
      const channel = await GetChannelById(id)
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
