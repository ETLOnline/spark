import { eq, or, sql } from "drizzle-orm"
import { db } from "../index"
import {
  permissionsTable,
  rolePermissionsTable,
  rolesTable,
  userRolesTable
} from "../schema"
import { permissions } from "@/src/utils/constants"

const userRolePermissions = [
  {
    role_slug: "student",
    permissions: [
      {
        namespace: "chat",
        actions: [permissions.chat.create, permissions.chat.view]
      },
      {
        namespace: "posting",
        actions: [permissions.posting.create, permissions.posting.view]
      },
      {
        namespace: "events",
        actions: [permissions.events.view]
      }
    ]
  },
  {
    role_slug: "faculty",
    permissions: [
      {
        namespace: "chat",
        actions: [permissions.chat.create, permissions.chat.view]
      },
      {
        namespace: "events",
        actions: [permissions.events.create, permissions.events.view]
      },
      {
        namespace: "posting",
        actions: [permissions.posting.create, permissions.posting.view]
      }
    ]
  },
  {
    role_slug: "industry_partner",
    permissions: [
      {
        namespace: "chat",
        actions: [permissions.chat.create, permissions.chat.view]
      },
      {
        namespace: "events",
        actions: [permissions.events.create, permissions.events.view]
      },
      {
        namespace: "posting",
        actions: [permissions.posting.create, permissions.posting.view]
      }
    ]
  },
  {
    role_slug: "mentor",
    permissions: [
      {
        namespace: "chat",
        actions: [permissions.chat.create, permissions.chat.view]
      },
      {
        namespace: "events",
        actions: [permissions.events.view]
      },
      {
        namespace: "posting",
        actions: [permissions.posting.create, permissions.posting.view]
      }
    ]
  },
  {
    role_slug: "community_admin",
    permissions: [
      {
        namespace: "community",
        actions: [
          permissions.community.allowAction,
          permissions.community.channelCreate,
          permissions.community.delete,
          permissions.community.update,
          permissions.community.userInvite,
          permissions.community.userRemove,
          permissions.community.userUpdate,
          permissions.community.userView,
          permissions.community.view
        ]
      }
    ]
  },
  {
    role_slug: "community_editor",
    permissions: [
      {
        namespace: "community",
        actions: [
          permissions.community.allowAction,
          permissions.community.channelCreate,
          permissions.community.update,
          permissions.community.userView,
          permissions.community.view
        ]
      }
    ]
  },
  {
    role_slug: "community_viewer",
    permissions: [
      {
        namespace: "community",
        actions: [
          permissions.community.allowAction,
          permissions.community.view,
          permissions.community.userView
        ]
      }
    ]
  },
  {
    role_slug: "channel_admin",
    permissions: [
      {
        namespace: "channel",
        actions: [
          permissions.channel.allowAction,
          permissions.channel.delete,
          permissions.channel.spaceCreate,
          permissions.channel.update,
          permissions.channel.userInvite,
          permissions.channel.userRemove,
          permissions.channel.userUpdate,
          permissions.channel.userView,
          permissions.channel.view
        ]
      }
    ]
  },
  {
    role_slug: "channel_editor",
    permissions: [
      {
        namespace: "channel",
        actions: [
          permissions.channel.allowAction,
          permissions.channel.spaceCreate,
          permissions.channel.update,
          permissions.channel.userView,
          permissions.channel.view
        ]
      }
    ]
  },
  {
    role_slug: "channel_viewer",
    permissions: [
      {
        namespace: "channel",
        actions: [
          permissions.channel.allowAction,
          permissions.channel.view,
          permissions.channel.userView
        ]
      }
    ]
  },
  {
    role_slug: "space_admin",
    permissions: [
      {
        namespace: "space",
        actions: [
          permissions.space.allowAction,
          permissions.space.chatCreate,
          permissions.space.chatDelete,
          permissions.space.chatUpdate,
          permissions.space.chatView,
          permissions.space.delete,
          permissions.space.fileAllow,
          permissions.space.fileCreate,
          permissions.space.fileDelete,
          permissions.space.fileUpdate,
          permissions.space.fileView,
          permissions.space.postingCreate,
          permissions.space.postingDelete,
          permissions.space.postingUpdate,
          permissions.space.postingView,
          permissions.space.projectCreate,
          permissions.space.projectView,
          permissions.space.settingUpdate,
          permissions.space.update,
          permissions.space.userInvite,
          permissions.space.userRemove,
          permissions.space.userUpdate,
          permissions.space.userView,
          permissions.space.view
        ]
      }
    ]
  },
  {
    role_slug: "space_editor",
    permissions: [
      {
        namespace: "space",
        actions: [
          permissions.space.allowAction,
          permissions.space.chatCreate,
          permissions.space.chatUpdate,
          permissions.space.chatView,
          permissions.space.fileAllow,
          permissions.space.fileCreate,
          permissions.space.fileUpdate,
          permissions.space.fileView,
          permissions.space.postingCreate,
          permissions.space.postingUpdate,
          permissions.space.postingView,
          permissions.space.projectCreate,
          permissions.space.projectView,
          permissions.space.settingUpdate,
          permissions.space.update,
          permissions.space.userView,
          permissions.space.view
        ]
      }
    ]
  },
  {
    role_slug: "space_viewer",
    permissions: [
      {
        namespace: "space",
        actions: [
          permissions.space.allowAction,
          permissions.space.view,
          permissions.space.userView,
          permissions.space.projectView,
          permissions.space.postingView,
          permissions.space.postingCreate,
          permissions.space.fileView,
          permissions.space.fileCreate,
          permissions.space.fileAllow,
          permissions.space.chatView,
          permissions.space.chatCreate
        ]
      }
    ]
  },
  {
    role_slug: "project_admin",
    permissions: [
      {
        namespace: "project",
        actions: [
          permissions.project.backlogTaskCreate,
          permissions.project.backlogTaskDelete,
          permissions.project.backlogTaskUpdate,
          permissions.project.backlogTaskView,
          permissions.project.backlogView,
          permissions.project.boardView,
          permissions.project.detail,
          permissions.project.filesView,
          permissions.project.launchBoard,
          permissions.project.overviewView,
          permissions.project.settingsView,
          permissions.project.sprintCreate,
          permissions.project.sprintUpdate,
          permissions.project.sprintView,
          permissions.project.taskCreate,
          permissions.project.taskDelete,
          permissions.project.taskUpdate,
          permissions.project.taskView,
          permissions.project.teamsAdd,
          permissions.project.teamsDelete,
          permissions.project.teamsUpdate,
          permissions.project.teamsView,
          permissions.project.update,
          permissions.project.view
        ]
      }
    ]
  },
  {
    role_slug: "project_editor",
    permissions: [
      {
        namespace: "project",
        actions: [
          permissions.project.backlogTaskCreate,
          permissions.project.backlogTaskUpdate,
          permissions.project.backlogTaskView,
          permissions.project.backlogView,
          permissions.project.boardView,
          permissions.project.detail,
          permissions.project.filesView,
          permissions.project.launchBoard,
          permissions.project.overviewView,
          permissions.project.settingsView,
          permissions.project.sprintCreate,
          permissions.project.sprintUpdate,
          permissions.project.sprintView,
          permissions.project.taskCreate,
          permissions.project.taskUpdate,
          permissions.project.taskView,
          permissions.project.teamsView,
          permissions.project.update,
          permissions.project.view
        ]
      }
    ]
  },
  {
    role_slug: "project_viewer",
    permissions: [
      {
        namespace: "project",
        actions: [
          permissions.project.backlogTaskView,
          permissions.project.backlogView,
          permissions.project.boardView,
          permissions.project.filesView,
          permissions.project.launchBoard,
          permissions.project.overviewView,
          permissions.project.settingsView,
          permissions.project.sprintView,
          permissions.project.taskView,
          permissions.project.teamsView,
          permissions.project.view
        ]
      }
    ]
  }
]

// Data derived directly from your provided SQL INSERT statement
// const rolePermissionsSeedData = [
//   { role_slug: "channel_admin", permission_id: 27 },
//   { role_slug: "channel_admin", permission_id: 25 },
//   { role_slug: "channel_admin", permission_id: 28 },
//   { role_slug: "channel_admin", permission_id: 24 },
//   { role_slug: "channel_admin", permission_id: 30 },
//   { role_slug: "channel_admin", permission_id: 31 },
//   { role_slug: "channel_admin", permission_id: 32 },
//   { role_slug: "channel_admin", permission_id: 29 },
//   { role_slug: "channel_admin", permission_id: 26 },
//   { role_slug: "channel_editor", permission_id: 27 },
//   { role_slug: "channel_editor", permission_id: 28 },
//   { role_slug: "channel_editor", permission_id: 24 },
//   { role_slug: "channel_editor", permission_id: 29 },
//   { role_slug: "channel_editor", permission_id: 26 },
//   { role_slug: "channel_viewer", permission_id: 27 },
//   { role_slug: "channel_viewer", permission_id: 26 },
//   { role_slug: "channel_viewer", permission_id: 29 },
//   { role_slug: "community_admin", permission_id: 17 },
//   { role_slug: "community_admin", permission_id: 22 },
//   { role_slug: "community_admin", permission_id: 16 },
//   { role_slug: "community_admin", permission_id: 15 },
//   { role_slug: "community_admin", permission_id: 18 },
//   { role_slug: "community_admin", permission_id: 20 },
//   { role_slug: "community_admin", permission_id: 19 },
//   { role_slug: "community_admin", permission_id: 21 },
//   { role_slug: "community_admin", permission_id: 14 },
//   { role_slug: "community_editor", permission_id: 17 },
//   { role_slug: "community_editor", permission_id: 22 },
//   { role_slug: "community_editor", permission_id: 15 },
//   { role_slug: "community_editor", permission_id: 21 },
//   { role_slug: "community_editor", permission_id: 14 },
//   { role_slug: "community_viewer", permission_id: 17 },
//   { role_slug: "community_viewer", permission_id: 14 },
//   { role_slug: "community_viewer", permission_id: 21 },
//   { role_slug: "faculty", permission_id: 5 },
//   { role_slug: "faculty", permission_id: 6 },
//   { role_slug: "faculty", permission_id: 9 },
//   { role_slug: "faculty", permission_id: 12 },
//   { role_slug: "faculty", permission_id: 1 },
//   { role_slug: "faculty", permission_id: 2 },
//   { role_slug: "industry_partner", permission_id: 5 },
//   { role_slug: "industry_partner", permission_id: 6 },
//   { role_slug: "industry_partner", permission_id: 9 },
//   { role_slug: "industry_partner", permission_id: 12 },
//   { role_slug: "industry_partner", permission_id: 1 },
//   { role_slug: "industry_partner", permission_id: 2 },
//   { role_slug: "mentor", permission_id: 5 },
//   { role_slug: "mentor", permission_id: 6 },
//   { role_slug: "mentor", permission_id: 12 },
//   { role_slug: "mentor", permission_id: 1 },
//   { role_slug: "mentor", permission_id: 2 },
//   { role_slug: "project_admin", permission_id: 74 },
//   { role_slug: "project_admin", permission_id: 76 },
//   { role_slug: "project_admin", permission_id: 75 },
//   { role_slug: "project_admin", permission_id: 73 },
//   { role_slug: "project_admin", permission_id: 72 },
//   { role_slug: "project_admin", permission_id: 71 },
//   { role_slug: "project_admin", permission_id: 61 },
//   { role_slug: "project_admin", permission_id: 77 },
//   { role_slug: "project_admin", permission_id: 62 },
//   { role_slug: "project_admin", permission_id: 63 },
//   { role_slug: "project_admin", permission_id: 82 },
//   { role_slug: "project_admin", permission_id: 64 },
//   { role_slug: "project_admin", permission_id: 65 },
//   { role_slug: "project_admin", permission_id: 66 },
//   { role_slug: "project_admin", permission_id: 67 },
//   { role_slug: "project_admin", permission_id: 70 },
//   { role_slug: "project_admin", permission_id: 69 },
//   { role_slug: "project_admin", permission_id: 68 },
//   { role_slug: "project_admin", permission_id: 79 },
//   { role_slug: "project_admin", permission_id: 81 },
//   { role_slug: "project_admin", permission_id: 80 },
//   { role_slug: "project_admin", permission_id: 78 },
//   { role_slug: "project_admin", permission_id: 60 },
//   { role_slug: "project_admin", permission_id: 59 },
//   { role_slug: "project_editor", permission_id: 74 },
//   { role_slug: "project_editor", permission_id: 75 },
//   { role_slug: "project_editor", permission_id: 73 },
//   { role_slug: "project_editor", permission_id: 72 },
//   { role_slug: "project_editor", permission_id: 71 },
//   { role_slug: "project_editor", permission_id: 61 },
//   { role_slug: "project_editor", permission_id: 77 },
//   { role_slug: "project_editor", permission_id: 62 },
//   { role_slug: "project_editor", permission_id: 63 },
//   { role_slug: "project_editor", permission_id: 82 },
//   { role_slug: "project_editor", permission_id: 64 },
//   { role_slug: "project_editor", permission_id: 65 },
//   { role_slug: "project_editor", permission_id: 66 },
//   { role_slug: "project_editor", permission_id: 67 },
//   { role_slug: "project_editor", permission_id: 69 },
//   { role_slug: "project_editor", permission_id: 68 },
//   { role_slug: "project_editor", permission_id: 78 },
//   { role_slug: "project_editor", permission_id: 60 },
//   { role_slug: "project_editor", permission_id: 59 },
//   { role_slug: "project_viewer", permission_id: 73 },
//   { role_slug: "project_viewer", permission_id: 72 },
//   { role_slug: "project_viewer", permission_id: 71 },
//   { role_slug: "project_viewer", permission_id: 77 },
//   { role_slug: "project_viewer", permission_id: 62 },
//   { role_slug: "project_viewer", permission_id: 63 },
//   { role_slug: "project_viewer", permission_id: 82 },
//   { role_slug: "project_viewer", permission_id: 66 },
//   { role_slug: "project_viewer", permission_id: 68 },
//   { role_slug: "project_viewer", permission_id: 78 },
//   { role_slug: "project_viewer", permission_id: 59 },
//   { role_slug: "space_editor", permission_id: 37 },
//   { role_slug: "space_editor", permission_id: 53 },
//   { role_slug: "space_editor", permission_id: 56 },
//   { role_slug: "space_editor", permission_id: 54 },
//   { role_slug: "space_editor", permission_id: 48 },
//   { role_slug: "space_editor", permission_id: 44 },
//   { role_slug: "space_editor", permission_id: 46 },
//   { role_slug: "space_editor", permission_id: 45 },
//   { role_slug: "space_editor", permission_id: 49 },
//   { role_slug: "space_editor", permission_id: 51 },
//   { role_slug: "space_editor", permission_id: 50 },
//   { role_slug: "space_editor", permission_id: 38 },
//   { role_slug: "space_editor", permission_id: 57 },
//   { role_slug: "space_editor", permission_id: 39 },
//   { role_slug: "space_editor", permission_id: 35 },
//   { role_slug: "space_editor", permission_id: 41 },
//   { role_slug: "space_editor", permission_id: 34 },
//   { role_slug: "space_viewer", permission_id: 37 },
//   { role_slug: "space_viewer", permission_id: 34 },
//   { role_slug: "space_viewer", permission_id: 41 },
//   { role_slug: "space_viewer", permission_id: 57 },
//   { role_slug: "space_viewer", permission_id: 50 },
//   { role_slug: "space_viewer", permission_id: 49 },
//   { role_slug: "space_viewer", permission_id: 45 },
//   { role_slug: "space_viewer", permission_id: 44 },
//   { role_slug: "space_viewer", permission_id: 48 },
//   { role_slug: "space_viewer", permission_id: 54 },
//   { role_slug: "space_viewer", permission_id: 53 },
//   { role_slug: "space_admin", permission_id: 37 },
//   { role_slug: "space_admin", permission_id: 53 },
//   { role_slug: "space_admin", permission_id: 55 },
//   { role_slug: "space_admin", permission_id: 56 },
//   { role_slug: "space_admin", permission_id: 54 },
//   { role_slug: "space_admin", permission_id: 36 },
//   { role_slug: "space_admin", permission_id: 48 },
//   { role_slug: "space_admin", permission_id: 44 },
//   { role_slug: "space_admin", permission_id: 47 },
//   { role_slug: "space_admin", permission_id: 46 },
//   { role_slug: "space_admin", permission_id: 45 },
//   { role_slug: "space_admin", permission_id: 49 },
//   { role_slug: "space_admin", permission_id: 52 },
//   { role_slug: "space_admin", permission_id: 51 },
//   { role_slug: "space_admin", permission_id: 50 },
//   { role_slug: "space_admin", permission_id: 38 },
//   { role_slug: "space_admin", permission_id: 57 },
//   { role_slug: "space_admin", permission_id: 39 },
//   { role_slug: "space_admin", permission_id: 35 },
//   { role_slug: "space_admin", permission_id: 40 },
//   { role_slug: "space_admin", permission_id: 43 },
//   { role_slug: "space_admin", permission_id: 42 },
//   { role_slug: "space_admin", permission_id: 41 },
//   { role_slug: "space_admin", permission_id: 34 },
//   { role_slug: "student", permission_id: 5 }, //chat.create
//   { role_slug: "student", permission_id: 6 }, //chat.view
//   { role_slug: "student", permission_id: 1 }, //posting.create
//   { role_slug: "student", permission_id: 2 }, //posting.view
//   { role_slug: "student", permission_id: 12 } //event.view
// ]

export const RolePermissionsSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      console.log("🗑️ Clearing existing role_permissions...")
      await tx.delete(rolePermissionsTable)
      await tx.execute(sql`TRUNCATE role_permissions RESTART IDENTITY CASCADE;`)
      console.log("✅ Cleared role_permissions")

      // 1️⃣ Fetch roles & permissions
      const roles = await tx
        .select()
        .from(rolesTable)
        .where(
          or(
            eq(rolesTable.role_type, "DEFAULT"),
            eq(rolesTable.role_type, "GLOBAL")
          )
        )
      const permissions = await tx.select().from(permissionsTable)

      const roleMap = new Map(roles.map((r) => [r.slug, r.id]))
      const permissionMap = new Map(
        permissions.map((p) => [`${p.namespace}:${p.action}`, p.id])
      )

      const rowsToInsert: { role_id: number; permission_id: number }[] = []

      // 2️⃣ Iterate through userRolePermissions
      for (const role of userRolePermissions) {
        const roleId = roleMap.get(role.role_slug)
        if (!roleId) {
          console.warn(`⚠️ Role not found in DB: ${role.role_slug}`)
          continue
        }

        for (const perm of role.permissions) {
          for (const action of perm.actions) {
            const key = `${perm.namespace}:${action}`
            const permissionId = permissionMap.get(key)
            if (!permissionId) {
              console.warn(`⚠️ Permission not found in DB: ${key}`)
              continue
            }

            rowsToInsert.push({
              role_id: roleId,
              permission_id: permissionId
            })
          }
        }
      }

      // 3️⃣ Insert into junction table
      if (rowsToInsert.length > 0) {
        console.log(rowsToInsert)
        await tx.insert(rolePermissionsTable).values(rowsToInsert)
        console.log(`✅ Inserted ${rowsToInsert.length} role_permissions`)
      } else {
        console.warn("⚠️ No role_permissions to insert!")
      }
    } catch (error) {
      console.error("❌ Error seeding role permissions:", error)
      tx.rollback() // Rollback the transaction on error
      process.exit(1) // Exit the process with an error code
    }
  })
}
