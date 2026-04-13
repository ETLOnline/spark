"use client"
import { useEffect, useCallback } from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useAuth, useUser } from "@clerk/nextjs"
import pusherClient from "../services/realtime/PusherClient"
import { userStore } from "@/src/store/user/userStore"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import type { Channel } from "pusher-js"
import useAuthUserRefresh from "./useAuthUserRefresh"

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
  const authUser = useAtomValue(userStore.AuthUser)
  const setIam = useSetAtom(userStore.Iam)
  const setPermissions = useSetAtom(userStore.Permissions)
  const setSuperAdmin = useSetAtom(userStore.SuperAdmin)
  const setLoadingUser = useSetAtom(userStore.LoadingUser)
  const [isReloadingPermissions, setIsReloadingPermissions] = useAtom(
    userStore.IsReloadingPermissions
  )

  const { fetchAndSetUserData } = useAuthUserRefresh()

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

  const handleRoleUpdate = (data: any) => {
    fetchAndSetUserData(clerkUser)
  }

  // Pusher effect to listen for role updates
  useEffect(() => {
    if (!authUser?.unique_id) return

    let channel: Channel | null = null

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

        // channel.unbind("update-role", handleRoleUpdate)
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
  }, [authUser?.unique_id])

  return {
    isReloadingPermissions
  }
}
