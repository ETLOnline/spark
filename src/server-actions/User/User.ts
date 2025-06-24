"use server"

import { GetUserProfileData } from "@/src/db/data-access/user/query"
import { CreateServerAction } from ".."
import { SearchUserTagsByTagId } from "@/src/db/data-access/tag/query"
import { AddUserTag } from "@/src/db/data-access/tag/query"
import { ProfileData } from "@/src/components/Dashboard/profile/types/profile-types"
import {
  createUserProfile,
  SearchUserProfile,
  updateUserProfile
} from "@/src/db/data-access/profile/query"

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
