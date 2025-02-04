import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { useAtomValue } from "jotai"
import Link from "next/link"
import { ProfileActivity } from "../ProfileActivity/types/activity.types"
import { userStore } from "@/src/store/user/userStore"
import moment from "moment"

type NotificationItemProps = {
  activity: ProfileActivity
  children?: React.ReactNode
  size?: "sm" | "lg"
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  activity,
  children,
  size = "lg"
}) => {
  const authUser = useAtomValue(userStore.AuthUser)

  const name =
    `${activity.otherUser.first_name} ${activity.otherUser.last_name}`

  const generateNotificationText = (activity: ProfileActivity) => {
    if (activity.is_requested && activity.contact_id === authUser?.unique_id) {
      return "Sent you a connection request"
    } else if (activity.is_requested && activity.user_id === authUser?.unique_id) {
      return `You sent ${name} a connection request`
    } else if (activity.is_following) {
      return "You are following"
    } else if (activity.is_followed_by) {
      return "Is following you"
    } else if (activity.is_accepted) {
      if (activity.contact_id === authUser?.unique_id) {
        return `You accepted ${name}'s connection request`
      } else {
        return `${name} accepted your connection request`
      }
    } else {
      return ""
    }
  }

  return (
    <Link href={size === "sm" ? "/profile-activity" : "#"}>
      <div className="flex items-center justify-between p-4 border-b last:border-b-0 max-[622px]:flex-col max-[622px]:items-start max-[622px]:space-x-0 max-[622px]:space-y-4">
        <div className="flex items-center space-x-4">
          {size === "sm" ? (
            <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-sky-500" />
          ) : null}
          <Avatar className="h-12 w-12">
            <Link
              href={
                size === "sm" ? "#" : `/profile/${activity.otherUser.unique_id}`
              }
            >
              <AvatarImage
                className="rounded-full"
                src={activity.otherUser.profile_url as string}
                alt={name}
              />
              <AvatarFallback>{activity.otherUser.first_name}</AvatarFallback>
            </Link>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Link
              href={
                size === "sm" ? "#" : `/profile/${activity.otherUser.unique_id}`
              }
            >
              {" "}
              <p className="text-sm font-medium truncate">{name}</p>
            </Link>
            <p className="text-xs text-muted-foreground">
              {generateNotificationText(activity)}
            </p>
            {size === "sm" ? null : (
              <p className="text-xs text-muted-foreground">
                {moment.utc(activity.created_at).local().fromNow()}
              </p>
            )}
          </div>
        </div>
        {children}
      </div>
    </Link>
  )
}

export default NotificationItem
