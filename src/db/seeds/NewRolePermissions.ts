import { db } from "../index"
import { rolePermissionsTable, rolesTable } from "../schema"
import { InferInsertModel } from "drizzle-orm"

// Define the type for the roles for clarity
type RoleInsert = InferInsertModel<typeof rolesTable>

const roleSeedList: RoleInsert[] = [
  {
    name: "Community Admin",
    role_type: "DEFAULT",
    slug: "community_admin",
    entity_type: null,
    entity_id: null
  },
  {
    name: "Community Editor",
    role_type: "DEFAULT",
    slug: "community_editor",
    entity_type: null,
    entity_id: null
  },
  {
    name: "Community Viewer",
    role_type: "DEFAULT",
    slug: "community_viewer",
    entity_type: null,
    entity_id: null
  }
]

export const NewRolePermissions = async () => {
  return await db.transaction(async (tx) => {
    try {
      const insertedRoles = await tx
        .insert(rolesTable)
        .values(roleSeedList)
        .returning({
          id: rolesTable.id,
          slug: rolesTable.slug
        })

      if (insertedRoles.length === roleSeedList.length) {
        console.log(`✅ Seeded ${insertedRoles.length} roles successfully.`)
      } else {
        console.warn(
          `⚠️ Expected to insert ${roleSeedList.length} but got ${insertedRoles.length}`
        )
      }

      const communityAdminRole = insertedRoles.find(
        (role) => role.slug === "community_admin"
      )
      const communityEditorRole = insertedRoles.find(
        (role) => role.slug === "community_editor"
      )
      const communityViewerRole = insertedRoles.find(
        (role) => role.slug === "community_viewer"
      )

      if (!communityAdminRole || !communityEditorRole || !communityViewerRole) {
        throw new Error("One or more required roles not found after insertion.")
      }

      const adminRoleId = communityAdminRole.id
      const editorRoleId = communityEditorRole.id
      const viewerRoleId = communityViewerRole.id

      const allPermissionsToSeed = [
        { role_id: adminRoleId, permission_id: 65 },
        { role_id: adminRoleId, permission_id: 64 },
        { role_id: adminRoleId, permission_id: 63 },
        { role_id: adminRoleId, permission_id: 13 },

        { role_id: editorRoleId, permission_id: 13 },
        { role_id: editorRoleId, permission_id: 66 },
        { role_id: editorRoleId, permission_id: 64 },
        { role_id: editorRoleId, permission_id: 63 },

        { role_id: viewerRoleId, permission_id: 66 },
        { role_id: viewerRoleId, permission_id: 63 }
      ]

      const insertedPermissions = await tx
        .insert(rolePermissionsTable)
        .values(allPermissionsToSeed)

      if (insertedPermissions.count === allPermissionsToSeed.length) {
        console.log(
          `✅ Seeded ${insertedPermissions.count} permissions successfully for all roles.`
        )
      } else {
        console.warn(
          `⚠️ Expected to insert ${allPermissionsToSeed.length} permissions but got ${insertedPermissions.count}`
        )
      }
    } catch (error) {
      console.error("❌ Error seeding roles and permissions:", error)
      tx.rollback()
      process.exit(1)
    }
  })
}
