"use client"
import React, { useEffect } from "react"
import { useSetAtom } from "jotai"
import { useAuth, useUser } from "@clerk/nextjs"
import { SelectUser } from "@/src/db/schema"
import { userStore } from "@/src/store/user/userStore"
import { UserResource } from "@clerk/types"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { RawUserPerms, transformRawPermsToSet } from "@/src/utils/clientHelper"
import { useServerAction } from "@/src/hooks/useServerAction"

const ClerkAuthListener = () => {
  const [loading, userData, error, fetchUser] = useServerAction(AuthUserAction)
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const setUser = useSetAtom(userStore.AuthUser)
  const setIam = useSetAtom(userStore.Iam)
  const setPermissions = useSetAtom(userStore.Permissions)
  const setSuperAdmin = useSetAtom(userStore.SuperAdmin)
  const setLoadingUser = useSetAtom(userStore.LoadingUser)

  const handleSetUser = async (user: UserResource | null | undefined) => {
    if (!user) return
    const userRes: Omit<SelectUser, "bio"> | undefined = await fetchUser()
    setLoadingUser(false)

    if (!userRes) return
    const isSuperadmin = userRes?.roles?.[0]?.role?.name === "Super_Admin"
    setUser(userRes as SelectUser)
    setIam(userRes as SelectUser)
    setSuperAdmin(isSuperadmin)

    const rawPerms = user?.publicMetadata?.permissions as RawUserPerms | null
    if (!rawPerms) return
    const transformed = transformRawPermsToSet(rawPerms)
    setPermissions(transformed)
  }

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn && user) {
      handleSetUser(user)
    } else {
      setUser(null)
      setIam(null)
      setPermissions(null)
      setSuperAdmin(false)
      setLoadingUser(false)
    }
  }, [
    isSignedIn,
    user,
    isLoaded,
    setUser,
    setIam,
    setPermissions,
    setSuperAdmin,
    setLoadingUser
  ])

  return <></>
}

export default ClerkAuthListener
