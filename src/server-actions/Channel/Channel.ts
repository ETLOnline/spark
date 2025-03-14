"use server"

import {
  CreateChannel,
  DeleteChannel,
  GetPublicChannels,
  UpdateChannel,
  IsSlugAvailable,
  GetPublicChannelPaths,
  GetChannelBySlug,
  GetChannelById
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
        "boradcast-channels-spaces-update"
      )
      await channel.publish("channel", newChannel[0])
      return { success: true, data: newChannel }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetChannelsAction = CreateServerAction(true, async () => {
  try {
    const channels = await GetPublicChannels()
    return { success: true, data: channels }
  } catch (error) {
    return { error: error }
  }
})

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
      const updateChannel = await UpdateChannel(channelID, updatedData)
      return { success: true, data: updateChannel }
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
