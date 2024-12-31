"use server"

import { GetUserBio, UpdateUserBio } from "@/src/db/data-access/user/query"
import { CreateServerAction } from ".."
import { AddTag } from "@/src/db/data-access/tag/query"
import { AddUserTag, DeleteUserTags } from "@/src/db/data-access/user-tag/query"
import { ProfileData } from "@/src/components/dashboard/Profile/types/profile-types"

export const UpdateBioForUser = CreateServerAction(
  false,
  async (userId: string, newBio: string) => {
    try {
      await UpdateUserBio(userId, newBio)
      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: error
      }
    }
  }
)

export const GetUserBioForUser = CreateServerAction(
  false,
  async (userId: string) => {
    try {
      const user = await GetUserBio(userId)
      return {
        success: true,
        data: user
      }
    } catch (error) {
      return {
        success: false,
        error: error
      }
    }
  }
)

export const saveUserProfileAction = CreateServerAction(
  false,
  async (profileData: ProfileData) => {
    try {
      await UpdateUserBio(profileData.userId, profileData.bio)
      // add new tags
      const insertedTags = await AddTag(profileData.newTags)
      await AddUserTag(
        insertedTags.map((tag) => {
          return { user_id: profileData.userId, tag_id: tag.id }
        })
      )
      // add existing tags
      await AddUserTag(
        profileData.existingTags.map((tag) => {
          return { user_id: profileData.userId, tag_id: tag.id as number }
        })
      )
      // delete tags
      await DeleteUserTags(profileData.userId, profileData.deletedTagsIds)
      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: error
      }
    }
  }
)
