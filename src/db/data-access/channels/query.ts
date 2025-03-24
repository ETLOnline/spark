import { eq, or } from "drizzle-orm"
import { db } from "../.."
import { channelsTable, InsertChannel, SelectChannel } from "../../schema"

type channelQueryFilters = {
  channelType?: "public" | "private"
  ownerId?: string
}

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

export async function GetChannels(filters?: channelQueryFilters) {
  try {
    let query = db.query.channelsTable.findMany({
      with: {
        spaces: true
      }
    })

    if (filters) {
      const whereClauses = []

      if (filters.channelType) {
        whereClauses.push(eq(channelsTable.channel_type, filters.channelType))
      }

      if (filters.ownerId) {
        whereClauses.push(eq(channelsTable.ownerId, filters.ownerId))
      }

      if (whereClauses.length > 0) {
        query = db.query.channelsTable.findMany({
          where: whereClauses.length ? or(...whereClauses) : undefined,
          with: {
            spaces: {
              with: {
                features: true
              }
            }
          }
        })
      }
    }

    const channels = await query
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

export async function DeleteChannel(
  deletedChannelData: Partial<SelectChannel>
) {
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
    const searchedCount = await db.$count(
      channelsTable,
      eq(channelsTable.channel_slug, slug)
    )

    return searchedCount === 0
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetChannelBySlug(channelSlug: string) {
  try {
    const channel = await db.query.channelsTable.findFirst({
      where: eq(channelsTable.channel_slug, channelSlug),
      with: {
        spaces: {
          with: {
            features: true
          }
        }
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
        spaces: {
          with: {
            features: true
          }
        }
      }
    })
    return channel
  } catch (e: any) {
    throw new Error(e.message)
  }
}
