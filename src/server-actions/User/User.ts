"use server"

import {
  GetUserProfileData,
  UpdateUserBio
} from "@/src/db/data-access/user/query"
import { CreateServerAction } from ".."
import { AddTag } from "@/src/db/data-access/tag/query"
import { AddUserTag, DeleteUserTags } from "@/src/db/data-access/tag/query"
import { ProfileData } from "@/src/components/Dashboard/profile/types/profile-types"
import { Tag, TagStatus } from "@/src/components/TagsInput/tags-input-types"

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
      let updatedSkillTags: Tag[] = []
      let updatedInterestTags: Tag[] = []
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
          tag.type === "skill"
            ? updatedSkillTags.push({
                id: tag.id,
                name: tag.name,
                status: TagStatus.saved
              })
            : updatedInterestTags.push({
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
          tag.type === "skill"
            ? updatedSkillTags.push({
                id: tag.id,
                name: tag.name,
                status: TagStatus.saved
              })
            : updatedInterestTags.push({
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
