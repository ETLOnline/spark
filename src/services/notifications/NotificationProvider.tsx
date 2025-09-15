"use client"

import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { getBeamsClient } from "@/src/services/notifications/BeamClient"
import { useEffect } from "react"

export default function NotificationProvider() {
  useEffect(() => {
    async function init() {
      // Import the full module (not default)

      const user = await AuthUserAction()
      const userId = user?.unique_id
      if (!userId) return

      const beamsClient = getBeamsClient()

      await beamsClient.start()
      console.log("✅ Device registered with Beams")

      await beamsClient.addDeviceInterest("spark")

      await beamsClient.addDeviceInterest(`user-${userId}`)
    }

    init()
  }, [])

  return null
}
