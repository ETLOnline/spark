import { recommendationsTable } from "./../../schema"
import { db } from "../.."
import { eq } from "drizzle-orm"

export const GetRecommendations = async (id: string) => {
  const results = await db.query.recommendationsTable.findMany({
    where: eq(recommendationsTable.receiver_id, id),
    with: {
      recommender: {
        columns: {
          first_name: true,
          last_name: true
        }
      }
    }
  })
  return results.map((result) => ({
    id: result.id,
    receiver_id: result.receiver_id,
    recommender_id: result.recommender_id,
    content: result.content,
    created_at: result.created_at,
    recommender_full_name: result.recommender
      ? `${result.recommender.first_name} ${result.recommender.last_name}`
      : ""
  }))
}
