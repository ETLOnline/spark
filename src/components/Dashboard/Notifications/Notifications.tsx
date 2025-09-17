import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { Button } from "../../ui/button"
import NotificationItem from "../NotificationItem/NotifictionItem"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetNotificationsAction } from "@/src/server-actions/Notification/Notification"
import { SelectNotification } from "@/src/db/schema"
import { useAtom, useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { notificationStore } from "@/src/store/notification/notificationStore"
import pusherClient from "@/src/services/realtime/PusherClient"
import { ScrollArea } from "@/src/components/ui/scroll-area"

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

  useEffect(() => {
    if (!userId) return

    const channel = pusherClient.subscribe(`user-system-notification-${userId}`)

    channel.bind("system-notifications", (data: SelectNotification) => {
      setNotifications((prev) => [data, ...prev])
    })

    return () => {
      pusherClient.unsubscribe(`user-system-notification-${userId}`)
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
          <CardHeader className="pb-3">
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-auto">
            {notifications &&
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id + notification.created_by}
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
