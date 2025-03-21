"use server"

import {
  CreateChannel,
  DeleteChannel,
  GetChannels,
  UpdateChannel,
  IsSlugAvailable,
  GetPublicChannelPaths,
  GetChannelBySlug,
  GetChannelById,
  GetChannelIdBySlug
} from "@/src/db/data-access/channels/query"
import { CreateServerAction } from ".."
import { InsertChannel, SelectChannel } from "@/src/db/schema"
import { AblyClientRest } from "@/src/services/realtime/AblyClient"

export const CreateChannelAction = CreateServerAction(
  true,
  async (channelData: InsertChannel) => {
    try {
      const newChannel = await CreateChannel(channelData)
      const channel = AblyClientRest.channels.get(
        "broadcast-channels-spaces-update"
      )
      await channel.publish("channel-add", newChannel[0])
      return { success: true, data: newChannel }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetChannelsAction = CreateServerAction(
  true,
  async (channelType?: "public" | "private", ownerId?: string) => {
    try {
      const channels = await GetChannels({ channelType, ownerId })
      return { success: true, data: channels }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetChannelPathsAction = CreateServerAction(true, async () => {
  try {
    const channelPaths = await GetPublicChannelPaths()
    return { success: true, data: channelPaths }
  } catch (error) {
    return { error: error }
  }
})

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

export const GetChannelIdBySlugAction = CreateServerAction(
  true,
  async (slug: string) => {
    try {
      const channelId = await GetChannelIdBySlug(slug)
      return { success: true, data: channelId }
    } catch (error) {
      return { error: error }
    }
  }
)
