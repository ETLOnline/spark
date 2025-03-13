"use server"

import {
  CreateSpace,
  GetSpaces,
  IsSlugAvailable
} from "@/src/db/data-access/spaces/query"
import { CreateServerAction } from ".."
import { InsertSpace } from "@/src/db/schema"
import { AblyClientRest } from "@/src/services/realtime/AblyClient"

export const CreateSpaceAction = CreateServerAction(
  true,
  async (SpaceData: InsertSpace) => {
    try {
      const newSpace = await CreateSpace(SpaceData)
      const channel = AblyClientRest.channels.get("channels-spaces")
      await channel.publish("space", newSpace[0])
      return { success: true, data: newSpace }
    } catch (error: any) {
      return {
        error: error
      }
    }
  }
)

export const GetSpacesAction = CreateServerAction(
  true,
  async (channelId: string) => {
    try {
      const spaces = await GetSpaces(channelId)
      return { success: true, data: spaces }
    } catch (error: any) {
      return { error: error.message }
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
