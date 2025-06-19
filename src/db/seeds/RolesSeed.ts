import { sql } from "drizzle-orm"
import { db } from "../index"
import { rolesTable } from "../schema"

const roleSeedList = [
  {
    name: "Super_Admin",
    role_type: "SYSTEM",
    entity_type: null,
    entity_id: null
  },
  {
    name: "Faculty",
    role_type: "GLOBAL",
    entity_type: null,
    entity_id: null
  },
  {
    name: "Mentor",
    role_type: "GLOBAL",
    entity_type: null,
    entity_id: null
  },
  {
    name: "Student",
    role_type: "GLOBAL",
    entity_type: null,
    entity_id: null
  },
  {
    name: "Industry Partner",
    role_type: "GLOBAL",
    entity_type: null,
    entity_id: null
  }
]

export const RolesSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      await tx.delete(rolesTable)

      await tx.execute(sql`ALTER SEQUENCE roles_id_seq RESTART WITH 1;`)

      const res = await tx.insert(rolesTable).values(roleSeedList)

      if (res.count === roleSeedList.length) {
        console.log(`✅ Seeded ${res.count} roles successfully.`)
      } else {
        console.warn(
          `⚠️ Expected to insert ${roleSeedList.length} but got ${res.count}`
        )
      }
    } catch (error) {
      console.error("❌ Error seeding roles:", error)
      tx.rollback()
      process.exit(1)
    }
  })
}
