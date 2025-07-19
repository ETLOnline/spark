import { eq } from "drizzle-orm"
import { db } from "../.."
import { InsertProfile, profileTable, SelectProfile } from "../../schema"

export async function createUserProfile(profileData: InsertProfile) {
  try {
    const userProfile = await db
      .insert(profileTable)
      .values(profileData)
      .returning()

    return userProfile[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function updateUserProfile(
  userId: string,
  profileData: Partial<InsertProfile>
) {
  try {
    const updatedProfile = await db
      .update(profileTable)
      .set(profileData)
      .where(eq(profileTable.user_id, userId))
      .returning()

    return updatedProfile[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function SearchUserProfile(userId: string) {
  try {
    const UserProfile = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.user_id, userId))

    return UserProfile[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}
