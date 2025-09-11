"use client"
import { useEffect, useCallback } from "react"
import { useAtom, useSetAtom } from "jotai"
import { useAuth, useUser } from "@clerk/nextjs"
import pusherClient from "../services/realtime/PusherClient"

import { userStore } from "@/src/store/user/userStore"

import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { getUserPermissionRowsAction } from "@/src/server-actions/UserRoles/UserRole"
import { buildUserPerms } from "@/src/utils/clientHelper"
import { SelectUser } from "@/src/db/schema"
import type { Channel } from "pusher-js"

/**
 * Custom hook to manage user authentication state, fetch user data from the database,
 * handle permissions using Jotai, and listen for real-time role updates via Pusher.
 * It replaces the need for a dedicated ClerkAuthListener component.
 */
export const useAuthUser = () => {
  const { isSignedIn, isLoaded } = useAuth()
  const { user: clerkUser } = useUser()

  // Jotai setters for our user store atoms
  const setUser = useSetAtom(userStore.AuthUser)
  const setIam = useSetAtom(userStore.Iam)
  const setPermissions = useSetAtom(userStore.Permissions)
  const setSuperAdmin = useSetAtom(userStore.SuperAdmin)
  const setLoadingUser = useSetAtom(userStore.LoadingUser)
  const [isReloadingPermissions, setIsReloadingPermissions] = useAtom(
    userStore.IsReloadingPermissions
  )

  const fetchAndSetUserData = useCallback(
    async (userResource: typeof clerkUser) => {
      if (!userResource) {
        setUser(null)
        setIam(null)
        setPermissions(null)
        setSuperAdmin(false)
        setLoadingUser(false)
        setIsReloadingPermissions(false)
        return
      }

      setLoadingUser(true)
      setIsReloadingPermissions(true)

      try {
        const userRes: Omit<SelectUser, "bio"> | undefined =
          await AuthUserAction()

        if (!userRes) {
          console.warn(
            "User not found in DB after Clerk auth. Consider creating the user or handling this case."
          )
          // If user not in your DB, clear state and return
          setUser(null)
          setIam(null)
          setPermissions(null)
          setSuperAdmin(false)
          return // Early exit
        }

        // 2. Fetch permissions based on the unique ID from your fetched user
        const rawPerms = await getUserPermissionRowsAction(userRes.unique_id)

        // Determine if the user is a super admin
        const isSuperadmin = userRes?.roles?.[0]?.role?.name === "Super_Admin"

        // 3. Update Jotai atoms with the fetched user data
        setUser(userRes as SelectUser) // Cast if AuthUserAction returns slightly different type
        setIam(userRes as SelectUser)
        setSuperAdmin(isSuperadmin)

        // 4. Transform and set permissions
        if (rawPerms?.data) {
          const transformed = buildUserPerms(rawPerms.data)
          setPermissions(transformed)
        } else {
          setPermissions(null) // Ensure permissions are cleared if none found
        }
      } catch (error) {
        console.error("Failed to fetch and set user data:", error)
        // On error, clear user state to ensure no stale data is kept
        setUser(null)
        setIam(null)
        setPermissions(null)
        setSuperAdmin(false)
      } finally {
        // Always reset loading states when the operation completes
        setLoadingUser(false)
        setIsReloadingPermissions(false)
      }
    },
    [
      setUser,
      setIam,
      setPermissions,
      setSuperAdmin,
      setLoadingUser,
      setIsReloadingPermissions
    ]
  )

  // Effect hook to run when Clerk's authentication state changes.
  // This handles the initial load and sign-in/sign-out events.
  useEffect(() => {
    // Wait until Clerk.js is fully loaded
    if (!isLoaded) return

    if (isSignedIn && clerkUser) {
      // If signed in and Clerk user object is available, fetch and set our app's user data
      fetchAndSetUserData(clerkUser)
    } else {
      // If signed out or no Clerk user, clear all user-related state in Jotai
      setUser(null)
      setIam(null)
      setPermissions(null)
      setSuperAdmin(false)
      setLoadingUser(false)
      setIsReloadingPermissions(false) // Reset this too on sign out
    }
  }, [
    isSignedIn,
    clerkUser,
    isLoaded,
    fetchAndSetUserData,
    setUser,
    setIam,
    setPermissions,
    setSuperAdmin,
    setLoadingUser,
    setIsReloadingPermissions
  ])

  // Pusher effect to listen for role updates
  useEffect(() => {
    if (!isSignedIn || !clerkUser) return

    let channel: Channel | null = null

    const handleRoleUpdate = (data: any) => {
      console.log("Role update received:", data)
      fetchAndSetUserData(clerkUser)
    }

    const fetchUserAndSetupPusher = async () => {
      try {
        const userRes = await AuthUserAction()
        if (!userRes?.unique_id) {
          console.warn(
            "No unique_id found for user, cannot setup Pusher subscription"
          )
          return
        }

        const channelName = `user-${userRes.unique_id}`

        channel = pusherClient.channel(channelName) as Channel | null
        if (!channel) {
          channel = pusherClient.subscribe(channelName)
        }

        channel.unbind("update-role", handleRoleUpdate)
        channel.bind("update-role", handleRoleUpdate)
      } catch (error) {
        console.error("Failed to setup Pusher subscription:", error)
      }
    }

    fetchUserAndSetupPusher()

    return () => {
      if (channel) {
        channel.unbind("update-role", handleRoleUpdate)
        pusherClient.unsubscribe(channel.name)
      }
    }
  }, [isSignedIn, clerkUser, fetchAndSetUserData, AuthUserAction])

  const refreshAuthUser = useCallback(async () => {
    if (isSignedIn && clerkUser) {
      // Re-run the data fetching logic
      await fetchAndSetUserData(clerkUser)
    } else {
      console.warn("Cannot refresh user data: User is not signed in.")
      // Optionally, handle refresh attempt when not signed in (e.g., clear state)
      setUser(null)
      setIam(null)
      setPermissions(null)
      setSuperAdmin(false)
      setLoadingUser(false)
      setIsReloadingPermissions(false)
    }
  }, [
    isSignedIn,
    clerkUser,
    fetchAndSetUserData,
    setUser,
    setIam,
    setPermissions,
    setSuperAdmin,
    setLoadingUser,
    setIsReloadingPermissions
  ])

  return {
    refreshAuthUser,
    isReloadingPermissions
  }
}
