"use client"

import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { getBeamsClient } from "@/src/services/notifications/BeamClient"
import { useEffect, useState } from "react"
import { beamsAuthAction } from "./BeamAuthAction"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import NotificationTourOverlay from "./NotificationTourOverlay"

export default function NotificationProvider() {
  const [shouldRequestPermission, setShouldRequestPermission] = useState(false)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)

  const enableNotifications = async () => {
    const user = await AuthUserAction()
    const userId = user?.unique_id
    if (!userId) return

    const beamsClient = getBeamsClient()

    await beamsClient.clearAllState()

    await beamsClient.start()

    await beamsClient.setUserId(userId, {
      fetchToken: async () => {
        const token = await beamsAuthAction(userId)
        return token
      }
    })
  }

  const checkNotificationPermissions = async () => {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported in this browser.")
      return
    }

    if (Notification.permission === "denied") {
      setShouldRequestPermission(false)
      setIsOverlayOpen(false)
      console.warn(
        "User has blocked notifications. Skipping Beams registration."
      )
      return
    }

    if (Notification.permission === "granted") {
      setShouldRequestPermission(false)
      setIsOverlayOpen(false)
      await enableNotifications()
    } else {
      setShouldRequestPermission(true)
    }
  }

  const requestPermission = async () => {
    setShouldRequestPermission(false)
    setIsOverlayOpen(true)
    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      console.warn("User denied or dismissed notification permission.")
      return
    }
  }

  useEffect(() => {
    checkNotificationPermissions()
  }, [])

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "notifications" })
        .then((permissionStatus) => {
          console.log("Initial permission:", permissionStatus.state)

          permissionStatus.onchange = () => {
            console.log(
              "Notification permission changed to",
              permissionStatus.state
            )
            checkNotificationPermissions()
          }
        })
    }
  }, [])

  return (
    <>
      <Dialog
        open={shouldRequestPermission}
        onOpenChange={setShouldRequestPermission}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Notifications</DialogTitle>
            <DialogDescription>
              We need your permission to send you notifications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={requestPermission} variant="outline">
              Cancel
            </Button>
            <Button onClick={requestPermission}>Allow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <NotificationTourOverlay
        isOpen={isOverlayOpen}
        setIsOpen={setIsOverlayOpen}
      />
    </>
  )
}
