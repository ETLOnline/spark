import { recommendationsTable } from "./../../schema"
import { db } from "../.."
import { eq } from "drizzle-orm"

export const GetRecommendations = async (id: string) => {
  const results = await db
    .select()
    .from(recommendationsTable)
    .where(eq(recommendationsTable.receiver_id, id))
  return results ?? []
}
