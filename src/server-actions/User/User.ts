"use server"

import {
  GetUserProfileData,
  UpdateUserBio,
  UpdateUserProfilePicture
} from "@/src/db/data-access/user/query"
import { CreateServerAction } from ".."
import { AddTag } from "@/src/db/data-access/tag/query"
import { AddUserTag, DeleteUserTags } from "@/src/db/data-access/tag/query"
import { ProfileData } from "@/src/components/Dashboard/profile/types/profile-types"
import { Tag, TagStatus } from "@/src/components/TagsInput/tags-input-types"
import {
  base64ToBuffer,
  uploadFileAndSaveMetadata
} from "@/src/services/storage/utils/fileUtils"
import { clerkClient } from "@clerk/nextjs/server"
import { AuthUserAction } from "./AuthUserAction"

export const UpdateBioForUserAction = CreateServerAction(
  true,
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

export const SaveUserProfileAction = CreateServerAction(
  true,
  async (profileData: ProfileData) => {
    try {
      const updatedSkillTags: Tag[] = []
      const updatedInterestTags: Tag[] = []
      await UpdateUserBio(profileData.userId, profileData.bio)
      // add new tags
      if (profileData.newTags.length) {
        const insertedTags = await AddTag(profileData.newTags)
        await AddUserTag(
          insertedTags.map((tag) => {
            return { user_id: profileData.userId, tag_id: tag.id }
          })
        )
        insertedTags.forEach((tag) => {
          if (tag.type === "skill")
            updatedSkillTags.push({
              id: tag.id,
              name: tag.name,
              status: TagStatus.saved
            })
          else
            updatedInterestTags.push({
              id: tag.id,
              name: tag.name,
              status: TagStatus.saved
            })
        })
      }
      // add existing tags
      if (profileData.existingTags.length) {
        await AddUserTag(
          profileData.existingTags.map((tag) => {
            return { user_id: profileData.userId, tag_id: tag.id as number }
          })
        )
        profileData.existingTags.forEach((tag) => {
          if (tag.type === "skill")
            updatedSkillTags.push({
              id: tag.id,
              name: tag.name,
              status: TagStatus.saved
            })
          else
            updatedInterestTags.push({
              id: tag.id,
              name: tag.name,
              status: TagStatus.saved
            })
        })
      }
      // delete tags
      if (profileData.deletedTagsIds.length) {
        await DeleteUserTags(profileData.userId, profileData.deletedTagsIds)
      }

      return {
        success: true,
        data: { skills: updatedSkillTags, interests: updatedInterestTags }
      }
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
            recommender_full_name: `${recommendation.recommender.first_name} ${recommendation.recommender.last_name}`
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
