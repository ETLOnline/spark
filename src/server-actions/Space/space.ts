"use server"

import { CreateSpace, DeleteSpace, GetSpaces, UpdateSpace } from "@/src/db/data-access/spaces/query"
import { CreateServerAction } from ".."
import { InsertSpace, SelectSpace } from "@/src/db/schema"

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

export const UpdateSpaceAction = CreateServerAction(
  true,
  async (spaceID: string, updatedData: Partial<SelectSpace>) => {
    try {
      const updateSapce = await UpdateSpace(spaceID, updatedData)
      return { success: true, data: updateSapce }
    } catch (error) {
      return { error: error }
    }
  }
)


export const DeleteSpaceAction = CreateServerAction( true, async (deleteSpaceData: SelectSpace)=>{
  try{
     await DeleteSpace(deleteSpaceData)
    return{success: true}
  }catch(error){
    return { error: error}
  }
})