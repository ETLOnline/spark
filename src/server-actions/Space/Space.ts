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
  spaceQueryFilters,
  UpdateSpace,
  updateSpaceUser
} from "@/src/db/data-access/spaces/query"
import { AblyClientRest } from "@/src/services/realtime/AblyClient"
import { CreateServerAction } from ".."
import { InsertSpace, SelectChannel, SelectSpace, SelectSpaceUser } from "@/src/db/schema"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import { AuthUserAction } from "../User/AuthUserAction"
import { isUserAdmin } from "@/src/utils/helpers"
import { GetChannelById, GetChannelBySlug, GetChannels } from "@/src/db/data-access/channels/query"

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

// export const GetSpacesAction = CreateServerAction(
//   true,
//   async (channelId: string) => {
//     try {
//       const spaces = await GetSpaces(channelId)
//       return { success: true, data: spaces }
//     } catch (error: any) {
//       return { error: error.message }
//     }
//   }
// )


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

      if(filters?.channel_slug){
         channel = await GetChannelBySlug(filters?.channel_slug || "")
      }else if(filters?.channel_id){
         channel = await GetChannelById(filters?.channel_id || "")
      }

      if (isUserAdmin(authUser)) {
        spaces = await GetSpaces({...filters})
      } else {
        spaces = await GetSpaces({...filters, space_type: "public", isPublished: true }) 
        const spaceIds = spaces.spaces.map((s)=> s.id)
        const joinedSpaces = authUser?.spaces.filter((s)=> spaceIds.includes(s.space_id))
                
      }

      // const result = await GetChannels(filters)
      return { success: true, data: {channel, paginatedSpaces: spaces, joinedSpaces}}
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
      return { success: true}
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
