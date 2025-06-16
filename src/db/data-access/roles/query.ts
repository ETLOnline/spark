// src/db/data-access/persona/query.ts
import { db } from "@/src/db"
import {
  permissionsTable,
  rolePermissionsTable,
  rolesTable,
  userRolesTable,
  usersTable
} from "@/src/db/schema"
import { RawPermissionRow } from "@/src/lib/permissions.config"
import { rolesUserCount } from "@/src/utils/helpers"
import { eq, sql, inArray, asc } from "drizzle-orm"

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
      }
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
