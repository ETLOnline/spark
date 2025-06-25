"use client"
import { EventsScreen } from "@/src/components/Dashboard/Event"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { eventStore } from "@/src/store/event/eventStore"
import { useAtom } from "jotai"
import React, { useEffect } from "react"

const EventPage = () => {
  const [permissionChecker, setPermissionChecker] = useAtom(
    eventStore.permissionCheckerAtom
  )
  const { permissionChecker: checker } = usePermissionChecker("global")

  useEffect(() => {
    if (checker) {
      setPermissionChecker(checker)
    }
  }, [checker, setPermissionChecker])
  return <EventsScreen />
}

export default EventPage
