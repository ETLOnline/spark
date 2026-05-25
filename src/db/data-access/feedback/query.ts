import { eq, and, exists } from "drizzle-orm"
import { db } from "../.."
import {
  feedbackTable,
  usersTable,
  rolesTable,
  userRolesTable,
  InsertFeedback
} from "../../schema"

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
  // Single query using where clause to filter users with Super_Admin role
  return await db
    .select({
      email: usersTable.email,
      first_name: usersTable.first_name,
      last_name: usersTable.last_name
    })
    .from(usersTable)
    .where(
      exists(
        db
          .select()
          .from(userRolesTable)
          .where(
            and(
              eq(userRolesTable.user_id, usersTable.unique_id),
              exists(
                db
                  .select()
                  .from(rolesTable)
                  .where(
                    and(
                      eq(rolesTable.id, userRolesTable.role_id),
                      eq(rolesTable.name, "Super_Admin"),
                      eq(rolesTable.role_type, "SYSTEM")
                    )
                  )
              )
            )
          )
      )
    )
}
