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

/**
 * Creates a scoped role with optional entity type, entity ID, and slug.
 * This function now manages its own transaction.
 * @param params Object containing:
 * @param params.name The name of the role.
 * @param params.roleSlug The slug of the role (optional, defaults to null).
 * @param params.entityType The type of the entity (e.g., "CHANNEL", "SPACE", "PROJECT") (optional, defaults to null).
 * @param params.entityId The ID of the entity (optional, defaults to null).
 * @returns The newly created role.
 */
export async function createScopedRole(params: {
  name: string
  roleSlug?: string | null
  entityType?: string | null
  entityId?: string | null
}) {
  const { name, roleSlug = null, entityType = null, entityId = null } = params
  try {
    const result = await db.transaction(async (trx) => {
      // Internal transaction
      const insertedRole = await trx
        .insert(rolesTable)
        .values({
          name,
          role_type: "SCOPED",
          slug: roleSlug,
          entity_type: entityType,
          entity_id: entityId
        })
        .returning({
          id: rolesTable.id,
          name: rolesTable.name,
          slug: rolesTable.slug
        })
      return insertedRole[0]
    })
    return result
  } catch (error: any) {
    console.error("Error creating scoped role:", error)
    throw new Error(
      `Failed to create scoped role with name '${name}': ${error.message}`
    )
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
export async function getDefaultRolesBySlugs(slugs: string[]) {
  try {
    const defaultRoles = await db.query.rolesTable.findMany({
      where: and(
        eq(rolesTable.role_type, "DEFAULT"),
        inArray(rolesTable.slug, slugs)
      ),
      with: {
        permissions: true
      }
    })

    if (defaultRoles.length !== slugs.length) {
      throw new Error("Some default roles were not found.")
    }

    return defaultRoles
  } catch (error: any) {
    console.error("Error fetching default roles:", error)
    throw new Error(error.message)
  }
}

/**
 * Creates all default channel-scoped roles (Admin, Editor, Viewer) for a new channel
 * and assigns the 'Channel Admin' role to the channel creator.
 * @param channelId The ID of the newly created channel.
 * @param channelName The name of the newly created channel (for role naming).
 * @param creatorUserId The ID of the user who created the channel.
 */
export async function createScopedChannelRolesAndAssignAdmin(
  channelId: string,
  channelName: string,
  creatorUserId: string
) {
  return await db.transaction(async (trx) => {
    try {
      const defaultRoleSlugs = [
        "channel_admin",
        "channel_editor",
        "channel_viewer"
      ]
      const defaultRoles = await getDefaultRolesBySlugs(defaultRoleSlugs)
      const createdScopedRoles: {
        id: number
        name: string
        slug: string | null
      }[] = []
      for (const getDefaultRole of defaultRoles) {
        const createRoleName = `${channelName} ${getDefaultRole.name}`
        const newScopedRole = await createScopedRole({
          name: createRoleName,
          roleSlug: getDefaultRole.slug,
          entityType: "CHANNEL",
          entityId: channelId
        })

        if (!newScopedRole) {
          throw new Error(
            `Failed to create scoped role for ${getDefaultRole.name}.`
          )
        }

        const newScopedRoleId = newScopedRole.id
        createdScopedRoles.push(newScopedRole)

        // Copy permissions from default role to new scoped role
        if (getDefaultRole.permissions.length > 0) {
          const rolePermissionsToInsert = getDefaultRole.permissions.map(
            (rp) => ({
              role_id: newScopedRoleId,
              permission_id: rp.permission_id
            })
          )
          await trx.insert(rolePermissionsTable).values(rolePermissionsToInsert)
        }
      }

      // Find the newly created "Channel Admin" scoped role among the created roles
      const adminRole = createdScopedRoles.find(
        (role) => role.slug === "channel_admin"
      )

      if (adminRole) {
        // Assign only the "Channel Admin" scoped role to the channel creator
        await trx.insert(userRolesTable).values({
          user_id: creatorUserId,
          role_id: adminRole.id
        })
        console.log(
          `Assigned scoped Channel Admin role (${adminRole.name}) to user ${creatorUserId} for channel ${channelId}.`
        )
      } else {
        console.warn(
          "Scoped Channel Admin role not found after creation. User not assigned as admin."
        )
      }

      return {
        success: true,
        createdRoles: createdScopedRoles,
        adminRole: adminRole
      }
    } catch (error: any) {
      console.error("Error in createScopedChannelRolesAndAssignAdmin:", error)
      trx.rollback() // Rollback transaction on error
      throw new Error(`Failed to create scoped channel roles: ${error.message}`)
    }
  })
}

/**
 * Creates all default space-scoped roles (Admin, Editor, Viewer) for a new space
 * and assigns the 'Space Admin' role to the space creator.
 * @param spaceId The ID of the newly created space.
 * @param spaceName The name of the newly created space (for role naming).
 * @param creatorUserId The ID of the user who created the space.
 */
export async function createScopedSpaceRolesAndAssignAdmin(
  spaceId: string,
  spaceName: string,
  creatorUserId: string
) {
  return await db.transaction(async (trx) => {
    try {
      const defaultRoleSlugs = ["space_admin", "space_editor", "space_viewer"] // Define space role slugs
      const defaultRoles = await getDefaultRolesBySlugs(defaultRoleSlugs) // Fetch default roles
      const createdScopedRoles: {
        id: number
        name: string
        slug: string | null
      }[] = []

      for (const getDefaultRole of defaultRoles) {
        const roleName = getDefaultRole.name || "Default Space Role"
        const createRoleName = `${spaceName} ${roleName}` // Naming convention for space roles

        const newScopedRole = await createScopedRole({
          name: createRoleName,
          roleSlug: getDefaultRole.slug,
          entityType: "SPACE",
          entityId: spaceId
        })

        if (!newScopedRole) {
          throw new Error(
            `Failed to create scoped role for ${getDefaultRole.name}.`
          )
        }

        const newScopedRoleId = newScopedRole.id
        createdScopedRoles.push(newScopedRole)

        // Copy permissions
        if (getDefaultRole.permissions.length > 0) {
          const rolePermissionsToInsert = getDefaultRole.permissions.map(
            (rp) => ({
              role_id: newScopedRoleId,
              permission_id: rp.permission_id
            })
          )
          await trx.insert(rolePermissionsTable).values(rolePermissionsToInsert)
        }
      }

      // Find the newly created "Space Admin" scoped role
      const adminRole = createdScopedRoles.find(
        (role) => role.slug === "space_admin"
      )

      if (adminRole) {
        // Assign only the "Space Admin" scoped role to the space creator
        await trx.insert(userRolesTable).values({
          user_id: creatorUserId,
          role_id: adminRole.id
        })
        console.log(
          `Assigned scoped Space Admin role (${adminRole.name}) to user ${creatorUserId} for space ${spaceId}.`
        )
      } else {
        console.warn(
          "Scoped Space Admin role not found after creation. User not assigned as admin."
        )
      }

      return {
        success: true,
        createdRoles: createdScopedRoles,
        adminRole: adminRole
      }
    } catch (error: any) {
      console.error("Error in createScopedSpaceRolesAndAssignAdmin:", error)
      trx.rollback()
      throw new Error(`Failed to create scoped space roles: ${error.message}`)
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
 * @param roleSlug The slug of the default role. // Added roleSlug parameter
 * @returns The newly created role and the user role assignment.
 */
/**
 * Creates all default project-scoped roles (Admin, Editor, Viewer) for a new project
 * and assigns the 'Project Admin' role to the project creator.
 * @param projectId The ID of the newly created project.
 * @param projectName The name of the newly created project (for role naming).
 * @param creatorUserId The ID of the user who created the project.
 */
export async function createScopedProjectRolesAndAssignAdmin( // Renamed and refactored
  projectId: string,
  projectName: string,
  creatorUserId: string
) {
  return await db.transaction(async (trx) => {
    try {
      const defaultRoleSlugs = [
        "project_admin",
        "project_editor",
        "project_viewer"
      ]
      const defaultRoles = await getDefaultRolesBySlugs(defaultRoleSlugs)
      const createdScopedRoles: {
        id: number
        name: string
        slug: string | null
      }[] = []

      for (const getDefaultRole of defaultRoles) {
        const roleName = getDefaultRole.name || "Default Project Role"
        const createRoleName = `${projectName} ${roleName}`

        const newScopedRole = await createScopedRole({
          name: createRoleName,
          roleSlug: getDefaultRole.slug,
          entityType: "PROJECT",
          entityId: projectId
        })

        if (!newScopedRole) {
          throw new Error(
            `Failed to create scoped role for ${getDefaultRole.name}.`
          )
        }

        const newScopedRoleId = newScopedRole.id
        createdScopedRoles.push(newScopedRole)

        // Copy permissions from default role to new scoped role
        if (getDefaultRole.permissions.length > 0) {
          const rolePermissionsToInsert = getDefaultRole.permissions.map(
            (rp) => ({
              role_id: newScopedRoleId,
              permission_id: rp.permission_id
            })
          )
          await trx.insert(rolePermissionsTable).values(rolePermissionsToInsert)
        }
      }

      // Find the newly created "Project Admin" scoped role
      const adminRole = createdScopedRoles.find(
        (role) => role.slug === "project_admin"
      )

      if (adminRole) {
        // Assign only the "Project Admin" scoped role to the project creator
        await trx.insert(userRolesTable).values({
          user_id: creatorUserId,
          role_id: adminRole.id
        })
        console.log(
          `Assigned scoped Project Admin role (${adminRole.name}) to user ${creatorUserId} for project ${projectId}.`
        )
      } else {
        console.warn(
          "Scoped Project Admin role not found after creation. User not assigned as admin."
        )
      }

      return {
        success: true,
        createdRoles: createdScopedRoles,
        adminRole: adminRole
      }
    } catch (error: any) {
      console.error("Error in createScopedProjectRolesAndAssignAdmin:", error)
      trx.rollback()
      throw new Error(`Failed to create scoped project roles: ${error.message}`)
    }
  })
}

/**
 * Fetches the specific viewer role based on roleSlug and entityType.
 * @param roleSlug The slug of the role ("channel_viewer" or "space_viewer").
 * @param entityId The ID of the specific channel or space.
 * @returns The viewer role or null if not found.
 */
async function fetchViewerRole(
  roleSlug: "channel_viewer" | "space_viewer" | "project_viewer",
  entityId: string
) {
  try {
    // Determine the actual entity type (CHANNEL or SPACE) based on the ro    let entityType: "CHANNEL" | "SPACE" | "PROJECT";
    let entityType: "CHANNEL" | "SPACE" | "PROJECT"

    if (roleSlug.includes("channel")) {
      entityType = "CHANNEL"
    } else if (roleSlug.includes("space")) {
      entityType = "SPACE"
    } else if (roleSlug.includes("project")) {
      entityType = "PROJECT"
    } else {
      throw new Error("Invalid roleSlug provided")
    }

    // Fetch the specific viewer role for the given entity
    const viewerRole = await db.query.rolesTable.findFirst({
      where: and(
        eq(rolesTable.slug, roleSlug), // Use the provided roleSlug directly
        eq(rolesTable.entity_type, entityType), // Use the derived entityType
        eq(rolesTable.entity_id, entityId)
      )
    })

    if (!viewerRole) {
      console.warn(
        `Viewer role '${roleSlug}' not found for ${entityType} ID ${entityId}.`
      )
      return null
    }

    return viewerRole
  } catch (error: any) {
    console.error("Error in fetchViewerRole:", error)
    throw new Error(`Failed to fetch viewer role: ${error.message}`)
  }
}

/**
 * Fetches specific viewer roles (channel_viewer or space_viewer) based on entity type and ID,
 * and assigns them to a given user.
 * @param userId The ID of the user to assign the roles to.
 * @param roleSlug The slug of the role ("channel_viewer" or "space_viewer").
 * @param entityId The ID of the specific channel or space.
 * @returns A success status and a list of assigned role IDs.
 */
export async function getAndAssignViewerRoles(
  userId: string,
  roleSlug: "channel_viewer" | "space_viewer" | "project_viewer",
  entityId: string
) {
  return await db.transaction(async (trx) => {
    try {
      // Fetch the viewer role using the helper function
      const viewerRole = await fetchViewerRole(roleSlug, entityId)

      if (!viewerRole) {
        return { success: false, viewerRole: { name: "" } }
      }

      // Check if the user already has this role to prevent duplicates
      const existingUserRole = await trx.query.userRolesTable.findFirst({
        where: and(
          eq(userRolesTable.user_id, userId),
          eq(userRolesTable.role_id, viewerRole.id)
        )
      })

      if (existingUserRole) {
        console.log(
          `User ${userId} already has role ${viewerRole.name} (${viewerRole.id}) for entity ID ${entityId}. Skipping assignment.`
        )
        return { success: true, viewerRole: viewerRole }
      }

      // Assign the viewer role to the user
      await attachUsersToRole(viewerRole.id, [userId])

      console.log(
        `Assigned viewer role (${viewerRole.name}) to user ${userId} for entity ID ${entityId}.`
      )
      return { success: true, viewerRole: viewerRole }
    } catch (error: any) {
      console.error("Error in getAndAssignViewerRoles:", error)
      trx.rollback()
      throw new Error(`Failed to get and assign viewer role: ${error.message}`)
    }
  })
}

/**
 * Fetches all roles for a given entity type and ID.
 * @param entityType The type of entity (channel, space, project)
 * @param entityId The ID of the specific entity
 * @returns A list of roles matching the entity type and ID, or null if no roles are found.
 */
export async function getRoleByEntityTypeAndId(
  entityType: "CHANNEL" | "SPACE" | "PROJECT",
  entityId: string
) {
  try {
    const roles = await db.query.rolesTable.findMany({
      where: and(
        eq(rolesTable.entity_type, entityType),
        eq(rolesTable.entity_id, entityId)
      )
    })

    if (!roles || roles.length === 0) {
      console.warn(
        `No roles found for entity type: ${entityType} and entity ID: ${entityId}.`
      )
      return null
    }

    return roles
  } catch (error: any) {
    console.error("Error fetching roles by entity type and ID:", error)
    throw new Error(error.message)
  }
}

export async function updateUserRoleForEntity(
  userId: string,
  entityId: string,
  entityType: "CHANNEL" | "SPACE" | "PROJECT",
  newRoleId: number,
  oldRoleId: number
) {
  return await db.transaction(async (trx) => {
    try {
      // Fetch existing user roles for the given entity type and ID
      const existingUserRolesForEntity = await trx
        .select({
          userRoleId: userRolesTable.user_id,
          roleId: rolesTable.id
        })
        .from(userRolesTable)
        .innerJoin(rolesTable, eq(userRolesTable.role_id, rolesTable.id))
        .where(
          and(
            eq(userRolesTable.user_id, userId),
            eq(rolesTable.entity_type, entityType),
            eq(rolesTable.entity_id, entityId)
          )
        )

      const existingUserRoleIdsToDelete = existingUserRolesForEntity
        .filter((entry) => entry.roleId === oldRoleId) // Filter to delete the specific old role
        .map((entry) => entry.userRoleId)

      if (existingUserRoleIdsToDelete.length > 0) {
        // Delete the old role for the user
        await trx
          .delete(userRolesTable)
          .where(
            and(
              eq(userRolesTable.role_id, oldRoleId),
              eq(userRolesTable.user_id, userId)
            )
          )

        console.log(
          `Deleted ${existingUserRoleIdsToDelete.length} old roles for user ${userId} in ${entityType} ${entityId}.`
        )
      } else {
        console.log(
          `No old role with ID ${oldRoleId} found for user ${userId} in ${entityType} ${entityId}.`
        )
      }

      // Assign the new role
      const assignedRole = await trx
        .insert(userRolesTable)
        .values({
          user_id: userId,
          role_id: newRoleId
        })
        .returning()

      console.log(
        `Assigned new role ID ${newRoleId} to user ${userId} for ${entityType} ${entityId}.`
      )

      return { success: true, assignedRole: assignedRole[0] }
    } catch (error: any) {
      console.error(
        `Error updating user role for ${entityType} ${entityId} and user ${userId}:`,
        error
      )
      trx.rollback() // Rollback the transaction in case of error
      throw new Error(`Failed to update user role: ${error.message}`)
    }
  })
}
