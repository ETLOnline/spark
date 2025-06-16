// src/actions/persona/getPersonasAction.ts
"use server"

import {
  attachUsersToRole,
  createScopedRole,
  deleteRoleById,
  getAllGlobalAndScopeRoles,
  getAllGlobalRoles,
  getAllPermissoins,
  getRoleWithPermissions,
  getUserPermissionRows,
  getUsersByRoleID,
  saveUserGlobalRole,
  updateRoleWithPermissions
} from "@/src/db/data-access/roles/query"
import { CreateServerAction } from ".."
import {
  groupPermissionsByNamespace,
  serializeUserPerms,
  transformSingleRoleWithPermissions
} from "@/src/utils/helpers"
import { clerkClient } from "@clerk/nextjs/server"
import { buildUserPerms } from "@/src/lib/permissions.config"

export const getPersonasAction = async () => {
  const globalRoles = await getAllGlobalRoles()
  return { success: true, data: globalRoles }
}

export async function attachPermissionsInClaimClerk(
  userId: string,
  externalAuthId: string
) {
  const permissionRows = await getUserPermissionRows(userId)
  const userPerms = buildUserPerms(permissionRows)
  const serializedPerms = serializeUserPerms(userPerms)
  const clerk = await clerkClient()
  const user = clerk.users.updateUserMetadata(externalAuthId, {
    publicMetadata: {
      permissions: serializedPerms
    }
  })
}

export const savePersonaAction = CreateServerAction(
  true,
  async (personaID: number, userId: string, externalAuthId) => {
    try {
      const attachPersona = await saveUserGlobalRole(personaID, userId)
      const attachedClaims = await attachPermissionsInClaimClerk(
        userId,
        externalAuthId
      )
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

export async function attachUsersToRoleAction(
  roleId: number,
  userIds: string[]
) {
  const rolesAttached = await attachUsersToRole(roleId, userIds)
  // const attachedClaims =  await attachPermissionsInClaimClerk(userId, externalAuthId)
  return rolesAttached
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
