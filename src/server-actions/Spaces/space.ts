"use server"

import { CreateSpace, GetSpaces } from "@/src/db/data-access/spaces/query"
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
