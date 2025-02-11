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
import { joinNotificationChannel } from "@/src/utils/helpers"

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
    if (userId) {
      const { unsubscribe } = joinNotificationChannel(
        userId,
        (request) => {
          console.log("notification", request)
          setNotifications((prev) => [
            {
              ...request
            } as SelectNotification,
            ...prev
          ])
        },
        ["notification"]
      )
      console.log("unsub", unsubscribe, userId)

      return () => {
        unsubscribe()
      }
    }
  }, [userId])

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
