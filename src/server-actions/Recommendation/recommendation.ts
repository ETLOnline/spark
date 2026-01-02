"use server"
import {
  AddRecommendation,
  GetRecommendations,
  UpdateRecommendation
} from "@/src/db/data-access/recommendation/query"
import { CreateServerAction } from ".."
import { SelectRecommendation } from "@/src/db/schema"
import { updateUserProfile } from "@/src/db/data-access/profile/query"
import { SelectUserByUniqueId } from "@/src/db/data-access/user/query"

export const AddRecommendationAction = CreateServerAction(
  true,
  async (data: SelectRecommendation) => {
    try {
      const recommendation = await AddRecommendation(data)

      if (recommendation?.receiver_id == null)
        return { success: false, error: "Receiver ID is null" }
      const user = await SelectUserByUniqueId(recommendation?.receiver_id)

      if (!user) return { success: false, error: "User not found" }
      const sumOfRatings =
        (user?.profile?.sum_of_ratings || 0) + (recommendation?.rating || 5)

      const numberOfRatings = (user?.profile.number_of_ratings || 0) + 1

      const totalAverageRating = sumOfRatings / numberOfRatings

      const profile = await updateUserProfile(user.unique_id, {
        total_average_rating: totalAverageRating.toString(),
        sum_of_ratings: sumOfRatings,
        number_of_ratings: numberOfRatings
      })

      return { success: true, data: { recommendation, profile } }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetRecommendationAction = CreateServerAction(
  true,
  async (recommendationId: string) => {
    try {
      const recommendation = await GetRecommendations(recommendationId)

      return { success: true, data: recommendation }
    } catch (error) {
      return { error: error }
    }
  }
)

export const UpdateRecommendationAction = CreateServerAction(
  true,
  async (recommendationId: number, data: SelectRecommendation) => {
    try {
      const recommendation = await UpdateRecommendation(recommendationId, data)

      return { success: true, data: recommendation }
    } catch (error) {
      return { error: error }
    }
  }
)
