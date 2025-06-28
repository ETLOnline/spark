"use server"
import { InsertProfile, SelectProfile } from "@/src/db/schema"
import { CreateServerAction } from ".."
import {
  createUserProfile,
  updateUserProfile
} from "@/src/db/data-access/profile/query"

export const createUserProfileAction = CreateServerAction(
  true,
  async (profileData: InsertProfile) => {
    try {
      const profile = await createUserProfile(profileData)

      return { success: true, data: profile }
    } catch (error) {
      return { error: error }
    }
  }
)

export const updateUserProfileAction = CreateServerAction(
  true,
  async (userId: string, profileData: Partial<SelectProfile>) => {
    try {
      const updatedProfile = await updateUserProfile(userId, profileData)

      return { success: true, data: updatedProfile }
    } catch (error) {
      return { error: error }
    }
  }
)
