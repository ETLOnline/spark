"use client"

import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { getBeamsClient } from "@/src/services/notifications/BeamClient"
import { useEffect } from "react"
import { beamsAuthAction } from "./BeamAuthAction"

export default function NotificationProvider() {
  useEffect(() => {
    async function init() {
      const user = await AuthUserAction()
      const userId = user?.unique_id
      if (!userId) return

      const beamsClient = getBeamsClient()

      await beamsClient.clearAllState()
      console.log("✅ Beams state cleared")

      await beamsClient.start()
      console.log("✅ Beams started")

      await beamsClient.setUserId(userId, {
        fetchToken: async () => {
          const token = await beamsAuthAction(userId)
          return token
        }
      })
      console.log("✅ User registered with Beams")
    }

    init()
  }, [])

  return null
}
