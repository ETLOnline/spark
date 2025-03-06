import { eq } from "drizzle-orm"
import { db } from "../.."
import { channelsTable, InsertChannel, SelectChannel } from "../../schema"

export async function CreateChannel(channelData: InsertChannel) {
  try {
    const newChannel = await db
      .insert(channelsTable)
      .values(channelData)
      .returning()
    return newChannel
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetPublicChannels() {
  try {
    const channels = await db
      .select()
      .from(channelsTable)
      .where(eq(channelsTable.channel_type, "public"))
    return channels
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function UpdateChannel(
  channelID: string,
  updatedChannelData: Partial<SelectChannel>
) {
  try {
    const updatedChannel = await db
      .update(channelsTable)
      .set(updatedChannelData)
      .where(eq(channelsTable.id, channelID))
      .returning()
    return updatedChannel[0]
  } catch (e: any) {
    return new Error(e.message)
  }
}

export async function DeleteChannel(deletedChannelData: SelectChannel) {
  try {
    if (!deletedChannelData.id) {
      throw new Error("Channel ID is required")
    }
    const deleteChannel = await db
      .delete(channelsTable)
      .where(eq(channelsTable.id, deletedChannelData.id))
  } catch (e: any) {
    throw new Error(e.message)
  }
}
