"use server"
import { InsertProfile, SelectProfile } from "@/src/db/schema"
import { CreateServerAction } from ".."
import {
  createUserProfile,
  SearchUserProfile,
  updateUserProfile
} from "@/src/db/data-access/profile/query"
import { AddsuccessfulReferralAction } from "../Referrals/referrals"
import { AddRewardAction } from "../Reward/Reward"
import { ActivityTypes } from "@/src/types/Rewards/rewards"

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

export const GetProfileVerificationStatusAction = CreateServerAction(
  true,
  async (userId: string) => {
    try {
      const profile = await SearchUserProfile(userId)

      return {
        success: true,
        data: {
          email: profile?.email ?? null,
          verified: profile?.verified ?? false
        }
      }
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

export const userProfileCompletionAction = CreateServerAction(
  true,
  async (
    userId: string,
    profileData: Partial<SelectProfile>,
    referral_id?: string
  ) => {
    try {
      // step 1: update profile and update is_profile_completed to true
      const updatedProfile = await updateUserProfile(userId, profileData)

      // step 2: add reward for profile-complition
      if (updatedProfile.is_profile_completed === 1) {
        await AddRewardAction(ActivityTypes.ProfileComplete, userId)
      }

      // step 3: if referral_id exists, add entry to successful referrals and add reward for referral
      if (referral_id) {
        await AddsuccessfulReferralAction({
          referrer_user_id: referral_id,
          referred_user_id: userId
        })

        await AddRewardAction(ActivityTypes.SuccessfulReferral, referral_id)
      }

      return { success: true, data: updatedProfile }
    } catch (error) {
      return { error: error }
    }
  }
)
