import { recommendationsTable, usersTable } from "./../../schema"
import { db } from "../.."
import { eq } from "drizzle-orm"

export const GetRecommendations = async (id: string) => {
  const results = await db
    .select({
      id: recommendationsTable.id,
      receiver_id: recommendationsTable.receiver_id,
      recommender_id: recommendationsTable.recommender_id,
      content: recommendationsTable.content,
      created_at: recommendationsTable.created_at,
      recommender: {
        first_name: usersTable.first_name,
        last_name: usersTable.last_name
      }
    })
    .from(recommendationsTable)
    .innerJoin(
      usersTable,
      eq(recommendationsTable.recommender_id, usersTable.unique_id)
    )
    .where(eq(recommendationsTable.receiver_id, id))
  return (
    results.map((result) => ({
      ...result,
      recommender_full_name: result.recommender
        ? `${result.recommender.first_name} ${result.recommender.last_name}`
        : ""
    })) ?? []
  )
}
