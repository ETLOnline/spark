"use server"

import { and, eq } from "drizzle-orm"
import { db } from "@/src/db"
import {
  ChannelUsersTable,
  SpaceUsersTable,
  spacesTable,
  userRolesTable,
  rolesTable
} from "@/src/db/schema"
import { AuthUserAction } from "../User/AuthUserAction"
import { CreateServerAction } from ".."
import { dettachChannelUser } from "@/src/db/data-access/channels/query"
import { deleteUserRole } from "@/src/db/data-access/roles/query"
import { GetChannelById } from "@/src/db/data-access/channels/query"

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

      // Step 2: Remove the user from all spaces in this channel
      try {
        const spaces = await db.query.spacesTable.findMany({
          where: eq(spacesTable.channel_id, channelId)
        })

        for (const space of spaces) {
          await db
            .delete(SpaceUsersTable)
            .where(
              and(
                eq(SpaceUsersTable.space_id, space.id),
                eq(SpaceUsersTable.user_id, userId)
              )
            )
        }
      } catch (err) {
        console.error(
          `Error removing user ${userId} from spaces in channel ${channelId}:`,
          err
        )
        // Continue even if some space removals fail
      }

      // Step 3: Remove from channel
      const deleted = await dettachChannelUser(channelId, userId)

      // Step 4: Get user's role in this channel to delete
      const userRoles = await db.query.userRolesTable.findMany({
        where: eq(userRolesTable.user_id, userId),
        with: {
          role: true
        }
      })

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
