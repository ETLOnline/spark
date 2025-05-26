import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { useAtomValue, useSetAtom } from "jotai"
import Link from "next/link"
import { ProfileActivity } from "../Connections/types/connections.types"
import { userStore } from "@/src/store/user/userStore"
import { SelectNotification } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { MarkNotificationAsReadAction } from "@/src/server-actions/Notification/Notification"
import { notificationStore } from "@/src/store/notification/notificationStore"
import moment from "moment"
import { NotificationType } from "../Notifications/types/notifications.types"

type NotificationItemProps = {
  activity: SelectNotification | ProfileActivity
  children?: React.ReactNode
  size?: "sm" | "lg"
}

const isProfileActivity = (
  activity: SelectNotification | ProfileActivity
): activity is ProfileActivity => {
  return "otherUser" in activity
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  activity,
  children,
  size = "lg"
}) => {
  const [markaAsReadLoading, markaAsRead, markaAsReadError, markAsRead] =
    useServerAction(MarkNotificationAsReadAction)

  const user = useAtomValue(userStore.AuthUser)
  const setNotifications = useSetAtom(notificationStore.notifications)

  const otherUser = isProfileActivity(activity)
    ? activity.otherUser
    : activity.creator

  const name = otherUser.first_name + " " + otherUser.last_name

  const generateNotificationText = (
    activity: SelectNotification | ProfileActivity
  ) => {
    if (isProfileActivity(activity)) {
      if (activity.is_requested && activity.contact_id === user?.unique_id) {
        return "Sent you a connection request"
      } else if (
        activity.is_requested &&
        activity.user_id === user?.unique_id
      ) {
        return `You sent ${name} a connection request`
      } else if (activity.is_following) {
        return "You are following"
      } else if (activity.is_followed_by) {
        return "Started following you"
      } else if (activity.is_accepted) {
        if (activity.contact_id === user?.unique_id) {
          return `You accepted ${name}'s connection request`
        } else {
          return `${name} accepted your connection request`
        }
      }
    } else {
      if (activity.type === NotificationType.requestSent) {
        return "Sent you a connection request"
      } else if (activity.type === NotificationType.incomingRequestAcceptance) {
        return `You accepted ${name}'s connection request`
      } else if (activity.type === NotificationType.outgoingRequestAcceptance) {
        return `${name} accepted your connection request`
      } else if (activity.type === NotificationType.follow) {
        return `You started following ${name}`
      } else if (activity.type === NotificationType.follower) {
        return `${name} started following you`
      } else if (activity.type === NotificationType.event) {
        return "You created an event"
      } else if (activity.type === NotificationType.visit) {
        return `${name} visited your profile`
      } else if (activity.type === NotificationType.like) {
        return `${name} liked your post`
      } else if (activity.type === NotificationType.comment) {
        return `${name} commented on your post`
      } else if (activity.type === NotificationType.share) {
        return `${name} shared your post`
      }
    }
  }

  const markNotificationAsRead = () => {
    if (!isProfileActivity(activity)) {
      markAsRead(activity.id)
      setNotifications((notifications) => [
        ...notifications.map((notification) =>
          notification.id !== activity.id
            ? notification
            : { ...notification, is_read: 1 }
        )
      ])
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 max-[622px]:flex-col max-[622px]:items-start max-[622px]:space-x-0 max-[622px]:space-y-4">
      <div className="flex items-center space-x-4">
        {size === "sm" && !isProfileActivity(activity) && (
          <span
            className={`flex h-2 w-2 translate-y-1.5 rounded-full ${
              activity.is_read === 0 ? "bg-sky-500" : "bg-transparent"
            }`}
          />
        )}
        <Avatar className="h-12 w-12">
          <Link href={size === "sm" ? "#" : `/profile/${otherUser.unique_id}`}>
            <AvatarImage
              className="rounded-full"
              src={otherUser.profile_url as string}
              alt={name}
            />
            <AvatarFallback>{otherUser.first_name}</AvatarFallback>
          </Link>
        </Avatar>
        <Link
          href={size === "sm" ? "/connections" : "#"}
          onClick={markNotificationAsRead}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>

            <p className="text-xs text-muted-foreground">
              {generateNotificationText(activity)}
            </p>
            {size === "sm" ? null : (
              <p className="text-xs text-muted-foreground">
                {moment.utc(activity.created_at).local().fromNow()}
              </p>
            )}
          </div>
        </Link>
      </div>
      {children}
    </div>
  )
}

export default NotificationItem
