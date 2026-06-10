/**
 * DeduplicateUserRolesSeed
 *
 * Removes duplicate rows from user_roles where a user has the same role
 * assigned more than once. Keeps one row per (user_id, role_id) pair.
 *
 * Rules:
 * - If a user has the same role multiple times (e.g. student, student, student)
 *   → keep one, delete the rest.
 * - If a user has different roles (e.g. super_admin + faculty)
 *   → leave them untouched.
 */

import { sql } from "drizzle-orm"
import { db } from ".."

export const DeduplicateUserRolesSeed = async () => {
  try {
    // Find all duplicate (user_id, role_id) pairs — keep the lowest id row, delete the others
    const result = await db.execute(sql`
      DELETE FROM user_roles
      WHERE ctid NOT IN (
        SELECT MIN(ctid)
        FROM user_roles
        GROUP BY user_id, role_id
      )
    `)

    const deleted = (result as any).rowCount ?? 0
    if (deleted > 0) {
      console.log(`✅ Removed ${deleted} duplicate user role row(s)`)
    } else {
      console.log("✅ No duplicate user roles found")
    }
  } catch (error) {
    console.error("❌ Error deduplicating user roles:", error)
    throw error
  }
}
