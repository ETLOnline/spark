"use server"

import {
  GetUsersFullName
} from "../../db/data-access/user/query"
import { GetRecommendations } from "../../db/data-access/recommendation/query"
import { CreateServerAction } from ".."

export const FetchUserRecommendationsAction = CreateServerAction(
  true,
  async (externalAuthId: string) => {
    try {
      const recommendations = await GetRecommendations(externalAuthId)
      const RecommenderNames = await GetUsersFullName(
        recommendations.map((recommendation) => recommendation.recommender_id)
      )
      return recommendations.map((recommendation, i) => ({
        ...recommendation,
        recommender: RecommenderNames[i]
      }))
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      throw error
    }
  }
)
