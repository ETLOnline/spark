// src/db/data-access/persona/query.ts
import { db } from "@/src/db"
import {
  permissionsTable,
  rolePermissionsTable,
  rolesTable,
  userRolesTable,
  usersTable
} from "@/src/db/schema"
import { RawPermissionRow } from "@/src/utils/clientHelper"
import { rolesUserCount } from "@/src/utils/helpers"
import { eq, sql, inArray, asc, and } from "drizzle-orm"

// Get all personas (standardized response)
export const getAllGlobalRoles = async () => {
  try {
    const personas = await db
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.role_type, "GLOBAL"))
    return personas
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// this is saving the perason after the sign up
export const saveUserGlobalRole = async (personaID: number, userId: string) => {
  try {
    const result = await db
      .update(usersTable)
      .set({
        meta_profile: sql`jsonb_set("meta_profile"::jsonb, '{persona_selected}', 'true', true)`
      })
      .where(eq(usersTable.unique_id, userId))
      .returning()

    const userRolesTableResult = await db
      .insert(userRolesTable)
      .values({
        user_id: userId,
        role_id: personaID
      })
      .returning()

    return result[0]
  } catch (error: any) {
    console.error("Error fetching persona by key:", error)
    throw new Error(error.message)
  }
}

// we are getting the roles all scope and global

export const getAllGlobalAndScopeRoles = async () => {
  try {
    const roles = await db.query.rolesTable.findMany({
      with: {
        permissions: {
          with: {
            permission: true
          }
        },
        users: true
      },
      orderBy: (rolesTable) => asc(rolesTable.name)
    })

    const rolesWithUserCount = rolesUserCount(roles)
    return rolesWithUserCount
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * we are getting permison on user id base
 * we will use to store this on sesion
 * right after the user is login
 */

export async function getUserPermissionRows(
  userId: string
): Promise<RawPermissionRow[]> {
  const result = await db
    .select({
      namespace: permissionsTable.namespace,
      action: permissionsTable.action,
      entity_type: rolesTable.entity_type,
      entity_id: rolesTable.entity_id
    })
    .from(userRolesTable)
    .innerJoin(rolesTable, eq(userRolesTable.role_id, rolesTable.id))
    .innerJoin(
      rolePermissionsTable,
      eq(rolePermissionsTable.role_id, rolesTable.id)
    )
    .innerJoin(
      permissionsTable,
      eq(rolePermissionsTable.permission_id, permissionsTable.id)
    )
    .where(eq(userRolesTable.user_id, userId))

  return result
}

export async function getAllPermissoins() {
  try {
    const allPermission = await db
      .select()
      .from(permissionsTable)
      .orderBy(asc(permissionsTable.namespace), asc(permissionsTable.action))
    return allPermission
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function getRoleWithPermissions(id: number) {
  try {
    const roles = await db.query.rolesTable.findFirst({
      where: eq(rolesTable.id, id),
      with: {
        permissions: true,
        users: true
      }
    })

    return roles
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function updateRoleWithPermissions(
  roleId: number,
  name: string,
  permissionIds: number[]
) {
  await db.transaction(async (trx) => {
    await trx.update(rolesTable).set({ name }).where(eq(rolesTable.id, roleId))

    await trx
      .delete(rolePermissionsTable)
      .where(eq(rolePermissionsTable.role_id, roleId))

    if (permissionIds.length > 0) {
      await trx.insert(rolePermissionsTable).values(
        permissionIds.map((pid) => ({
          role_id: roleId,
          permission_id: pid
        }))
      )
    }
  })
}

export async function createScopedRole({ name }: { name: string }) {
  try {
    const result = await db
      .insert(rolesTable)
      .values({
        name,
        role_type: "SCOPED",
        entity_type: null,
        entity_id: null
      })
      .returning({ id: rolesTable.id })

    return result[0]
  } catch (error: any) {
    throw new Error("Failed to create scoped role: " + error.message)
  }
}

export async function deleteRoleById(roleId: number) {
  return db.delete(rolesTable).where(eq(rolesTable.id, roleId))
}

export async function attachUsersToRole(roleId: number, userIds: string[]) {
  const values = userIds.map((user_id) => ({
    user_id,
    role_id: roleId
  }))

  try {
    await db.insert(userRolesTable).values(values).onConflictDoNothing()
    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}

export async function getUsersByRoleID(roleID: number) {
  const result = await db
    .select({
      user: usersTable,
      role: rolesTable
    })
    .from(usersTable)
    .innerJoin(userRolesTable, eq(usersTable.unique_id, userRolesTable.user_id))
    .innerJoin(rolesTable, eq(userRolesTable.role_id, rolesTable.id))
    .where(eq(rolesTable.id, roleID))

  return result.map((row) => ({
    ...row.user,
    role: row.role
  }))
}

/**
 * fetch the roles which are default
 * attached then while craeting thr channel
 * then when we create the space we will assign default channel role
 * then we will assign when we make the project same we will attach the profile role
 */

/**
 * Fetches default roles from the database.
 * Default roles are identified by 'DEFAULT' in the role_type column.
 */
export async function getDefaultRoleByName(slug: string) {
  try {
    const defaultRole = await db
      .select()
      .from(rolesTable)
      .where(
        and(eq(rolesTable.role_type, "DEFAULT"), eq(rolesTable.slug, slug))
      )
      .limit(1)

    return defaultRole[0]
  } catch (error: any) {
    console.error("Error fetching default role:", error)
    throw new Error(error.message)
  }
}

/**
 * Creates a new role for a specific channel by copying a default role's permissions,
 * and then assigns this new role to the channel creator.
 * @param defaultRoleId The ID of the default role to copy (e.g., 'Channel Role').
 * @param channelId The ID of the newly created channel.
 * @param userId The ID of the user creating the channel.
 * @param newRoleName The name for the new channel-specific role (e.g., "Channel Admin - [Channel Name]").
 * @returns The newly created role and the user role assignment.
 */
export async function createChannelRoleAndAssignUser(
  defaultRoleId: number,
  channelId: string,
  userId: string,
  newRoleName: string,
  roleSlug: string | null
) {
  await db.transaction(async (trx) => {
    try {
      // 1. Fetch the default role and its permissions
      const defaultRoleWithPermissions = await trx.query.rolesTable.findFirst({
        where: eq(rolesTable.id, defaultRoleId),
        with: {
          permissions: true
        }
      })

      if (!defaultRoleWithPermissions) {
        throw new Error(`Default role with ID ${defaultRoleId} not found.`)
      }

      // 2. Create the new channel-specific role
      const newRole = await trx
        .insert(rolesTable)
        .values({
          name: newRoleName,
          role_type: "SCOPED",
          slug: roleSlug,
          entity_type: "CHANNEL",
          entity_id: channelId
        })
        .returning({ id: rolesTable.id, name: rolesTable.name })

      if (!newRole[0]) {
        throw new Error("Failed to create new channel role.")
      }

      const newRoleId = newRole[0].id

      // 3. Copy permissions from the default role to the new role
      if (defaultRoleWithPermissions.permissions.length > 0) {
        const rolePermissionsToInsert =
          defaultRoleWithPermissions.permissions.map((rp) => ({
            role_id: newRoleId,
            permission_id: rp.permission_id
          }))

        await trx.insert(rolePermissionsTable).values(rolePermissionsToInsert)
      }

      // 4. Assign the newly created channel role to the user who created the channel
      await trx.insert(userRolesTable).values({
        user_id: userId,
        role_id: newRoleId
      })

      console.log(
        `Successfully created channel role '${newRole[0].name}' (${newRoleId}) for channel ${channelId} and assigned to user ${userId}.`
      )
      return { newRole: newRole[0] }
    } catch (error: any) {
      console.error("Error in createChannelRoleAndAssignUser:", error)
      trx.rollback() // Rollback transaction on error
      throw new Error(
        "Failed to create channel role and assign user: " + error.message
      )
    }
  })
}

/**
 * Creates a new role for a specific space by copying a default role's permissions,
 * and then assigns this new role to the space creator.
 * @param defaultRoleId The ID of the default role to copy (e.g., 'Space Role').
 * @param spaceId The ID of the newly created space.
 * @param userId The ID of the user creating the space.
 * @param newRoleName The name for the new space-specific role (e.g., "Space Admin - [Space Name]").
 * @returns The newly created role and the user role assignment.
 */
export async function createSpaceRoleAndAssignUser(
  defaultRoleId: number,
  spaceId: string,
  userId: string,
  newRoleName: string,
  roleSlug: string | null
) {
  await db.transaction(async (trx) => {
    try {
      // 1. Fetch the default role and its permissions
      const defaultRoleWithPermissions = await trx.query.rolesTable.findFirst({
        where: eq(rolesTable.id, defaultRoleId),
        with: {
          permissions: true
        }
      })

      if (!defaultRoleWithPermissions) {
        throw new Error(`Default role with ID ${defaultRoleId} not found.`)
      }

      // 2. Create the new space-specific role
      const newRole = await trx
        .insert(rolesTable)
        .values({
          name: newRoleName,
          role_type: "SCOPED",
          entity_type: "SPACE",
          entity_id: spaceId
        })
        .returning({ id: rolesTable.id, name: rolesTable.name })

      if (!newRole[0]) {
        throw new Error("Failed to create new space role.")
      }

      const newRoleId = newRole[0].id

      // 3. Copy permissions from the default role to the new role
      if (defaultRoleWithPermissions.permissions.length > 0) {
        const rolePermissionsToInsert =
          defaultRoleWithPermissions.permissions.map((rp) => ({
            role_id: newRoleId,
            permission_id: rp.permission_id
          }))

        await trx.insert(rolePermissionsTable).values(rolePermissionsToInsert)
      }

      // 4. Assign the newly created space role to the user who created the space
      await trx.insert(userRolesTable).values({
        user_id: userId,
        role_id: newRoleId
      })

      console.log(
        `Successfully created space role '${newRole[0].name}' (${newRoleId}) for space ${spaceId} and assigned to user ${userId}.`
      )
      return { newRole: newRole[0] }
    } catch (error: any) {
      console.error("Error in createSpaceRoleAndAssignUser:", error)
      trx.rollback() // Rollback transaction on error
      throw new Error(
        "Failed to create space role and assign user: " + error.message
      )
    }
  })
}

/**
 * Creates a new role for a specific project by copying a default role's permissions,
 * and then assigns this new role to the project creator.
 * @param defaultRoleId The ID of the default role to copy (e.g., 'Project Role').
 * @param projectId The ID of the newly created project.
 * @param userId The ID of the user creating the project.
 * @param newRoleName The name for the new project-specific role (e.g., "Project Admin - [Project Name]").
 * @returns The newly created role and the user role assignment.
 */
export async function createProjectRoleAndAssignUser(
  defaultRoleId: number,
  projectId: string,
  userId: string,
  newRoleName: string
) {
  await db.transaction(async (trx) => {
    try {
      // 1. Fetch the default role and its permissions
      const defaultRoleWithPermissions = await trx.query.rolesTable.findFirst({
        where: eq(rolesTable.id, defaultRoleId),
        with: {
          permissions: true
        }
      })

      if (!defaultRoleWithPermissions) {
        throw new Error(`Default role with ID ${defaultRoleId} not found.`)
      }

      // 2. Create the new project-specific role
      const newRole = await trx
        .insert(rolesTable)
        .values({
          name: newRoleName,
          role_type: "SCOPED", // New project role will be SCOPED
          entity_type: "PROJECT", // Link to the project entity
          entity_id: projectId // Store the project ID
        })
        .returning({ id: rolesTable.id, name: rolesTable.name })

      if (!newRole[0]) {
        throw new Error("Failed to create new project role.")
      }

      const newRoleId = newRole[0].id

      // 3. Copy permissions from the default role to the new role
      if (defaultRoleWithPermissions.permissions.length > 0) {
        const rolePermissionsToInsert =
          defaultRoleWithPermissions.permissions.map((rp) => ({
            role_id: newRoleId,
            permission_id: rp.permission_id
          }))

        await trx.insert(rolePermissionsTable).values(rolePermissionsToInsert)
      }

      // 4. Assign the newly created project role to the user who created the project
      await trx.insert(userRolesTable).values({
        user_id: userId,
        role_id: newRoleId
      })

      console.log(
        `Successfully created project role '${newRole[0].name}' (${newRoleId}) for project ${projectId} and assigned to user ${userId}.`
      )
      return { newRole: newRole[0] }
    } catch (error: any) {
      console.error("Error in createProjectRoleAndAssignUser:", error)
      trx.rollback() // Rollback transaction on error
      throw new Error(
        "Failed to create project role and assign user: " + error.message
      )
    }
  })
}
