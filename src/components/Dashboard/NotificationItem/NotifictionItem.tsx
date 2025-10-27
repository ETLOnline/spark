import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { useSetAtom } from "jotai"
import Link from "next/link"
import { SelectNotification } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { MarkNotificationAsReadAction } from "@/src/server-actions/Notification/Notification"
import { notificationStore } from "@/src/store/notification/notificationStore"
import { formatRelativeTime } from "@/src/utils/helpers"

type NotificationItemProps = {
  activity: SelectNotification
  children?: React.ReactNode
  size?: "sm" | "lg"
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  activity,
  children,
  size = "lg"
}) => {
  const [, , , markAsRead] = useServerAction(MarkNotificationAsReadAction)
  const setNotifications = useSetAtom(notificationStore.notifications)

  const markNotificationAsRead = () => {
    markAsRead(activity.id)
    setNotifications((notifications) =>
      notifications.map((n) =>
        n.id !== activity.id ? n : { ...n, is_read: 1 }
      )
    )
  }

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0 max-[622px]:flex-col max-[622px]:items-start max-[622px]:space-x-0 max-[622px]:space-y-4">
      <div className="grid grid-cols-[48px,1fr] gap-3 items-start w-full">
        {/* Avatar column (fixed 48px) */}
        <div className="relative h-12 w-12 ">
          <Avatar>
            <AvatarImage
              src={activity.icon || ""}
              alt={activity.title}
              className="h-full w-full rounded-full object-cover"
            />
            <AvatarFallback className="h-full w-full flex items-center justify-center text-sm">
              {activity.title.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {activity.is_read === 0 && (
            <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-sky-500 ring-2 ring-white" />
          )}
        </div>

        {/* Text column (takes rest of the space) */}
        <Link
          href={activity.deep_link || "#"}
          onClick={markNotificationAsRead}
          className="min-w-0"
        >
          <p className="text-sm font-medium truncate">{activity.title}</p>
          {activity.body && (
            <p className="text-xs text-muted-foreground break-words">
              {activity.body}
            </p>
          )}
          {size === "sm" ? null : (
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(activity.created_at)}
            </p>
          )}
        </Link>
      </div>
      {children}
    </div>
  )
}

export default NotificationItem
