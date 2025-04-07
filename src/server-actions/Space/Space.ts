"use server"

import {
  attachSpaceUser,
  CreateSpace,
  DeleteSpace,
  dettachSpaceUser,
  GetSpaceById,
  GetSpaceBySlug,
  GetSpaces,
  getSpaceUsers,
  IsSlugAvailable,
  UpdateSpace,
  updateSpaceUser
} from "@/src/db/data-access/spaces/query"
import { AblyClientRest } from "@/src/services/realtime/AblyClient"
import { CreateServerAction } from ".."
import { InsertSpace, SelectSpace, SelectSpaceUser } from "@/src/db/schema"

export const CreateSpaceAction = CreateServerAction(
  true,
  async (SpaceData: InsertSpace) => {
    try {
      const newSpace = await CreateSpace(SpaceData)
      const channel = AblyClientRest.channels.get(
        "broadcast-channels-spaces-update"
      )
      await channel.publish("space-add", newSpace)
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

export const UpdateSpaceAction = CreateServerAction(
  true,
  async (spaceID: string, updatedData: Partial<SelectSpace>) => {
    try {
      const updatedSpace = await UpdateSpace(spaceID, updatedData)
      const channel = AblyClientRest.channels.get(
        "broadcast-channels-spaces-update"
      )
      await channel.publish("space-edit", updatedSpace)
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
      const channel = AblyClientRest.channels.get(
        "broadcast-channels-spaces-update"
      )
      await channel.publish("space-del", deletedSpaceData)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSpaceBySlugAction = CreateServerAction(
  true,
  async (spaceSlug: string, channelSlug: string) => {
    try {
      const space = await GetSpaceBySlug(spaceSlug, channelSlug)
      return { success: true, data: space }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSpaceByIdAction = CreateServerAction(
  true,
  async (spaceId:string, withSpaceUsers?:boolean) => {
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
      const spaceUser = await attachSpaceUser(spaceId, userId)
      return { success: true, data: spaceUser }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DetachSpaceUserAction = CreateServerAction(
  true,
  async (spaceId: string, userId: string) => {
    try {
      const spaceUser = await dettachSpaceUser(spaceId, userId)
      return { success: true, data: spaceUser }
    } catch (error) {
      return { error: error }
    }
  }
)

export const UpdateSpaceUserAction = CreateServerAction(
  true,
  async (spaceId: string, userId: string, updatedData: Partial<SelectSpaceUser>) => {
    try{
      const spaceUser = await updateSpaceUser(spaceId, userId, updatedData)
      return { success: true, data: spaceUser }
    }
    catch (error) {
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
