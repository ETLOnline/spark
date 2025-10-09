"use client"

import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { getBeamsClient } from "@/src/services/notifications/BeamClient"
import { useEffect } from "react"
import { beamsAuthAction } from "./BeamAuthAction"

export default function NotificationProvider() {
  useEffect(() => {
    async function init() {
      if (!("Notification" in window)) {
        console.warn("Notifications not supported in this browser.")
        return
      }

      if (Notification.permission === "denied") {
        console.warn(
          "User has blocked notifications. Skipping Beams registration."
        )
        return
      }

      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission()
        if (permission !== "granted") {
          console.warn("User denied or dismissed notification permission.")
          return
        }
      }

      try {
        const user = await AuthUserAction()
        const userId = user?.unique_id
      if (!userId) return

        const beamsClient = getBeamsClient()

        await beamsClient.clearAllState()

        try {
          await beamsClient.start()
        } catch (err) {
          console.error("Beams start failed:", err)
          return
        }

        await beamsClient.setUserId(userId, {
          fetchToken: async () => {
            const token = await beamsAuthAction(userId)
            return token
          }
        })
      } catch (err) {
        console.error("Error initializing notifications:", err)
      }
    }

    init()
  }, [])

  return null
}
