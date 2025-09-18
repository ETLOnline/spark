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
import {
  dettachSpaceUser,
  leaveSpaceUser
} from "@/src/db/data-access/spaces/query"
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

      await leaveSpaceUser(spaceId, userId)

      return { success: true }
    } catch (error: any) {
      console.error("Error in LeaveSpaceAction:", error)
      return { success: false, error: error.message || error }
    }
  }
)
