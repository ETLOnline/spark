'use server'
import { CreateChannel, GetChannels } from "@/src/db/data-access/channels/query";
import { CreateServerAction } from "..";
import { InsertChannel } from "@/src/db/schema";

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