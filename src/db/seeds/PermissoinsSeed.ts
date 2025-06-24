import { sql } from "drizzle-orm"
import { db } from "../index"
import { permissionsTable } from "../schema"

const permissionSeedList = [
  // Posting
  { namespace: "posting", action: "create" },
  { namespace: "posting", action: "view" },
  { namespace: "posting", action: "edit" },
  { namespace: "posting", action: "delete" },

  // Chat
  { namespace: "chat", action: "create" },
  { namespace: "chat", action: "view" },
  { namespace: "chat", action: "delete" },
  { namespace: "chat", action: "update" },

  // Events
  { namespace: "events", action: "create" },
  { namespace: "events", action: "edit" },
  { namespace: "events", action: "delete" },
  { namespace: "events", action: "view" },

  // Channels
  { namespace: "channels", action: "create" },
  { namespace: "channels", action: "edit" },
  { namespace: "channels", action: "delete" },
  { namespace: "channels", action: "view" },

  // Channel Users
  { namespace: "channels", action: "user.view" },
  { namespace: "channels", action: "user.invite" },
  { namespace: "channels", action: "user.remove" },
  { namespace: "channels", action: "user.update" },

  // Space
  { namespace: "space", action: "create" },
  { namespace: "space", action: "view" },
  { namespace: "space", action: "update" },
  { namespace: "space", action: "delete" },

  // Space Settings
  { namespace: "space", action: "setting.update" },

  // Space Users
  { namespace: "space", action: "user.invite" },
  { namespace: "space", action: "user.view" },
  { namespace: "space", action: "user.update" },
  { namespace: "space", action: "user.remove" },

  // Project
  { namespace: "project", action: "create" },
  { namespace: "project", action: "view" },
  { namespace: "project", action: "update" }
]

export const PermissionsSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      await tx.delete(permissionsTable)

      await tx.execute(sql`ALTER SEQUENCE permissions_id_seq RESTART WITH 1;`)

      const res = await tx.insert(permissionsTable).values(permissionSeedList)

      if (res.count === permissionSeedList.length) {
        console.log(`✅ Seeded ${res.count} permissions successfully.`)
      } else {
        console.warn(
          `⚠️ Expected to insert ${permissionSeedList.length} but got ${res.count}`
        )
      }
    } catch (error) {
      console.error("❌ Error seeding permissions:", error)
      tx.rollback()
      process.exit(1)
    }
  })
}
