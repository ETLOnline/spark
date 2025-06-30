import { sql } from "drizzle-orm"
import { db } from ".."
import { userRolesTable, usersTable } from "../schema"
import UserSeedList from "../seeds/UserSeedList.json"

export const UserSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      await tx.delete(usersTable)
      // await tx.execute(sql`ALTER SEQUENCE users_id_seq RESTART; UPDATE tablename SET id = DEFAULT;`);
      const res = await tx.insert(usersTable).values(UserSeedList)

      if (res.count === UserSeedList.length) {
        console.log("✅ Users seeded successfully")
      }
      // add role for super admin
      await tx.insert(userRolesTable).values({
        user_id: "5b887879-9d4a-403a-acdb-4bf45178b528",
        role_id: 1
      })
    } catch (e) {
      console.error(e)
      tx.rollback()
      console.log("❌ Error seeding Users")
      process.exit(1)
    }
  })
}
