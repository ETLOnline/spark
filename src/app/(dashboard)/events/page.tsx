"use client"
import { EventsScreen } from "@/src/components/Dashboard/Event"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { eventStore } from "@/src/store/event/eventStore"
import { userStore } from "@/src/store/user/userStore"
import { useAtom, useAtomValue } from "jotai"
import React, { useEffect } from "react"

const EventPage = () => {
  const permission = useAtomValue(userStore.Permissions)
  const isSuperAdmin = useAtomValue(userStore.SuperAdmin)

  const [permissionChecker, setPermissionChecker] = useAtom(
    eventStore.permissionCheckerAtom
  )

  // Initialize PermissionChecker if not already set
  useEffect(() => {
    if (
      (permission && !permissionChecker) ||
      (isSuperAdmin && !permissionChecker)
    ) {
      const checker = new PermissionChecker("global", permission, isSuperAdmin)
      setPermissionChecker(checker)
    }
  }, [permission, permissionChecker, setPermissionChecker, isSuperAdmin])

  return <EventsScreen />
}

export default EventPage
