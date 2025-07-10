"use server"

import { CreateServerAction } from ".."
import { db } from "@/src/db"
import { usersTable, userRolesTable, rolesTable } from "@/src/db/schema"
import { eq, and } from "drizzle-orm"

export const SetUserAsMentorAction = CreateServerAction(
  true, // Require auth - only admins should be able to set mentor roles
  async (userId: string) => {
    try {
      // First, check if mentor role exists, if not create it
      let mentorRole = await db.query.rolesTable.findFirst({
        where: eq(rolesTable.name, "mentor")
      })

      if (!mentorRole) {
        const [newRole] = await db.insert(rolesTable).values({
          name: "mentor",
          role_type: "user_role",
          slug: "mentor"
        }).returning()
        mentorRole = newRole
      }

      // Check if user already has mentor role
      const existingUserRole = await db.query.userRolesTable.findFirst({
        where: and(
          eq(userRolesTable.user_id, userId),
          eq(userRolesTable.role_id, mentorRole.id)
        )
      })

      if (existingUserRole) {
        return {
          success: true,
          message: "User already has mentor role"
        }
      }

      // Add mentor role to user
      await db.insert(userRolesTable).values({
        user_id: userId,
        role_id: mentorRole.id
      })

      // Also update the simple role field for backwards compatibility
      await db.update(usersTable)
        .set({ role: "mentor" })
        .where(eq(usersTable.unique_id, userId))

      return {
        success: true,
        message: "User successfully set as mentor"
      }
    } catch (error) {
      console.error("Error setting user as mentor:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to set user as mentor"
      }
    }
  }
)

export const RemoveUserMentorRoleAction = CreateServerAction(
  true, // Require auth - only admins should be able to remove mentor roles
  async (userId: string) => {
    try {
      // Find mentor role
      const mentorRole = await db.query.rolesTable.findFirst({
        where: eq(rolesTable.name, "mentor")
      })

      if (mentorRole) {
        // Remove mentor role from user
        await db.delete(userRolesTable)
          .where(and(
            eq(userRolesTable.user_id, userId),
            eq(userRolesTable.role_id, mentorRole.id)
          ))
      }

      // Update the simple role field back to user
      await db.update(usersTable)
        .set({ role: "user" })
        .where(eq(usersTable.unique_id, userId))

      return {
        success: true,
        message: "Mentor role successfully removed from user"
      }
    } catch (error) {
      console.error("Error removing mentor role:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to remove mentor role"
      }
    }
  }
)

export const GetAllUsersForMentorSetupAction = CreateServerAction(
  true, // Require auth - only admins should see this
  async () => {
    try {
      const users = await db.query.usersTable.findMany({
        with: {
          profile: true,
          roles: {
            with: {
              role: true
            }
          }
        }
      })

      const usersWithMentorStatus = users.map(user => ({
        id: user.unique_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        isMentor: user.role === "mentor" || user.roles?.some(userRole => userRole.role?.name === "mentor"),
        hasProfile: !!user.profile
      }))

      return {
        success: true,
        data: usersWithMentorStatus
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch users"
      }
    }
  }
)
