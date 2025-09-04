import { ChannelUsersTable, SelectChannelUser } from "./../../schema"
import { and, asc, eq, or, sql, SQLWrapper, inArray } from "drizzle-orm"
import { db } from "../.."
import {
  channelsTable,
  InsertChannel,
  SelectChannel,
  spacesTable,
  projectTable,
  ProjectUsersTable,
  SpaceUsersTable,
  rolesTable,
  userRolesTable
} from "../../schema"

export type channelQueryFilters = {
  channelType?: "public" | "private"
  isPublished?: boolean
  ownerId?: string
  page?: number
  limit?: number
  communityId?: string
}

export async function CreateChannel(channelData: InsertChannel) {
  try {
    const newChannel = await db
      .insert(channelsTable)
      .values(channelData)
      .returning()

    return newChannel[0]
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message)
  }
}

export async function GetChannels(filters?: channelQueryFilters) {
  try {
    const communityId = filters?.communityId
    const page = filters?.page
    const limit = filters?.limit
    const offset = page && limit ? (page - 1) * limit : 0

    const whereClauses: (SQLWrapper | undefined)[] = []

    if (filters) {
      if (filters.channelType) {
        whereClauses.push(eq(channelsTable.channel_type, filters.channelType))
      }

      if (filters.isPublished) {
        whereClauses.push(
          eq(channelsTable.publish_channel, filters.isPublished ? 1 : 0)
        )
      }

      if (communityId) {
        whereClauses.push(eq(channelsTable.community_id, communityId))
      }

      if (filters.ownerId) {
        whereClauses.push(eq(channelsTable.ownerId, filters.ownerId))
      }
    }

    const channels = await db.query.channelsTable.findMany({
      limit: limit,
      offset: offset,
      where: whereClauses.length ? and(...whereClauses) : undefined,
      orderBy: [asc(channelsTable.channel_name)],
      with: {
        spaces: {
          with: {
            features: true
          }
        },
        users: {
          with: {
            user: true
          }
        },
        community: true
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
        totalPages:
          limit && limit !== 0 ? Math.ceil(Number(totalCount) / limit) : 1
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

    await db
      .delete(ChannelUsersTable)
      .where(eq(ChannelUsersTable.channel_id, deletedChannelData.id))
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
        },
        users: true,
        community: true
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
          }
        },
        users: withChannelUsers
          ? {
              with: {
                user: true
              }
            }
          : undefined,
        community: true
      }
    })
    return channel
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function attachChannelUser(
  channelId: string,
  userId: string,
  user_role?: string
) {
  try {
    const existingChannelUser = await db
      .select()
      .from(ChannelUsersTable)
      .where(
        and(
          eq(ChannelUsersTable.channel_id, channelId),
          eq(ChannelUsersTable.user_id, userId)
        )
      )
      .limit(1)
    if (existingChannelUser.length > 0) {
      console.log(
        `User ${userId} already exists in channel ${channelId}. Returning existing record.`
      )
      return existingChannelUser[0]
    }
    const newChannelUser = await db
      .insert(ChannelUsersTable)
      .values({
        channel_id: channelId,
        user_id: userId,
        role: user_role
      })
      .returning()
    if (newChannelUser.length > 0) {
      return newChannelUser[0]
    } else {
      throw new Error(
        "Failed to attach channel user: No record returned after insertion."
      )
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function dettachChannelUser(channelId: string, userId: string) {
  try {
    const spaceUser = await db
      .delete(ChannelUsersTable)
      .where(
        and(
          eq(ChannelUsersTable.channel_id, channelId),
          eq(ChannelUsersTable.user_id, userId)
        )
      )
    return spaceUser
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function updateChannelUser(
  channelId: string,
  userId: string,
  updatedData: Partial<SelectChannelUser>
) {
  try {
    const channelUser = await db
      .update(ChannelUsersTable)
      .set(updatedData)
      .where(
        and(
          eq(ChannelUsersTable.channel_id, channelId),
          eq(ChannelUsersTable.user_id, userId)
        )
      )
      .returning()
    return channelUser[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getChannelUsers(channelId: string) {
  try {
    const channelUsers = await db.query.ChannelUsersTable.findMany({
      where: eq(ChannelUsersTable.channel_id, channelId),
      with: {
        user: {
          with: {
            roles: {
              with: {
                role: true
              }
            }
          }
        }
      }
    })
    return channelUsers
  } catch (e: any) {
    throw new Error(e.message)
  }
}

// New helpers: used by server actions to remove user from spaces/projects
export async function getSpaceIdsByChannel(
  channelId: string
): Promise<string[]> {
  try {
    const spaces = await db.query.spacesTable.findMany({
      where: eq(spacesTable.channel_id, channelId),
      columns: { id: true }
    })
    return spaces.map((s: any) => s.id)
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function bulkDeleteSpaceUsers(spaceIds: string[], userId: string) {
  try {
    if (!spaceIds || spaceIds.length === 0) return
    return await db
      .delete(SpaceUsersTable)
      .where(
        and(
          inArray(SpaceUsersTable.space_id, spaceIds),
          eq(SpaceUsersTable.user_id, userId)
        )
      )
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getProjectIdsBySpaceIds(
  spaceIds: string[]
): Promise<string[]> {
  try {
    if (!spaceIds || spaceIds.length === 0) return []
    const projects = await db
      .select({ id: projectTable.id })
      .from(projectTable)
      .where(inArray(projectTable.space_id, spaceIds))

    return projects.map((p: any) => p.id)
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function bulkDeleteProjectUsers(
  projectIds: string[],
  userId: string
) {
  try {
    if (!projectIds || projectIds.length === 0) return
    return await db
      .delete(ProjectUsersTable)
      .where(
        and(
          inArray(ProjectUsersTable.project_id, projectIds),
          eq(ProjectUsersTable.user_id, userId)
        )
      )
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getProjectRoleIdsByProjectIds(
  projectIds: string[]
): Promise<string[]> {
  try {
    if (!projectIds || projectIds.length === 0) return []
    const projectRoles = await db
      .select({ id: rolesTable.id })
      .from(rolesTable)
      .where(
        and(
          eq(rolesTable.entity_type, "PROJECT"),
          inArray(rolesTable.entity_id, projectIds)
        )
      )

    return projectRoles.map((r: any) => r.id)
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function bulkDeleteUserRolesByRoleIds(
  roleIds: string[],
  userId: string
) {
  try {
    if (!roleIds || roleIds.length === 0) return
    return await db.delete(userRolesTable).where(
      and(
        // Convert string IDs to numbers since role_id is a number column
        inArray(
          userRolesTable.role_id,
          roleIds.map((id) => parseInt(id, 10))
        ),
        eq(userRolesTable.user_id, userId)
      )
    )
  } catch (e: any) {
    throw new Error(e.message)
  }
}

/**
 * Gets all roles for a user with entity information
 * Used for finding and cleaning up entity-specific roles
 */
export async function getUserRolesWithEntities(userId: string) {
  try {
    const userRoles = await db.query.userRolesTable.findMany({
      where: eq(userRolesTable.user_id, userId),
      with: {
        role: true
      }
    })
    return userRoles
  } catch (e: any) {
    throw new Error(e.message)
  }
}
