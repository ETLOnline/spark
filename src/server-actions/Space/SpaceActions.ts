"use server"

import { and, eq } from "drizzle-orm"
import { db } from "@/src/db"
import { SpaceUsersTable, userRolesTable, rolesTable } from "@/src/db/schema"
import { AuthUserAction } from "../User/AuthUserAction"
import { CreateServerAction } from ".."
import { dettachSpaceUser } from "@/src/db/data-access/spaces/query"
import { deleteUserRole } from "@/src/db/data-access/roles/query"

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

      // Step 1: Remove user from the space
      await dettachSpaceUser(spaceId, userId)

      // Step 2: Get user's role in this space to delete
      const userRoles = await db.query.userRolesTable.findMany({
        where: eq(userRolesTable.user_id, userId),
        with: {
          role: true
        }
      })

      // Delete role associations
      for (const userRole of userRoles) {
        // Only process roles that belong to this space
        if (
          userRole.role &&
          userRole.role.entity_type === "SPACE" &&
          userRole.role.entity_id === spaceId
        ) {
          await deleteUserRole(userId, userRole.role_id)
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Error in LeaveSpaceAction:", error)
      return { success: false, error: error.message || error }
    }
  }
)
