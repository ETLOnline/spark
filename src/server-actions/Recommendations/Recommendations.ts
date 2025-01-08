"use server"

import { GetRecommendations } from "../../db/data-access/recommendation/query"
import { CreateServerAction } from ".."

export const GetUserRecommendationsAction = CreateServerAction(
  true,
  async (externalAuthId: string) => {
    try {
      return await GetRecommendations(externalAuthId)
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      throw error
    }
  }
)
