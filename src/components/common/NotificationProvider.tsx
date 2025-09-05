"use client"

import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { generateBeamsToken } from "@/src/services/notifications/BeamServer"
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
        instanceId: "2d067e20-10dc-428d-ac16-ae64858304f4"
      })

      await beamsClient.start()
      // .then(() => beamsClient.addDeviceInterest("hello"))
      // .then(() => console.log("Successfully registered and subscribed!"))
      // .catch(console.error);

      await beamsClient.addDeviceInterest("spark")

      await beamsClient.addDeviceInterest(`user-${userId}`)
    }

    init()
  }, [])

  return null
}
