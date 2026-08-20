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
      },
      {
        namespace: "mentorship",
        actions: [permissions.mentorship.sessionRequest]
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
      },
      {
        namespace: "mentorship",
        actions: [permissions.mentorship.addAvailability]
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
          permissions.community.userEmailInvite,
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
          permissions.project.view,
          permissions.project.DetailView,
          permissions.project.ChatView
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
          permissions.project.view,
          permissions.project.DetailView,
          permissions.project.ChatView
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
          permissions.project.view,
          permissions.project.DetailView,
          permissions.project.ChatView
        ]
      }
    ]
  }
]

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
