"use server"

import {
  GetRandomUsers,
  getUserContacts,
  GetUserProfileData,
  UpdateUserProfilePicture
} from "@/src/db/data-access/user/query"
import { CreateServerAction } from ".."
import { AddUserTag } from "@/src/db/data-access/tag/query"
import { ProfileData } from "@/src/components/Dashboard/profile/types/profile-types"
import { Tag, TagStatus } from "@/src/components/TagsInput/tags-input-types"
import { AuthUserAction } from "./AuthUserAction"
import {
  createUserProfile,
  SearchUserProfile,
  updateUserProfile
} from "@/src/db/data-access/profile/query"
import {
  base64ToBuffer,
  uploadFileAndSaveMetadata
} from "@/src/services/storage/utils/fileUtils"
import { clerkClient } from "@clerk/nextjs/server"

export const SaveUserProfileAction = CreateServerAction(
  true,
  async (profileData: ProfileData) => {
    try {
      const userProfile = await SearchUserProfile(profileData.userId)

      // Check if user profile already exist the update it otherwise create new profile
      if (userProfile) {
        await updateUserProfile(profileData.userId, { bio: profileData.bio })
      } else {
        await createUserProfile({
          user_id: profileData.userId,
          bio: profileData.bio
        })
      }

      const allTags = [...profileData.interests, ...profileData.skills]

      await AddUserTag(profileData.userId, allTags)

      return { success: true }
    } catch (error) {
      console.error(error)
      return {
        success: false,
        error: error
      }
    }
  }
)

export const GetUserProfileAction = CreateServerAction(
  true,
  async (userId: string) => {
    try {
      const profileData = await GetUserProfileData(userId)
      const mappedRecommendations = profileData.recommendations.map(
        (recommendation) => {
          return {
            ...recommendation,
            recommender_full_name: `${recommendation?.recommender?.first_name} ${recommendation?.recommender?.last_name}`
          }
        }
      )
      return {
        data: { ...profileData, recommendations: mappedRecommendations },
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

export const GetUserContactsAction = CreateServerAction(true, async () => {
  try {
    const auth = await AuthUserAction()
    if (!auth) {
      return { success: false, data: [] }
    }
    const contacts = await getUserContacts(auth.unique_id)
    return { success: true, data: contacts }
  } catch (error) {
    console.error("Failed to fetch user contacts:", error)
    return { success: false, error }
  }
})
export const UpdateUserProfilePictureAction = CreateServerAction(
  true,
  async (fileName: string, fileB64string: string, fileType: string) => {
    try {
      const fileBuffer = base64ToBuffer(fileB64string)

      const { fileUrl, fileRecord } = await uploadFileAndSaveMetadata(
        fileBuffer,
        fileName,
        fileType,
        "profiles"
      )

      if (!fileUrl || !fileRecord) {
        throw new Error("Upload failed: missing fileUrl or file metadata.")
      }

      const { unique_id, external_auth_id } = await AuthUserAction()
      if (!unique_id || !external_auth_id) {
        throw new Error("Could not determine authenticated user IDs")
      }
      const clerkUserId = external_auth_id
      const dbUserId = unique_id

      const fileBlob = new Blob([fileBuffer], { type: fileType })
      const clerk = await clerkClient()
      await clerk.users.updateUserProfileImage(clerkUserId, {
        file: fileBlob
      })

      const updatedUser = await UpdateUserProfilePicture(dbUserId, fileUrl)

      return {
        success: true,
        data: { ...updatedUser, profile_picture_url: fileUrl }
      }
    } catch (error: any) {
      console.error("Error updating profile picture:", error)
      return {
        success: false,
        error: error.message || "Failed to update profile picture"
      }
    }
  }
)

export const GetRandomUsersAction = CreateServerAction(true, async () => {
  try {
    const users = await GetRandomUsers()

    return {
      success: true,
      data: users
    }
  } catch (error) {
    return {
      success: false,
      error: error
    }
  }
})
