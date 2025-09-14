"use client"

import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { useEffect } from "react"

export default function NotificationProvider() {
  useEffect(() => {
    async function init() {
      // Import the full module (not default)

      const user = await AuthUserAction()
      const userId = user?.unique_id
      if (!userId) return

      const PusherPushNotifications = await import(
        "@pusher/push-notifications-web"
      )

      const beamsClient = new PusherPushNotifications.Client({
        instanceId: process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID as string
      })

      await beamsClient.start()

      await beamsClient.addDeviceInterest("spark")

      await beamsClient.addDeviceInterest(`user-${userId}`)
    }

    init()
  }, [])

  return null
}
