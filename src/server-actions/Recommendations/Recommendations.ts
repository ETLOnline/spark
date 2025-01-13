"use server"

import { GetRecommendations } from "../../db/data-access/recommendation/query"
import { CreateServerAction } from ".."

export const GetUserRecommendationsAction = CreateServerAction(
  true,
  async (userId: string) => {
    try {
      return await GetRecommendations(userId)
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      throw error
    }
  }
)
