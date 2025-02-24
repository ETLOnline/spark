import { db } from "../..";
import { channelstable, InsertChannel } from "../../schema";

export async function CreateChannel(channelData: InsertChannel){
  try{
    const newChannel = await db.insert(channelstable).values(channelData).returning()
    return newChannel
  }catch (e: any){
    throw new Error(e.message)
  }
}

export async function GetChannels(){
  try{
    const channels = await db.select().from(channelstable)
    return channels
  }catch(e: any){
    throw new Error(e.message)
  }
}