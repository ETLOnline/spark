"use server"
import {
  AddRecommendation,
  GetRecommendations,
  UpdateRecommendation
} from "@/src/db/data-access/recommendation/query"
import { CreateServerAction } from ".."
import { SelectRecommendation } from "@/src/db/schema"

export const AddRecommendationAction = CreateServerAction(
  true,
  async (data: SelectRecommendation) => {
    try {
      const recommendation = await AddRecommendation(data)

      return { success: true, data: recommendation }
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
