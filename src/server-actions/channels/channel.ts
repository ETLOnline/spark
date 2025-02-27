'use server'
import { CreateChannel, DeleteChannel, GetChannels, UpdateChannel } from "@/src/db/data-access/channels/query";
import { CreateServerAction } from "..";
import { InsertChannel, SelectChannel } from "@/src/db/schema";

export const CreateChannelAction = CreateServerAction(true, async (channelData: InsertChannel)=>{
  try{
    const newChannel = await CreateChannel(channelData)
    return { success: true, data : newChannel }
  }catch(error){
    return {error: error}
  }
})

export const GetChannelsAction = CreateServerAction(true, async () =>{
  try{
    const channels = await GetChannels()
    return{success: true, data: channels}
  }catch(error){
    return {error: error}
  }
})

export const UpdateChannelAction = CreateServerAction(true, async (channelID: string ,updatedData: Partial<SelectChannel>)=>{
  try{
    const updateChannel = await UpdateChannel(channelID, updatedData)
    return{success: true, data: updateChannel}
  }catch(error){
    return{error: error}
  }
})

export const DeleteChannelAction = CreateServerAction(true, async (deletedChannelData: SelectChannel)=>{
  try{
    await DeleteChannel(deletedChannelData)
    return{success: true}
  }catch(error){
    return{error:error}
  }
})