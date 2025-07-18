import { sql } from "drizzle-orm"
import { db } from "../index"
import { rolePermissionsTable, userRolesTable } from "../schema"

// Data derived directly from your provided SQL INSERT statement
const rolePermissionsSeedData = [
  { role_id: 6, permission_id: 17 },
  { role_id: 6, permission_id: 15 },
  { role_id: 6, permission_id: 14 },
  { role_id: 6, permission_id: 19 },
  { role_id: 6, permission_id: 20 },
  { role_id: 6, permission_id: 21 },
  { role_id: 6, permission_id: 18 },
  { role_id: 6, permission_id: 16 },
  { role_id: 6, permission_id: 23 },
  { role_id: 6, permission_id: 29 },
  { role_id: 6, permission_id: 26 },
  { role_id: 6, permission_id: 22 },
  { role_id: 7, permission_id: 17 },
  { role_id: 7, permission_id: 14 },
  { role_id: 7, permission_id: 19 },
  { role_id: 7, permission_id: 21 },
  { role_id: 7, permission_id: 18 },
  { role_id: 7, permission_id: 16 },
  { role_id: 7, permission_id: 26 },
  { role_id: 7, permission_id: 22 },
  { role_id: 7, permission_id: 23 },
  { role_id: 7, permission_id: 29 },
  { role_id: 8, permission_id: 16 },
  { role_id: 8, permission_id: 18 },
  { role_id: 8, permission_id: 17 },
  { role_id: 8, permission_id: 23 },
  { role_id: 8, permission_id: 29 },
  { role_id: 8, permission_id: 26 },
  { role_id: 9, permission_id: 26 },
  { role_id: 9, permission_id: 25 },
  { role_id: 9, permission_id: 27 },
  { role_id: 9, permission_id: 24 },
  { role_id: 9, permission_id: 28 },
  { role_id: 9, permission_id: 31 },
  { role_id: 9, permission_id: 30 },
  { role_id: 9, permission_id: 29 },
  { role_id: 9, permission_id: 23 },
  { role_id: 9, permission_id: 38 },
  { role_id: 9, permission_id: 37 },
  { role_id: 9, permission_id: 1 },
  { role_id: 9, permission_id: 4 },
  { role_id: 9, permission_id: 3 },
  { role_id: 9, permission_id: 2 },
  { role_id: 9, permission_id: 36 },
  { role_id: 9, permission_id: 32 },
  { role_id: 9, permission_id: 35 },
  { role_id: 9, permission_id: 34 },
  { role_id: 9, permission_id: 33 },
  { role_id: 9, permission_id: 5 },
  { role_id: 9, permission_id: 7 },
  { role_id: 9, permission_id: 8 },
  { role_id: 9, permission_id: 6 },
  { role_id: 10, permission_id: 26 },
  { role_id: 10, permission_id: 27 },
  { role_id: 10, permission_id: 24 },
  { role_id: 10, permission_id: 28 },
  { role_id: 10, permission_id: 30 },
  { role_id: 10, permission_id: 29 },
  { role_id: 10, permission_id: 23 },
  { role_id: 10, permission_id: 38 },
  { role_id: 10, permission_id: 37 },
  { role_id: 10, permission_id: 1 },
  { role_id: 10, permission_id: 3 },
  { role_id: 10, permission_id: 2 },
  { role_id: 10, permission_id: 36 },
  { role_id: 10, permission_id: 32 },
  { role_id: 10, permission_id: 34 },
  { role_id: 10, permission_id: 33 },
  { role_id: 10, permission_id: 5 },
  { role_id: 10, permission_id: 8 },
  { role_id: 10, permission_id: 6 },
  { role_id: 11, permission_id: 23 },
  { role_id: 11, permission_id: 29 },
  { role_id: 11, permission_id: 26 },
  { role_id: 11, permission_id: 38 },
  { role_id: 11, permission_id: 2 },
  { role_id: 11, permission_id: 1 },
  { role_id: 11, permission_id: 33 },
  { role_id: 11, permission_id: 32 },
  { role_id: 11, permission_id: 6 },
  { role_id: 11, permission_id: 5 },
  { role_id: 12, permission_id: 53 },
  { role_id: 12, permission_id: 55 },
  { role_id: 12, permission_id: 54 },
  { role_id: 12, permission_id: 52 },
  { role_id: 12, permission_id: 51 },
  { role_id: 12, permission_id: 50 },
  { role_id: 12, permission_id: 40 },
  { role_id: 12, permission_id: 56 },
  { role_id: 12, permission_id: 41 },
  { role_id: 12, permission_id: 42 },
  { role_id: 12, permission_id: 61 },
  { role_id: 12, permission_id: 43 },
  { role_id: 12, permission_id: 44 },
  { role_id: 12, permission_id: 45 },
  { role_id: 12, permission_id: 46 },
  { role_id: 12, permission_id: 49 },
  { role_id: 12, permission_id: 48 },
  { role_id: 12, permission_id: 47 },
  { role_id: 12, permission_id: 58 },
  { role_id: 12, permission_id: 60 },
  { role_id: 12, permission_id: 59 },
  { role_id: 12, permission_id: 57 },
  { role_id: 12, permission_id: 39 },
  { role_id: 12, permission_id: 38 },
  { role_id: 13, permission_id: 53 },
  { role_id: 13, permission_id: 54 },
  { role_id: 13, permission_id: 52 },
  { role_id: 13, permission_id: 51 },
  { role_id: 13, permission_id: 50 },
  { role_id: 13, permission_id: 40 },
  { role_id: 13, permission_id: 56 },
  { role_id: 13, permission_id: 41 },
  { role_id: 13, permission_id: 42 },
  { role_id: 13, permission_id: 61 },
  { role_id: 13, permission_id: 43 },
  { role_id: 13, permission_id: 44 },
  { role_id: 13, permission_id: 45 },
  { role_id: 13, permission_id: 46 },
  { role_id: 13, permission_id: 48 },
  { role_id: 13, permission_id: 47 },
  { role_id: 13, permission_id: 58 },
  { role_id: 13, permission_id: 59 },
  { role_id: 13, permission_id: 57 },
  { role_id: 13, permission_id: 39 },
  { role_id: 13, permission_id: 38 },
  { role_id: 14, permission_id: 52 },
  { role_id: 14, permission_id: 50 },
  { role_id: 14, permission_id: 51 },
  { role_id: 14, permission_id: 56 },
  { role_id: 14, permission_id: 42 },
  { role_id: 14, permission_id: 61 },
  { role_id: 14, permission_id: 45 },
  { role_id: 14, permission_id: 47 },
  { role_id: 14, permission_id: 57 },
  { role_id: 14, permission_id: 38 },
  { role_id: 14, permission_id: 41 },
  { role_id: 14, permission_id: 40 },
  { role_id: 4, permission_id: 5 },
  { role_id: 4, permission_id: 6 },
  { role_id: 4, permission_id: 9 },
  { role_id: 4, permission_id: 12 },
  { role_id: 4, permission_id: 1 },
  { role_id: 4, permission_id: 2 },
  { role_id: 4, permission_id: 16 },
  { role_id: 2, permission_id: 1 },
  { role_id: 2, permission_id: 3 },
  { role_id: 2, permission_id: 2 },
  { role_id: 2, permission_id: 9 },
  { role_id: 2, permission_id: 12 },
  { role_id: 2, permission_id: 4 },
  { role_id: 2, permission_id: 11 },
  { role_id: 2, permission_id: 10 },
  { role_id: 2, permission_id: 5 },
  { role_id: 2, permission_id: 7 },
  { role_id: 2, permission_id: 8 },
  { role_id: 2, permission_id: 6 },
  { role_id: 2, permission_id: 16 },
  { role_id: 3, permission_id: 5 },
  { role_id: 3, permission_id: 6 },
  { role_id: 3, permission_id: 9 },
  { role_id: 3, permission_id: 12 },
  { role_id: 3, permission_id: 1 },
  { role_id: 3, permission_id: 2 },
  { role_id: 15, permission_id: 66 },
  { role_id: 15, permission_id: 65 },
  { role_id: 15, permission_id: 64 },
  { role_id: 15, permission_id: 63 },
  { role_id: 15, permission_id: 13 },
  { role_id: 16, permission_id: 13 },
  { role_id: 16, permission_id: 66 },
  { role_id: 16, permission_id: 64 },
  { role_id: 16, permission_id: 63 },
  { role_id: 17, permission_id: 66 },
  { role_id: 17, permission_id: 63 },
  { role_id: 15, permission_id: 67 },
  { role_id: 15, permission_id: 68 },
  { role_id: 15, permission_id: 69 },
  { role_id: 16, permission_id: 67 },
  { role_id: 16, permission_id: 68 }
]

export const RolePermissionsSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      // 1. Clear existing role permissions
      console.log("🗑️ Clearing existing role_permissions...")
      await tx.delete(rolePermissionsTable)
      console.log("✅ Existing role_permissions cleared.")

      // Optional: If role_permissionsTable has an auto-incrementing ID column
      // and you want to reset its sequence, add a similar line as in PermissionsSeed.
      // Make sure 'role_permissions_id_seq' is the correct sequence name for your table.
      await tx.execute(sql`Truncate role_permissions;`)

      // 2. Insert new role permissions
      console.log(
        `🌱 Seeding ${rolePermissionsSeedData.length} role_permissions...`
      )

      // const superAdmin = await tx.insert(userRolesTable).values({ user_id: 'f9c7a8a1-b7a3-4f0d-8d8e-bc15a34e67b6', role_id: 1 });
      const res = await tx
        .insert(rolePermissionsTable)
        .values(rolePermissionsSeedData)

      if (res.count === rolePermissionsSeedData.length) {
        console.log(`✅ Seeded ${res.count} role_permissions successfully.`)
      } else {
        console.warn(
          `⚠️ Expected to insert ${rolePermissionsSeedData.length} role_permissions but got ${res.count}`
        )
      }
    } catch (error) {
      console.error("❌ Error seeding role permissions:", error)
      tx.rollback() // Rollback the transaction on error
      process.exit(1) // Exit the process with an error code
    }
  })
}
