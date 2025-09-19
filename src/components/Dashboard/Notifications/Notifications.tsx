"use client"
import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { Button } from "../../ui/button"
import NotificationItem from "../NotificationItem/NotifictionItem"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetNotificationsAction,
  MarkNotificationAsReadAction
} from "@/src/server-actions/Notification/Notification"
import { SelectNotification } from "@/src/db/schema"
import { useAtom, useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { notificationStore } from "@/src/store/notification/notificationStore"
import pusherClient from "@/src/services/realtime/PusherClient"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import Link from "next/link"
import { playNotificationSound } from "@/src/services/system-notification/playNotificationSound"

const Notifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const userId = useAtomValue(userStore.AuthUser)?.unique_id
  const [notifications, setNotifications] = useAtom(
    notificationStore.notifications
  )

  const hasUnread = notifications?.some((n) => n.is_read === 0)

  const [
    notificationsLoading,
    notificationsData,
    notificationsError,
    getNotifications
  ] = useServerAction(GetNotificationsAction)

  useEffect(() => {
    ;(async () => {
      try {
        const notificationsData = (await getNotifications())?.data
        if (notificationsData) {
          setNotifications(notificationsData)
        }
      } catch (error) {
        console.error(error)
      }
    })()
  }, [])

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications
      .filter((n) => n.is_read === 0)
      .map((n) => n.id)

    if (unreadIds.length === 0) return

    try {
      await MarkNotificationAsReadAction(unreadIds)

      setNotifications((notifications) =>
        notifications.map((n) => (n.is_read === 0 ? { ...n, is_read: 1 } : n))
      )
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  useEffect(() => {
    if (!userId) return
    const channel = pusherClient.subscribe(`user-${userId}`)

    channel.bind("system-notifications", (data: SelectNotification) => {
      playNotificationSound()
      setNotifications((prev) => [data, ...prev])
    })

    // Resync on reconnect
    pusherClient.connection.bind("connected", async () => {
      try {
        const fresh = (await getNotifications())?.data
        if (fresh) setNotifications(fresh)
      } catch (err) {
        console.error("Failed to resync notifications:", err)
      }
    })

    return () => {
      pusherClient.unsubscribe(`user-${userId}`)
    }
  }, [userId])
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={5}>
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-sky-600"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-auto">
            {notifications &&
              notifications.map((notification, index) => (
                <NotificationItem
                  key={index}
                  activity={notification}
                  size="sm"
                />
              ))}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

export default Notifications
