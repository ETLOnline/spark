"use server"

import { and, eq } from "drizzle-orm"
import { db } from "@/src/db"
import { userRolesTable } from "@/src/db/schema"
import { AuthUserAction } from "../User/AuthUserAction"
import { CreateServerAction } from ".."
import {
  dettachChannelUser,
  GetChannelById,
  getSpaceIdsByChannel,
  bulkDeleteSpaceUsers,
  getProjectIdsBySpaceIds,
  bulkDeleteProjectUsers,
  getProjectRoleIdsByProjectIds,
  bulkDeleteUserRolesByRoleIds,
  getUserRolesWithEntities
} from "@/src/db/data-access/channels/query"
import { deleteUserRole } from "@/src/db/data-access/roles/query"

// Allows the authenticated user to leave a channel (self-remove).
// Also removes the user from all spaces within that channel.
export const LeaveChannelAction = CreateServerAction(
  true,
  async (channelId: string) => {
    try {
      const authUser = await AuthUserAction()

      if (!authUser?.unique_id) {
        return {
          success: false,
          error: "Authentication required to leave channel."
        }
      }

      const userId = authUser.unique_id

      // Step 1: Get all spaces in this channel
      const channel = await GetChannelById(channelId, false)

      if (!channel) {
        return { success: false, error: "Channel not found." }
      }

      // Step 2: Remove the user from all spaces in this channel and any projects inside those spaces
      try {
        const spaceIds = await getSpaceIdsByChannel(channelId)

        // Bulk delete space users
        await bulkDeleteSpaceUsers(spaceIds, userId)

        // Remove user from projects inside these spaces (bulk)
        const projectIds = await getProjectIdsBySpaceIds(spaceIds)
        await bulkDeleteProjectUsers(projectIds, userId)

        // Delete any project-scoped userRoles for these projects
        const projectRoleIds = await getProjectRoleIdsByProjectIds(projectIds)
        await bulkDeleteUserRolesByRoleIds(projectRoleIds, userId)
      } catch (err) {
        console.error(
          `Error removing user ${userId} from spaces/projects in channel ${channelId}:`,
          err
        )
        // Continue even if some removals fail
      }

      // Step 3: Remove from channel
      const deleted = await dettachChannelUser(channelId, userId)

      // Step 4: Get user's role in this channel to delete
      const userRoles = await getUserRolesWithEntities(userId)

      // Delete role associations
      for (const userRole of userRoles) {
        // Only process roles that belong to this channel
        if (
          userRole.role &&
          userRole.role.entity_type === "CHANNEL" &&
          userRole.role.entity_id === channelId
        ) {
          await deleteUserRole(userId, userRole.role_id)
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error("Error in LeaveChannelAction:", error)
      return { success: false, error: error.message || error }
    }
  }
)
