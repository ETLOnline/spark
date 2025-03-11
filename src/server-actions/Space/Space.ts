"use server"

import {
  CreateSpace,
  GetSpaces,
  GetSpacesBySlug,
  IsSlugAvailable
} from "@/src/db/data-access/spaces/query"
import { CreateServerAction } from ".."
import { InsertSpace } from "@/src/db/schema"

export const CreateSpaceAction = CreateServerAction(
  true,
  async (SpaceData: InsertSpace) => {
    try {
      const newSpace = await CreateSpace(SpaceData)
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

export const GetSpacesBySlugAction = CreateServerAction(
  true,
  async (channelSlug: string) => {
    try {
      const spaces = await GetSpacesBySlug(channelSlug)
      return { success: true, data: spaces }
    } catch (error: any) {
      return { error: error.message }
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
