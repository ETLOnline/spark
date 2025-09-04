"use server"

import { and, eq, inArray } from "drizzle-orm"
import { db } from "@/src/db"
import {
  SpaceUsersTable,
  userRolesTable,
  rolesTable,
  projectTable,
  ProjectUsersTable
} from "@/src/db/schema"
import { AuthUserAction } from "../User/AuthUserAction"
import { CreateServerAction } from ".."
import { dettachSpaceUser } from "@/src/db/data-access/spaces/query"
import { deleteUserRole } from "@/src/db/data-access/roles/query"
import {
  getProjects,
  removeProjectUser
} from "@/src/db/data-access/project-management/query"

// Allows the authenticated user to leave a space (self-remove).
export const LeaveSpaceAction = CreateServerAction(
  true,
  async (spaceId: string) => {
    try {
      const authUser = await AuthUserAction()

      if (!authUser?.unique_id) {
        return {
          success: false,
          error: "Authentication required to leave space."
        }
      }

      const userId = authUser.unique_id

      // Use a transaction to perform bulk deletes for consistency and performance
      await db.transaction(async (trx) => {
        // Fetch minimal project IDs for this space
        const projects = await trx
          .select({ id: projectTable.id })
          .from(projectTable)
          .where(eq(projectTable.space_id, spaceId))

        const projectIds = projects.map((p: any) => p.id)

        // 1) Bulk delete project users for all projects in this space
        if (projectIds.length > 0) {
          await trx
            .delete(ProjectUsersTable)
            .where(
              and(
                inArray(ProjectUsersTable.project_id, projectIds),
                eq(ProjectUsersTable.user_id, userId)
              )
            )
        }

        // 2) Delete any userRoles that reference project-scoped roles within these projects
        if (projectIds.length > 0) {
          // Find role IDs that are scoped to these projects
          const projectRoles = await trx
            .select({ id: rolesTable.id })
            .from(rolesTable)
            .where(
              and(
                eq(rolesTable.entity_type, "PROJECT"),
                inArray(rolesTable.entity_id, projectIds)
              )
            )

          const projectRoleIds = projectRoles.map((r: any) => r.id)

          if (projectRoleIds.length > 0) {
            await trx
              .delete(userRolesTable)
              .where(
                and(
                  inArray(userRolesTable.role_id, projectRoleIds),
                  eq(userRolesTable.user_id, userId)
                )
              )
          }
        }

        // 3) Detach the user from the space
        await dettachSpaceUser(spaceId, userId)

        // 4) Delete any SPACE-scoped user roles for this user and space
        const spaceRoleIds = await trx
          .select({ id: rolesTable.id })
          .from(rolesTable)
          .where(
            and(
              eq(rolesTable.entity_type, "SPACE"),
              eq(rolesTable.entity_id, spaceId)
            )
          )

        if (spaceRoleIds.length > 0) {
          const sids = spaceRoleIds.map((r: any) => r.id)
          await trx
            .delete(userRolesTable)
            .where(
              and(
                inArray(userRolesTable.role_id, sids),
                eq(userRolesTable.user_id, userId)
              )
            )
        }
      })

      return { success: true }
    } catch (error: any) {
      console.error("Error in LeaveSpaceAction:", error)
      return { success: false, error: error.message || error }
    }
  }
)
