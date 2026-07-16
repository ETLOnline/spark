import { and, eq, inArray, isNull, SQLWrapper } from "drizzle-orm"
import { db } from "../.."
import {
  channelsTable,
  InsertSpace,
  SelectSpace,
  SelectSpaceUser,
  spaceFeaturesTable,
  spacesTable,
  SpaceUsersTable
} from "../../schema"

export type spaceQueryFilters = {
  space_type?: "public" | "private"
  isPublished?: boolean
  ownerId?: string
  page?: number
  limit?: number
  channel_id?: string
  channel_slug?: string
  created_by?: string
  isIndependent?: boolean
}

export async function CreateSpace(spaceData: InsertSpace) {
  try {
    const space = await db.insert(spacesTable).values(spaceData).returning()
    return space[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

// export async function GetSpaces(channelId: string) {
//   try {
//     const spaces = await db.query.spacesTable.findMany({
//       where: eq(spacesTable.channel_id, channelId),
//       with: {
//         features: {
//           with: {
//             feature: true
//           }
//         },
//         owner: true
//       }
//     })
//     return spaces
//   } catch (error: any) {
//     throw new Error(error.message)
//   }
// }

export async function GetSpaces(filters?: spaceQueryFilters) {
  try {
    const page = filters?.page
    const limit = filters?.limit
    const offset = page && limit ? (page - 1) * limit : 0

    const whereClauses: (SQLWrapper | undefined)[] = []

    if (filters) {
      if (filters.space_type) {
        whereClauses.push(eq(spacesTable.space_type, filters.space_type))
      }

      if (filters.isPublished) {
        whereClauses.push(
          eq(spacesTable.publish_space, filters.isPublished ? 1 : 0)
        )
      }

      if (filters.ownerId) {
        whereClauses.push(eq(spacesTable.ownerId, filters.ownerId))
      }

      if (filters.channel_id) {
        whereClauses.push(eq(spacesTable.channel_id, filters.channel_id))
      }

      if (filters.created_by) {
        whereClauses.push(eq(spacesTable.created_by, filters.created_by))
      }

      if (filters.isIndependent) {
        whereClauses.push(isNull(spacesTable.channel_id))
      }
    }

    const spaces = await db.query.spacesTable.findMany({
      limit: limit,
      offset: offset,
      where: whereClauses.length ? and(...whereClauses) : undefined,
      with: {
        features: {
          with: {
            feature: true
          }
        },
        channel: true,
        users: true
      }
    })

    const totalCount = await db.$count(
      spacesTable,
      whereClauses.length ? and(...whereClauses) : undefined
    )

    return {
      spaces,
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

export async function GetSpaceBySlug(
  spaceSlug: string,
  channelSlug?: string | null,
  withSpaceUsers?: boolean
) {
  try {
    if (!channelSlug) {
      // Independent space (no channel) - look it up directly by slug.
      const space = await db.query.spacesTable.findFirst({
        where: and(
          eq(spacesTable.space_slug, spaceSlug),
          isNull(spacesTable.channel_id)
        ),
        with: {
          features: {
            with: {
              feature: true
            }
          },
          owner: true,
          users: withSpaceUsers
            ? {
                with: {
                  user: true
                }
              }
            : undefined
        }
      })
      return space ?? null
    }

    const channel = await db.query.channelsTable.findFirst({
      where: eq(channelsTable.channel_slug, channelSlug),
      with: {
        spaces: {
          where: eq(spacesTable.space_slug, spaceSlug),
          with: {
            channel: true,
            features: {
              with: {
                feature: true
              }
            },
            owner: true,
            users: withSpaceUsers
              ? {
                  with: {
                    user: true
                  }
                }
              : undefined
          }
        }
      }
    })
    if (!channel || !channel.spaces.length) {
      return null
    }
    return channel.spaces[0]
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function GetSpaceById(spaceId: string, withSpaceUsers?: boolean) {
  try {
    const space = await db.query.spacesTable.findFirst({
      where: eq(spacesTable.id, spaceId),
      with: {
        channel: true,
        features: {
          with: {
            feature: true
          }
        },
        owner: true,
        users: withSpaceUsers
          ? {
              with: {
                user: true
              }
            }
          : undefined
      }
    })
    return space
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function IsSlugAvailable(
  slug: string,
  channelId: string
): Promise<boolean> {
  try {
    const searchedSlug = await db
      .select()
      .from(spacesTable)
      .where(
        and(
          eq(spacesTable.space_slug, slug),
          eq(spacesTable.channel_id, channelId)
        )
      )
    return !searchedSlug.length
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function IsIndependentSpaceSlugAvailable(
  slug: string
): Promise<boolean> {
  try {
    const searchedSlug = await db
      .select()
      .from(spacesTable)
      .where(
        and(eq(spacesTable.space_slug, slug), isNull(spacesTable.channel_id))
      )
    return !searchedSlug.length
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function UpdateSpace(
  spaceID: string,
  updatedSpaceData: Partial<SelectSpace>
) {
  try {
    const UpdateSpace = await db
      .update(spacesTable)
      .set(updatedSpaceData)
      .where(eq(spacesTable.id, spaceID))
      .returning()
    return UpdateSpace[0]
  } catch (e: any) {
    return new Error(e.message)
  }
}

export async function DeleteSpace(deletedSpaceData: SelectSpace) {
  try {
    const deletedSpace = await db
      .delete(spacesTable)
      .where(eq(spacesTable.id, deletedSpaceData.id))
    await db
      .delete(SpaceUsersTable)
      .where(eq(SpaceUsersTable.space_id, deletedSpaceData.id))
    return deletedSpace
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function attachSpaceFeatures(
  spaceId: string,
  featureIds: number[]
) {
  try {
    const spaceFeatureList = featureIds.map((featureId) => ({
      space_id: spaceId,
      feature_id: featureId
    }))

    const spaceFeatures = await db.transaction(async (tx) => {
      await tx
        .delete(spaceFeaturesTable)
        .where(eq(spaceFeaturesTable.space_id, spaceId))
      return await tx
        .insert(spaceFeaturesTable)
        .values(spaceFeatureList)
        .returning()
    })
    const updatedSpace = await GetSpaceById(spaceId)
    return updatedSpace
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function attachSpaceUser(
  spaceId: string,
  userId: string,
  channel_user_id: number | null,
  spaceRole?: string
) {
  try {
    const spaceUser = await db
      .insert(SpaceUsersTable)
      .values({
        space_id: spaceId,
        user_id: userId,
        channel_user_id: channel_user_id,
        role: spaceRole
      })
      .returning()
    return spaceUser
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function dettachSpaceUser(spaceId: string, userId: string) {
  try {
    const spaceUser = await db
      .delete(SpaceUsersTable)
      .where(
        and(
          eq(SpaceUsersTable.space_id, spaceId),
          eq(SpaceUsersTable.user_id, userId)
        )
      )
    return spaceUser
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function updateSpaceUser(
  spaceId: string,
  userId: string,
  updatedData: Partial<SelectSpaceUser>
) {
  try {
    const spaceUser = await db
      .update(SpaceUsersTable)
      .set(updatedData)
      .where(
        and(
          eq(SpaceUsersTable.space_id, spaceId),
          eq(SpaceUsersTable.user_id, userId)
        )
      )
      .returning()
    return spaceUser[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getSpaceUsers(spaceId: string) {
  try {
    const spaceUsers = await db.query.SpaceUsersTable.findMany({
      where: eq(SpaceUsersTable.space_id, spaceId),
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
    return spaceUsers
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getSpaceByChannelId(channelIds: string[]) {
  try {
    const spaces = await db.query.spacesTable.findMany({
      where: inArray(spacesTable.channel_id, channelIds)
    })
    return spaces
  } catch (e: any) {
    throw new Error(e.message)
  }
}
