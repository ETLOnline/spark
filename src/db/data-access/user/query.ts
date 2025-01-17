import { eq, like } from "drizzle-orm"
import { db } from "../.."
import { InsertUser, usersTable } from "../../schema"

export async function CreateUser(data: InsertUser) {
  await db.insert(usersTable).values(data)
}

export async function SelectUserByExternalId(id: string) {
  return await db.query.usersTable.findFirst({
    columns: {
      first_name: true,
      last_name: true,
      email: true,
      external_auth_id: true,
      profile_url: true,
      unique_id: true,
      bio: true
    },
    where: eq(usersTable.external_auth_id, id)
  })
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
        bio: true
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
