import { db } from "../index"
import { permissionsTable, rolePermissionsTable, rolesTable } from "../schema"
import { inArray, InferInsertModel, eq, and } from "drizzle-orm"

const permissionSeedList = [
  { namespace: "community", action: "user.invite" },
  { namespace: "community", action: "user.update" },
  { namespace: "community", action: "user.remove" }
]

export const CommunityUserListRolePermission = async () => {
  return await db.transaction(async (tx) => {
    try {
      console.log("Starting CommunityUserListRolePermission seeding process...")

      // 1. Seed permissions if they don't already exist
      console.log("Step 1: Checking for existing permissions...")
      const existingPermissions = await tx
        .select()
        .from(permissionsTable)
        .where(
          inArray(
            permissionsTable.action,
            permissionSeedList.map((p) => p.action)
          )
        )
      console.log(
        "Existing Permissions Found:",
        existingPermissions.map((p) => ({ id: p.id, action: p.action }))
      )

      const permissionsToInsert = permissionSeedList.filter(
        (newPerm) =>
          !existingPermissions.some(
            (existingPerm) =>
              existingPerm.action === newPerm.action &&
              existingPerm.namespace === newPerm.namespace
          )
      )
      console.log("Permissions To Insert:", permissionsToInsert)

      let insertedPermissions: { id: number; action: string }[] = []

      if (permissionsToInsert.length > 0) {
        insertedPermissions = await tx
          .insert(permissionsTable)
          .values(permissionsToInsert)
          .returning({
            id: permissionsTable.id,
            action: permissionsTable.action
          })

        if (insertedPermissions.length === permissionsToInsert.length) {
          console.log(
            `✅ Seeded ${insertedPermissions.length} new permissions successfully.`
          )
        } else {
          console.warn(
            `⚠️ Expected to insert ${permissionsToInsert.length} but got ${insertedPermissions.length}`
          )
        }
      } else {
        console.log(
          "No new permissions to seed for community user list; all already exist."
        )
      }

      // 2. Determine the definitive IDs for the permissions
      console.log("Step 2: Determining definitive permission IDs...")

      const allDefinitivePermissionsMap = new Map<
        string,
        { id: number; action: string }
      >()

      insertedPermissions.forEach((p) =>
        allDefinitivePermissionsMap.set(p.action, p)
      )
      existingPermissions.forEach((p) => {
        if (!allDefinitivePermissionsMap.has(p.action)) {
          allDefinitivePermissionsMap.set(p.action, p)
        }
      })

      const invitePermission = allDefinitivePermissionsMap.get("user.invite")
      const updatePermission = allDefinitivePermissionsMap.get("user.update")
      const removePermission = allDefinitivePermissionsMap.get("user.remove")

      console.log(
        "Definitive invitePermission:",
        invitePermission
          ? `ID: ${invitePermission.id}, Action: ${invitePermission.action}`
          : "Not Found"
      )
      console.log(
        "Definitive updatePermission:",
        updatePermission
          ? `ID: ${updatePermission.id}, Action: ${updatePermission.action}`
          : "Not Found"
      )
      console.log(
        "Definitive removePermission:",
        removePermission
          ? `ID: ${removePermission.id}, Action: ${removePermission.action}`
          : "Not Found"
      )

      if (!invitePermission || !updatePermission || !removePermission) {
        throw new Error(
          "One or more required community user permissions (user.invite, user.update, user.remove) not found after seeding/fetching."
        )
      }

      // 3. Fetch community roles
      console.log("Step 3: Fetching community roles...")
      const specificCommunityRoles = await tx
        .select()
        .from(rolesTable)
        .where(
          and(
            inArray(rolesTable.slug, ["community_admin", "community_editor"]),
            eq(rolesTable.role_type, "DEFAULT")
          )
        )

      const communityAdminRole = specificCommunityRoles.find(
        (role) => role.slug === "community_admin"
      )
      const communityEditorRole = specificCommunityRoles.find(
        (role) => role.slug === "community_editor"
      )

      console.log(
        "Fetched Community Admin Role:",
        communityAdminRole
          ? `ID: ${communityAdminRole.id}, Slug: ${communityAdminRole.slug}, Type: ${communityAdminRole.role_type}`
          : "Not Found"
      )
      console.log(
        "Fetched Community Editor Role:",
        communityEditorRole
          ? `ID: ${communityEditorRole.id}, Slug: ${communityEditorRole.slug}, Type: ${communityEditorRole.role_type}`
          : "Not Found"
      )

      if (!communityAdminRole || !communityEditorRole) {
        throw new Error(
          "Community Admin or Editor role (type DEFAULT) not found."
        )
      }

      const permissionsToAttach: InferInsertModel<
        typeof rolePermissionsTable
      >[] = []

      // Attach all three permissions to Community Admin (using the dynamically obtained IDs)
      permissionsToAttach.push(
        { role_id: communityAdminRole.id, permission_id: invitePermission.id },
        { role_id: communityAdminRole.id, permission_id: updatePermission.id },
        { role_id: communityAdminRole.id, permission_id: removePermission.id }
      )

      // Attach invite and update permissions to Community Editor (using the dynamically obtained IDs)
      permissionsToAttach.push(
        { role_id: communityEditorRole.id, permission_id: invitePermission.id },
        { role_id: communityEditorRole.id, permission_id: updatePermission.id }
      )

      console.log("Permissions defined to attach:", permissionsToAttach)

      // 4. Insert role permissions, filtering out existing ones for idempotency
      console.log("Step 4: Checking for existing role permissions...")
      const existingRolePermissions = await tx
        .select()
        .from(rolePermissionsTable)
        .where(
          inArray(rolePermissionsTable.role_id, [
            communityAdminRole.id,
            communityEditorRole.id
          ])
        )
      console.log("Existing Role Permissions Found:", existingRolePermissions)

      const uniquePermissionsToInsert = permissionsToAttach.filter(
        (newRp) =>
          !existingRolePermissions.some(
            (existingRp) =>
              existingRp.role_id === newRp.role_id &&
              existingRp.permission_id === newRp.permission_id
          )
      )

      console.log(
        "Unique Role Permissions To Insert:",
        uniquePermissionsToInsert
      )

      let insertedRolePermissionsCount = 0
      if (uniquePermissionsToInsert.length > 0) {
        console.log(
          `Attempting to insert ${uniquePermissionsToInsert.length} new role permissions...`
        )
        const result = await tx
          .insert(rolePermissionsTable)
          .values(uniquePermissionsToInsert)
          .returning()
        insertedRolePermissionsCount = result.length
        console.log("Insertion result:", result)

        if (insertedRolePermissionsCount === uniquePermissionsToInsert.length) {
          console.log(
            `✅ Seeded ${insertedRolePermissionsCount} new role permissions successfully.`
          )
        } else {
          console.warn(
            `⚠️ Expected to insert ${uniquePermissionsToInsert.length} new role permissions but got ${insertedRolePermissionsCount}`
          )
        }
      } else {
        console.log(
          "No new role permissions to seed for community user list roles; all already exist."
        )
      }

      console.log(
        "CommunityUserListRolePermission seeding process completed successfully."
      )
    } catch (error) {
      console.error("❌ Error seeding community user list permissions:", error)
      await tx.rollback()
      process.exit(1)
    }
  })
}
