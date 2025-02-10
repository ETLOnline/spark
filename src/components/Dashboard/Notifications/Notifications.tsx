import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { Button } from "../../ui/button"
import NotificationItem from "../NotificationItem/NotifictionItem"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetNotificationsAction } from "@/src/server-actions/Notification/Notification"
import { AblyClient } from "@/src/services/realtime/AblyClient"
import { InsertNotification, SelectNotification } from "@/src/db/schema"
import { useAtom, useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { notificationStore } from "@/src/store/notification/notificationStore"

const Notifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const userId = useAtomValue(userStore.AuthUser)?.unique_id
  const [notifications, setNotifications] = useAtom(
    notificationStore.notifications
  )

  const [
    notificationsLoading,
    notificationsData,
    notificationsError,
    getNotifications
  ] = useServerAction(GetNotificationsAction)

  useEffect(() => {
    ;(async () => {
      const notificationsData = (await getNotifications())?.data
      if (notificationsData) {
        setNotifications(notificationsData)
      }
    })()
  }, [])

  useEffect(() => {
    if (userId) {
      const { unsubscribe } = joinNotificationChannel(
        userId,
        (request) => {
          setNotifications((prev) => [
            ...prev,
            {
              ...request
            } as SelectNotification
          ])
        },
        ["notification"]
      )
      return () => {
        unsubscribe()
      }
    }
  }, [userId])

  const joinNotificationChannel = (
    channelId: string,
    onRequestReceived: (
      notifcation: InsertNotification,
      activity: string
    ) => void,
    channelEvents: string[]
  ) => {
    const channel = AblyClient.channels.get(channelId)
    // Subscribe to incoming notifications
    channel.subscribe(channelEvents, (message) => {
      onRequestReceived(message.data, message.name as string)
    })
    // Return functions to send messages and cleanup
    return {
      unsubscribe: () => {
        channel.unsubscribe()
      }
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={5}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-auto">
            {notifications &&
              notifications &&
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
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
