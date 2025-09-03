"use server"

import {
  attachUsersToRole,
  createScopedRole,
  deleteRoleById,
  getAllGlobalRolesWithUserCount,
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
import { updateCommunityUser } from "@/src/db/data-access/communities/query"

export const getPersonasAction = CreateServerAction(true, async () => {
  const globalRoles = await getAllGlobalRoles()
  return { success: true, data: globalRoles }
})

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

export const GetUserPermissionsParsedAction = CreateServerAction(
  true,
  async (userId: string) => {
    try {
      const permissionRows = await getUserPermissionRows(userId)
      let permissions = null
      if (permissionRows.length > 0) {
        permissions = buildUserPerms(permissionRows)
      }
      return { success: true, data: permissions }
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
      const roles = await getAllGlobalRolesWithUserCount()
      return { success: true, data: roles }
    } catch (error) {
      console.error("Error saving persona:", error)
      return { success: false, error: "Failed to save persona" }
    }
  }
)

export const GetPermissionCategoriesAction = CreateServerAction(
  true,
  async () => {
    try {
      const all = await getAllPermissoins()
      const grouped = groupPermissionsByNamespace(all)
      return { success: true, data: grouped }
    } catch (error) {
      return { error: error }
    }
  }
)
export const GetRoleWithPermissionsAction = CreateServerAction(
  true,
  async (id: number) => {
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
)

export const SaveRoleWithPermissionsAction = CreateServerAction(
  true,
  async (roleId: number, name: string, permissionIds: number[]) => {
    try {
      await updateRoleWithPermissions(roleId, name, permissionIds)
      return { success: true }
    } catch (error) {
      console.error("Failed to save role", error)
      return { success: false, error: "Failed to update role" }
    }
  }
)

export const CreateRoleAction = CreateServerAction(
  true,
  async (formData: { name: string; roleType?: string }) => {
    try {
      const newRole = await createScopedRole(formData)
      return { success: true, data: newRole }
    } catch (error) {
      return { error: error }
    }
  }
)

export const deleteRoleAction = CreateServerAction(
  true,
  async (roleId: number) => {
    try {
      await deleteRoleById(roleId)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
)

export const getUsersByRoleIDAction = CreateServerAction(
  true,
  async (id: number) => {
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
)
export const getRoleByEntityTypeAndIdAction = CreateServerAction(
  true,
  async (
    entityType: "CHANNEL" | "SPACE" | "PROJECT" | "COMMUNITY",
    id: string
  ) => {
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
)

export const updateUserRoleForEntityAction = CreateServerAction(
  true,
  async (
    userId: string,
    entityId: string,
    entityType: "CHANNEL" | "SPACE" | "PROJECT" | "COMMUNITY",
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
      if (entityType === "COMMUNITY") {
        await updateCommunityUser(entityId, userId, { role: newRoleName })
      } else if (entityType === "CHANNEL") {
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
