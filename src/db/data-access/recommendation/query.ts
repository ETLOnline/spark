import { eq } from "drizzle-orm"
import { db } from "../.."
import {
  InsertRecommendation,
  profileTable,
  recommendationsTable
} from "../../schema"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"

export async function AddRecommendation(data: InsertRecommendation) {
  try {
    const response = (
      await db.insert(recommendationsTable).values(data).returning()
    ).at(0)

    if (!response?.id) throw new Error("Recommendation not created")
    const recommendation = await GetRecommendationById(response?.id)

    return recommendation
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetRecommendations(receiver_id: string) {
  try {
    const res = await db.query.recommendationsTable.findMany({
      where: eq(recommendationsTable.receiver_id, receiver_id),
      with: {
        recommender: true,
        receiver: true
      }
    })

    const numOfRecommendations = res.length
    const totalRating = res.reduce((acc, curr) => acc + curr.rating, 0)
    const averageRating =
      numOfRecommendations > 0 ? totalRating / numOfRecommendations : 0

    return {
      recommendations: res,
      averageRating: averageRating
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetRecommendationById(recommendationId: number) {
  try {
    const res = await db.query.recommendationsTable.findFirst({
      where: eq(recommendationsTable.id, recommendationId),
      with: {
        recommender: true,
        receiver: true
      }
    })

    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function UpdateRecommendation(
  recommendationId: number,
  data: InsertRecommendation
) {
  try {
    const res = await db
      .update(recommendationsTable)
      .set(data)
      .where(eq(recommendationsTable.id, recommendationId))
      .returning()

    const recommendation = await GetRecommendationById(res[0].id)

    return recommendation
  } catch (e: any) {
    throw new Error(e.message)
  }
}
