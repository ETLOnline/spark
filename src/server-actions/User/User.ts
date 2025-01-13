"use server"

import { UpdateUserBio } from "@/src/db/data-access/user/query"
import { CreateServerAction } from ".."
import {
  AddTag,
  GetTagsById,
  GetUserTagIds
} from "@/src/db/data-access/tag/query"
import { AddUserTag, DeleteUserTags } from "@/src/db/data-access/tag/query"
import { GetRecommendations } from "@/src/db/data-access/recommendation/query"
import {
  getActivitiesById,
  GetActivityIdsForUser
} from "@/src/db/data-access/activity/query"
import {
  GetRewardIdsForUser,
  GetRewardsById
} from "@/src/db/data-access/reward/query"
import { ProfileData } from "@/src/components/Dashboard/profile/types/profile-types.d"

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
      await UpdateUserBio(profileData.userId, profileData.bio)
      // add new tags
      if (profileData.newTags.length) {
        const insertedTags = await AddTag(profileData.newTags)
        await AddUserTag(
          insertedTags.map((tag) => {
            return { user_id: profileData.userId, tag_id: tag.id }
          })
        )
      }
      // add existing tags
      if(profileData.existingTags.length) {
        await AddUserTag(
          profileData.existingTags.map((tag) => {
            return { user_id: profileData.userId, tag_id: tag.id as number }
          })
        )
      }

      // delete tags
      if(profileData.deletedTagsIds.length){
        await DeleteUserTags(profileData.userId, profileData.deletedTagsIds)
      }
      
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

export const GetUserProfileAction = CreateServerAction(
  true,
  async (userId: string) => {
    try {
      let ProfileData
      const recommendations = await GetRecommendations(userId)
      const activityIds = await GetActivityIdsForUser(userId)
      const activities = await getActivitiesById(activityIds)
      const rewardIds = await GetRewardIdsForUser(userId)
      const rewards = await GetRewardsById(rewardIds)
      const tagIds = await GetUserTagIds(userId)
      const tags = await GetTagsById(tagIds)
      ProfileData = {
        recommendations,
        activities,
        rewards,
        tags
      }
      return {
        data: ProfileData,
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
