import { and, eq } from "drizzle-orm"
import { db } from "../.."
import { InsertInterest, interestsTable } from "../../schema"

export const AddInterest = async (data: InsertInterest) => {
  return await db.insert(interestsTable).values(data).returning()
}

export const DeleteInterest = async (userId: string, interestName: string) => {
  return await db
    .delete(interestsTable)
    .where(
      and(
        eq(interestsTable.user, userId),
        eq(interestsTable.name, interestName)
      )
    )
    .returning()
}
