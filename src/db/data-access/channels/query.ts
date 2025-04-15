import { ChannelUsersTable, SelectChannelUser } from './../../schema';
import { and, eq, or, sql, SQLWrapper } from "drizzle-orm"
import { db } from "../.."
import { channelsTable, InsertChannel, SelectChannel } from "../../schema"

export type channelQueryFilters = {
  channelType?: "public" | "private"
  isPublished?: boolean
  ownerId?: string
  page?: number
  limit?: number
}

export async function CreateChannel(channelData: InsertChannel) {
  try {
    const newChannel = await db
      .insert(channelsTable)
      .values(channelData)
      .returning()
    return newChannel[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetChannels(filters?: channelQueryFilters) {
  try {
    const page = filters?.page 
    const limit = filters?.limit 
    const offset = page && limit ? (page - 1) * limit :0

    const whereClauses:(SQLWrapper | undefined)[] = []

    if (filters) {

      if (filters.channelType) {
        whereClauses.push(eq(channelsTable.channel_type, filters.channelType))
      }

      if (filters.isPublished) {
        whereClauses.push(eq(channelsTable.publish_channel, filters.isPublished ? 1 : 0))
      }

      if (filters.ownerId) {
        whereClauses.push(eq(channelsTable.ownerId, filters.ownerId))
      }

    } 
    
    const channels = await db.query.channelsTable.findMany({
      limit: limit,
      offset: offset,
      where: whereClauses.length ? and(...whereClauses) : undefined,
      with: {
        spaces: {
          with: {
            features: true
          }
        }
      }
    })

    const totalCount = await db.$count(
      channelsTable,
      whereClauses.length ? and(...whereClauses) : undefined
    )

    return {
      channels,
      pagination: {
        total: Number(totalCount),
        page: page || 1,
        limit: limit || 0,
        totalPages: limit && limit !== 0 ?  Math.ceil(Number(totalCount) / limit) : 1 
      }
    }
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

export async function GetChannelById(id: string, withChannelUsers?: boolean) {
  try {
    const channel = await db.query.channelsTable.findFirst({
      where: eq(channelsTable.id, id),
      with: {
        spaces: {
          with: {
            features: true
          },
        },
        users: withChannelUsers ? {
          with: {
            user: true
          }
        } : undefined

      }
    })
    return channel
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function attachChannelUser(channelId: string, userId: string) {
  try{
    const spaceUser = await db.insert(ChannelUsersTable).values({
      channel_id: channelId,
      user_id: userId
    }).returning()
    return spaceUser
  }
  catch (e: any) {
    throw new Error(e.message)
  }
}

export async function dettachChannelUser(channelId: string, userId: string) {
  try{
    const spaceUser = await db.delete(ChannelUsersTable).where(
      and(
        eq(ChannelUsersTable.channel_id, channelId),
        eq(ChannelUsersTable.user_id, userId)
      )
    )
    return spaceUser
  }
  catch (e: any) {
    throw new Error(e.message)
  }
}

export async function updateChannelUser(channelId: string, userId: string, updatedData: Partial<SelectChannelUser>) {
  try{
    const channelUser = await db.update(ChannelUsersTable).set(updatedData).where(
      and(
        eq(ChannelUsersTable.channel_id, channelId),
        eq(ChannelUsersTable.user_id, userId)
      )
    ).returning()
    return channelUser
  }
  catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getChannelUsers(channelId: string) {
  try{
    const channelUsers = await db.query.ChannelUsersTable.findMany({
      where: eq(ChannelUsersTable.channel_id, channelId),
      with: {
        user: true
      }
    })
    return channelUsers
  }
  catch (e: any) {
    throw new Error(e.message)
  }
}