import { eq, like } from "drizzle-orm"
import { db } from "../.."
import { InsertUser, userContactsTable, usersTable } from "../../schema"

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
      unique_id: true,
      bio: true,
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
      channels: {
        with: {
          channel: {
            with: {
              spaces: true
            }
          }
        }
      },
      spaces: {
        with: {
          space: true
        }
      }
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
    where: eq(usersTable.unique_id, unique_id)
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
        unique_id: true,
        bio: true,
        role: true,
        meta_profile: true
      },
      where: (usersTable, { or }) =>
        or(
          like(usersTable.first_name, `%${wildcard}%`),
          like(usersTable.last_name, `%${wildcard}%`)
        )
    })
    return users
  } catch (error: any) {
    throw new Error(error.message as string)
  }
}

export async function UpdateUserBio(userId: string, bio: string) {
  await db
    .update(usersTable)
    .set({ bio })
    .where(eq(usersTable.unique_id, userId))
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

export async function getUserContacts(currentUserId: string) {
  return await db
    .select({
      unique_id: usersTable.unique_id,
      first_name: usersTable.first_name,
      last_name: usersTable.last_name,
      email: usersTable.email,
      external_auth_id: usersTable.external_auth_id,
      profile_url: usersTable.profile_url,
      bio: usersTable.bio,
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
