import { eq } from "drizzle-orm"
import { db } from "../.."
import { feedbackTable, usersTable, InsertFeedback } from "../../schema"

export async function CreateFeedback(data: InsertFeedback) {
  const result = await db.insert(feedbackTable).values(data).returning()
  return result[0]
}

export async function GetAllFeedback() {
  return await db.query.feedbackTable.findMany({
    orderBy: (feedbackTable, { desc }) => [desc(feedbackTable.created_at)]
  })
}

export async function GetFeedbackById(id: number) {
  return await db.query.feedbackTable.findFirst({
    where: eq(feedbackTable.id, id)
  })
}

export async function GetAllSuperAdmins() {
  return await db.query.usersTable.findMany({
    where: eq(usersTable.role, "superAdmin"),
    columns: {
      email: true,
      first_name: true,
      last_name: true
    }
  })
}
