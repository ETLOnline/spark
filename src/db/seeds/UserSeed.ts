import { sql } from "drizzle-orm"
import { db } from ".."
import { userRolesTable, usersTable } from "../schema"
import UserSeedList from "../seeds/UserSeedList.json"

export const UserSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      await tx.execute(sql`Truncate users CASCADE ;`)
      // await tx.delete(usersTable)
      // await tx.execute(
      //   sql`ALTER SEQUENCE features_id_seq RESTART; UPDATE features SET id = DEFAULT;`
      // )
      // await tx.execute(sql`ALTER SEQUENCE users_id_seq RESTART; UPDATE users SET id = DEFAULT;`);
      const res = await tx.insert(usersTable).values(UserSeedList)

      if (res.count === UserSeedList.length) {
        console.log("✅ Users seeded successfully")
      }
      // add role for super admin
      await tx.execute(sql`Truncate user_roles CASCADE ;`)
      await tx.insert(userRolesTable).values([
        {
          user_id: "5b887879-9d4a-403a-acdb-4bf45178b528",
          role_id: 1
        },
        {
          user_id: "ef411be6-bd1b-49f9-a830-780d234d343d",
          role_id: 1
        },
        {
          user_id: "be1408b7-267b-4e96-b17d-6eb0fb725204",
          role_id: 1
        }
      ])
    } catch (e) {
      console.error(e)
      tx.rollback()
      console.log("❌ Error seeding Users")
      process.exit(1)
    }
  })
}
