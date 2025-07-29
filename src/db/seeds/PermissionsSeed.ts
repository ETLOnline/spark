import { sql } from "drizzle-orm"
import { db } from "../index"
import { permissionsTable } from "../schema"

const permissionSeedList = [
  // Posting
  { namespace: "posting", action: "create" },
  { namespace: "posting", action: "view" },
  { namespace: "posting", action: "update" },
  { namespace: "posting", action: "delete" },

  // Chat
  { namespace: "chat", action: "create" },
  { namespace: "chat", action: "view" },
  { namespace: "chat", action: "delete" },
  { namespace: "chat", action: "update" },

  // Events
  { namespace: "events", action: "create" },
  { namespace: "events", action: "update" },
  { namespace: "events", action: "delete" },
  { namespace: "events", action: "view" },

  // community
  { namespace: "community", action: "create" },
  { namespace: "community", action: "view" },
  { namespace: "community", action: "update" },
  { namespace: "community", action: "delete" },
  { namespace: "community", action: "allow.action" },
  { namespace: "community", action: "user.invite" },
  { namespace: "community", action: "user.update" },
  { namespace: "community", action: "user.remove" },
  { namespace: "community", action: "user.view" },
  { namespace: "community", action: "channel.create" },

  // channel
  { namespace: "channel", action: "create" },
  { namespace: "channel", action: "update" },
  { namespace: "channel", action: "delete" },
  { namespace: "channel", action: "view" },
  { namespace: "channel", action: "allow.action" },
  { namespace: "channel", action: "space.create" },

  // Channel Users
  { namespace: "channel", action: "user.view" },
  { namespace: "channel", action: "user.invite" },
  { namespace: "channel", action: "user.remove" },
  { namespace: "channel", action: "user.update" },

  // Space
  { namespace: "space", action: "create" },
  { namespace: "space", action: "view" },
  { namespace: "space", action: "update" },
  { namespace: "space", action: "delete" },
  { namespace: "space", action: "allow.action" },
  { namespace: "space", action: "project.create" },

  // Space Settings
  { namespace: "space", action: "setting.update" },

  // Space Users
  { namespace: "space", action: "user.invite" },
  { namespace: "space", action: "user.view" },
  { namespace: "space", action: "user.update" },
  { namespace: "space", action: "user.remove" },

  // Space File Sharing
  { namespace: "space", action: "file_sharing.create" },
  { namespace: "space", action: "file_sharing.view" },
  { namespace: "space", action: "file_sharing.update" },
  { namespace: "space", action: "file_sharing.delete" },
  { namespace: "space", action: "file_sharing.allow.action" },

  // Posting
  { namespace: "space", action: "posting.create" },
  { namespace: "space", action: "posting.view" },
  { namespace: "space", action: "posting.update" },
  { namespace: "space", action: "posting.delete" },

  // Chat
  { namespace: "space", action: "chat.create" },
  { namespace: "space", action: "chat.view" },
  { namespace: "space", action: "chat.delete" },
  { namespace: "space", action: "chat.update" },
  { namespace: "space", action: "project.view" },

  // Project
  { namespace: "project", action: "create" },
  { namespace: "project", action: "view" },
  { namespace: "project", action: "update" },

  { namespace: "project", action: "detail" },
  { namespace: "project", action: "launch.board" },

  { namespace: "project", action: "overview.view" },

  { namespace: "project", action: "sprint.create" },
  { namespace: "project", action: "sprint.update" },
  { namespace: "project", action: "sprint.view" },

  { namespace: "project", action: "task.create" },
  { namespace: "project", action: "task.view" },
  { namespace: "project", action: "task.update" },
  { namespace: "project", action: "task.delete" },

  { namespace: "project", action: "board.view" },

  { namespace: "project", action: "backlog.view" },
  { namespace: "project", action: "backlog.task.view" },
  { namespace: "project", action: "backlog.task.create" },
  { namespace: "project", action: "backlog.task.update" },
  { namespace: "project", action: "backlog.task.delete" },

  { namespace: "project", action: "files.view" },

  { namespace: "project", action: "teams.view" },
  { namespace: "project", action: "teams.add" },
  { namespace: "project", action: "teams.update" },
  { namespace: "project", action: "teams.delete" },

  { namespace: "project", action: "settings.view" }
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
