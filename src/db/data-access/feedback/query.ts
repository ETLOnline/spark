import { eq } from "drizzle-orm"
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
  const superAdminRole = await db.query.rolesTable.findFirst({
    where:
      eq(rolesTable.name, "Super_Admin") && eq(rolesTable.role_type, "SYSTEM")
  })

  if (!superAdminRole) {
    return []
  }

  const usersWithSuperAdminRole = await db.query.userRolesTable.findMany({
    where: eq(userRolesTable.role_id, superAdminRole.id),
    with: {
      user: true
    }
  })

  // Map to get email, first_name, last_name
  const superAdmins = usersWithSuperAdminRole
    .filter((ur) => ur.user)
    .map((ur) => ({
      email: ur.user!.email,
      first_name: ur.user!.first_name,
      last_name: ur.user!.last_name
    }))

  return superAdmins
}
