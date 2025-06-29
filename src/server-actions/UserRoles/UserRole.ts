// src/actions/persona/getPersonasAction.ts
"use server"

import {
  attachUsersToRole,
  createScopedRole,
  deleteRoleById,
  getAllGlobalAndScopeRoles,
  getAllGlobalRoles,
  getAllPermissoins,
  getRoleByEntityTypeAndId,
  getRoleWithPermissions,
  getUserPermissionRows,
  getUsersByRoleID,
  saveUserGlobalRole,
  updateRoleWithPermissions,
  updateUserRoleForEntity
} from "@/src/db/data-access/roles/query"
import { CreateServerAction } from ".."
import {
  groupPermissionsByNamespace,
  serializeUserPerms,
  transformSingleRoleWithPermissions
} from "@/src/utils/helpers"
import { clerkClient } from "@clerk/nextjs/server"
import { buildUserPerms } from "@/src/utils/clientHelper"
import { updateChannelUser } from "@/src/db/data-access/channels/query"
import { updateSpaceUser } from "@/src/db/data-access/spaces/query"
import { updateProjectUserRole } from "@/src/db/data-access/project-management/query"

export const getPersonasAction = async () => {
  const globalRoles = await getAllGlobalRoles()
  return { success: true, data: globalRoles }
}

export const getUserPermissionRowsAction = CreateServerAction(
  true,
  async (userId: string) => {
    try {
      const permissionRows = await getUserPermissionRows(userId)
      return { success: true, data: permissionRows }
    } catch (error) {
      console.error("Error :", error)
      return { success: false, error: "Failed to get permissions" }
    }
  }
)

export const savePersonaAction = CreateServerAction(
  true,
  async (personaID: number, userId: string, externalAuthId) => {
    try {
      const attachPersona = await saveUserGlobalRole(personaID, userId)
      return { success: true, data: attachPersona }
    } catch (error) {
      console.error("Error saving persona:", error)
      return { success: false, error: "Failed to save persona" }
    }
  }
)

export const getAllGlobalAndScopeRolesAction = CreateServerAction(
  true,
  async () => {
    try {
      const roles = await getAllGlobalAndScopeRoles()
      return { success: true, data: roles }
    } catch (error) {
      console.error("Error saving persona:", error)
      return { success: false, error: "Failed to save persona" }
    }
  }
)

export async function GetPermissionCategoriesAction() {
  try {
    const all = await getAllPermissoins()
    const grouped = groupPermissionsByNamespace(all)
    return { success: true, data: grouped }
  } catch (error) {
    return { error: error }
  }
}
export async function GetRoleWithPermissionsAction(id: number) {
  try {
    const role = await getRoleWithPermissions(id)
    if (!role) {
      return { success: false, error: "Role not found" }
    }
    const rolesTrasfrom = transformSingleRoleWithPermissions(role)
    return { success: true, data: rolesTrasfrom }
  } catch (error) {
    return { error: error }
  }
}

export async function SaveRoleWithPermissionsAction(
  roleId: number,
  name: string,
  permissionIds: number[]
) {
  try {
    await updateRoleWithPermissions(roleId, name, permissionIds)
    return { success: true }
  } catch (error) {
    console.error("Failed to save role", error)
    return { success: false, error: "Failed to update role" }
  }
}

export async function CreateRoleAction(formData: { name: string }) {
  try {
    const newRole = await createScopedRole(formData)
    return { success: true, data: newRole }
  } catch (error) {
    return { error: error }
  }
}

export async function deleteRoleAction(roleId: number) {
  try {
    await deleteRoleById(roleId)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getUsersByRoleIDAction(id: number) {
  try {
    const userbyRole = await getUsersByRoleID(id)
    if (!userbyRole) {
      return { success: false, error: "Role not found" }
    }
    return { success: true, data: userbyRole }
  } catch (error) {
    return { error: error }
  }
}
export async function getRoleByEntityTypeAndIdAction(
  entityType: "CHANNEL" | "SPACE" | "PROJECT",
  id: string
) {
  try {
    const scopedROles = await getRoleByEntityTypeAndId(entityType, id)
    if (!scopedROles) {
      return { success: false, error: "Roles not found" }
    }
    return { success: true, data: scopedROles }
  } catch (error) {
    return { error: error }
  }
}

export const updateUserRoleForEntityAction = CreateServerAction(
  true,
  async (
    userId: string,
    entityId: string,
    entityType: "CHANNEL" | "SPACE" | "PROJECT",
    newRoleId: number,
    oldRoleId: number,
    newRoleName: string
  ) => {
    try {
      const result = await updateUserRoleForEntity(
        userId,
        entityId,
        entityType,
        newRoleId,
        oldRoleId
      )
      // here we will also change the eneity attach user like channel_user, space_user, project_user
      if (entityType === "CHANNEL") {
        await updateChannelUser(entityId, userId, { role: newRoleName })
      } else if (entityType === "SPACE") {
        await updateSpaceUser(entityId, userId, { role: newRoleName })
      } else {
        await updateProjectUserRole(entityId, userId, newRoleName)
      }
      return { success: true, data: result }
    } catch (error: any) {
      console.error("Error updating user role for entity:", error)
      return {
        success: false,
        error: error.message || "Failed to update user role for entity"
      }
    }
  }
)
