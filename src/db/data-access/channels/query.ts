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

export async function GetChannels() {
  try {
    const channels = await db.query.channelsTable.findMany({
      with: {
        spaces: true
      }
    })
    return channels
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetPublicChannelPaths() {
  try {
    const channels = await db.query.channelsTable.findMany({
      where: eq(channelsTable.channel_type, "public"),
      columns: {
        channel_name: true,
        channel_slug: true
      },
      with: {
        spaces: { columns: { space_name: true, space_slug: true } }
      }
    })
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
    await db
      .delete(channelsTable)
      .where(eq(channelsTable.id, deletedChannelData.id))
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function IsSlugAvailable(slug: string): Promise<boolean> {
  try {
    const searchedSlug = await db
      .select()
      .from(channelsTable)
      .where(eq(channelsTable.channel_slug, slug))
    return !searchedSlug.length
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetChannelBySlug(channelSlug: string) {
  try {
    const channel = await db.query.channelsTable.findFirst({
      where: eq(channelsTable.channel_slug, channelSlug),
      with: {
        spaces: true
      }
    })
    return channel
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetChannelById(id: string) {
  try {
    const channel = await db.query.channelsTable.findFirst({
      where: eq(channelsTable.id, id),
      with: {
        spaces: true
      }
    })
    return channel
  } catch (e: any) {
    throw new Error(e.message)
  }
}
