"use server"

import { clerkClient } from "@clerk/nextjs/server"
import {
  GetAdminUsers,
  GetAdminUsersFilters,
  SetUserDisabled
} from "@/src/db/data-access/admin/users/query"
import { SelectUserByUniqueId } from "@/src/db/data-access/user/query"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { isSuperAdmin } from "@/src/utils/helpers"

// Only super admins can list, disable and enable users
const getSuperAdmin = async () => {
  const user = await AuthUserAction()
  if (!user || !(await isSuperAdmin(user))) {
    throw new Error("Forbidden", { cause: 403 })
  }
  return user
}

// Users list for the admin Users page (super admins only)
export const GetAdminUsersAction = CreateServerAction(
  true,
  async (filters: GetAdminUsersFilters) => {
    try {
      await getSuperAdmin()

      const { users, pagination } = await GetAdminUsers(filters)

      // last active is not stored in our DB, so it comes from Clerk.
      // Skipped for an empty page: an empty userId list returns every Clerk user.
      const clerk = await clerkClient()
      const { data: clerkUsers } = users.length
        ? await clerk.users.getUserList({
            userId: users.map((u) => u.external_auth_id),
            limit: users.length
          })
        : { data: [] }

      return {
        success: true,
        data: {
          users: users.map((user) => {
            const lastActiveAt = clerkUsers.find(
              (c) => c.id === user.external_auth_id
            )?.lastActiveAt
            return {
              ...user,
              lastActive: lastActiveAt
                ? new Date(lastActiveAt).toISOString()
                : null
            }
          }),
          pagination
        }
      }
    } catch (error: any) {
      console.error("Error in GetAdminUsersAction:", error)
      return { success: false, error: error.message || "Failed to fetch users" }
    }
  }
)

// Disables (bans in Clerk, so they can't sign in) or re-enables a user.
// Posts and profile stay visible. Super admins only.
export const SetUserDisabledAction = CreateServerAction(
  true,
  async (userId: string, disabled: boolean) => {
    try {
      const admin = await getSuperAdmin()
      if (userId === admin.unique_id) {
        throw new Error("You can't disable your own account")
      }

      const user = await SelectUserByUniqueId(userId)
      if (!user) throw new Error("User not found")
      if (disabled && (await isSuperAdmin(user))) {
        throw new Error("A super admin can't be disabled")
      }

      // Clerk first, so the DB is only updated when the ban/unban worked
      const clerk = await clerkClient()
      if (disabled) {
        await clerk.users.banUser(user.external_auth_id)
      } else {
        await clerk.users.unbanUser(user.external_auth_id)
      }

      const updatedUser = await SetUserDisabled(userId, disabled)
      return { success: true, data: updatedUser }
    } catch (error: any) {
      console.error("Error in SetUserDisabledAction:", error)
      return {
        success: false,
        error: error.message || "Failed to update user"
      }
    }
  }
)
