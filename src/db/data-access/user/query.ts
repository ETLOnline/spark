import { and, eq, ilike, inArray, SQL, sql, SQLWrapper } from "drizzle-orm"
import { db } from "../.."
import {
  InsertUser,
  rolesTable,
  userContactsTable,
  userRolesTable,
  usersTable
} from "../../schema"

export interface GetUserFilters {
  userId?: string
  userIds?: string[]
  email?: string
}

export async function CreateUser(data: InsertUser) {
  await db.insert(usersTable).values(data)
}

export async function SelectUserByExternalId(id: string) {
  const user = await db.query.usersTable.findFirst({
    columns: {
      first_name: true,
      last_name: true,
      email: true,
      external_auth_id: true,
      profile_url: true,
      cover_image: true,
      unique_id: true,
      role: true,
      meta_profile: true
    },
    where: eq(usersTable.external_auth_id, id),
    with: {
      roles: {
        with: {
          role: true
        }
      },
      profile: true,
      certificates: true
    }
  })

  return user
}

export async function SelectUserByEmail(email: string) {
  return await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email)
  })
}

export async function SelectUserByUniqueId(unique_id: string) {
  return await db.query.usersTable.findFirst({
    where: eq(usersTable.unique_id, unique_id),
    with: {
      profile: true,
      roles: {
        with: {
          role: true
        }
      }
    }
  })
}

export async function FindUserWildCard(wildcard: string) {
  try {
    const users = await db.query.usersTable.findMany({
      columns: {
        first_name: true,
        last_name: true,
        email: true,
        external_auth_id: true,
        profile_url: true,
        cover_image: true,
        unique_id: true,
        role: true,
        meta_profile: true
      },
      with: {
        profile: true,
        roles: {
          with: {
            role: true
          }
        }
      },
      where: (usersTable, { or }) =>
        or(
          ilike(
            sql`trim(${usersTable.first_name}) || ' ' || trim(${usersTable.last_name})`,
            `%${wildcard.trim()}%`
          )
        )
    })
    return users
  } catch (error: any) {
    throw new Error(error.message as string)
  }
}

export const GetUserProfileData = async (userId: string) => {
  const result = await db.query.usersTable.findFirst({
    where: eq(usersTable.unique_id, userId),
    with: {
      userActivities: {
        with: {
          activity: true
        }
      },
      userRewards: {
        with: {
          reward: true
        }
      },
      userTags: {
        with: {
          tag: true
        }
      },
      recommendations: {
        with: {
          recommender: {
            columns: {
              first_name: true,
              last_name: true
            }
          }
        }
      }
    }
  })
  return {
    recommendations: result?.recommendations || [],
    activities: result?.userActivities.map((ua) => ua.activity) || [],
    rewards: result?.userRewards.map((ur) => ur.reward) || [],
    tags: result?.userTags.map((ut) => ut.tag) || []
  }
}

export const UpdateUserProfilePicture = async (
  userId: string,
  profileUrl: string
) => {
  try {
    const updatedUser = await db
      .update(usersTable)
      .set({
        profile_url: profileUrl
      })
      .where(eq(usersTable.unique_id, userId))
      .returning()

    return updatedUser[0]
  } catch (error: any) {
    console.error("Error updating user profile picture:", error)
    throw new Error(error.message || "Failed to update user profile picture")
  }
}

export async function getUserContacts(currentUserId: string) {
  return await db
    .select({
      unique_id: usersTable.unique_id,
      first_name: usersTable.first_name,
      last_name: usersTable.last_name,
      email: usersTable.email,
      external_auth_id: usersTable.external_auth_id,
      profile_url: usersTable.profile_url,
      role: usersTable.role,
      meta_profile: usersTable.meta_profile
    })
    .from(userContactsTable)
    .innerJoin(
      usersTable,
      eq(usersTable.unique_id, userContactsTable.contact_id)
    )
    .where(eq(userContactsTable.user_id, currentUserId))
}

export async function GetRandomUsers() {
  try {
    const roles = await db.query.rolesTable.findMany({
      where: eq(rolesTable.role_type, "GLOBAL")
    })

    const usersRole = await db.query.userRolesTable.findMany({
      where: inArray(
        userRolesTable.role_id,
        roles.map((r) => r.id)
      ),
      limit: 3,
      orderBy: sql`RANDOM()`
    })

    const user_ids = usersRole.map((ur) => ur.user_id)

    const users = await db.query.usersTable.findMany({
      where: inArray(usersTable.unique_id, user_ids),
      with: {
        roles: {
          with: {
            role: true
          }
        }
      }
    })

    return users
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function UpdateUserName(
  user_id: string,
  firstName: string,
  lastName: string
) {
  try {
    const result = await db
      .update(usersTable)
      .set({
        first_name: firstName,
        last_name: lastName
      })
      .where(eq(usersTable.unique_id, user_id))
      .returning()

    return result[0]
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function GetFeaturedUsers(filters: GetUserFilters) {
  try {
    const whereClause: (SQLWrapper | SQL)[] = []

    if (filters.userId) {
      whereClause.push(eq(usersTable.unique_id, filters.userId))
    }

    if (filters.userIds && filters.userIds.length > 0) {
      whereClause.push(inArray(usersTable.unique_id, filters.userIds))
    }

    if (filters.email) {
      whereClause.push(ilike(usersTable.email, `%${filters.email}%`))
    }

    const users = await db.query.usersTable.findMany({
      where: and(...whereClause),
      with: {
        roles: {
          with: {
            role: true
          }
        },
        profile: true,
        userTags: {
          with: {
            tag: true
          }
        }
      }
    })

    return users
  } catch (error: any) {
    console.error("Error fetching user:", error)
    throw new Error("Failed to fetch user")
  }
}

export async function UpdateCoverImage(
  userId: string,
  coverUrl: string | null
) {
  try {
    const updatedUser = await db
      .update(usersTable)
      .set({
        cover_image: coverUrl
      })
      .where(eq(usersTable.unique_id, userId))
      .returning()

    return updatedUser[0]
  } catch (error: any) {
    console.error("Error updating user profile picture:", error)
    throw new Error(error.message || "Failed to update user profile picture")
  }
}

export async function getBulkUsers(unique_ids: string[]) {
  return await db.query.usersTable.findMany({
    where: inArray(usersTable.unique_id, unique_ids)
  })
}

export async function getSuperAdmins() {
  try {
    const superAdmins = await db.query.userRolesTable.findMany({
      with: {
        user: true,
        role: { columns: { id: true, name: true } }
      }
    })

    const filtered = superAdmins.filter(
      (entry) => entry.role.name === "Super_Admin"
    )

    if (filtered.length === 0) {
      throw new Error("Super Admin role not found")
    }

    return filtered.map((entry) => entry.user) ?? []
  } catch (error: any) {
    console.error("Error fetching super admins:", error.message)
    throw new Error("Failed to fetch super admins")
  }
}
