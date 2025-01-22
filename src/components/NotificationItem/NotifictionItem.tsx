import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { ProfileActivity } from "../Dashboard/ProfileActivity/types/activity.types"

type NotificationItemProps = {
  activity: ProfileActivity
  children?: React.ReactNode
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  activity,
  children
}) => {
  const user = useAtomValue(userStore.AuthUser)

  const name = activity.otherUser.first_name + activity.otherUser.last_name

  const generateNotificationText = (activity: ProfileActivity) => {
    if (activity.is_requested && activity.contact_id === user?.unique_id) {
      return "Sent you a connection request"
    } else if (activity.is_requested && activity.user_id === user?.unique_id) {
      return `You sent ${name} a connection request`
    } else if (activity.is_following) {
      return "You are following"
    } else if (activity.is_followed_by) {
      return "Is following you"
    } else if (activity.is_accepted) {
      if (activity.contact_id === user?.unique_id) {
        return `You accepted ${name}'s connection request`
      } else {
        return `${name} accepted your connection request`
      }
    } else {
      return ""
    }
  }

  return (
    <div className="flex items-center space-x-4 p-4 border-b last:border-b-0">
      <Avatar className="h-12 w-12">
        <AvatarImage
          className="rounded-full"
          src={activity.otherUser.profile_url as string}
          alt={name}
        />
        <AvatarFallback>{activity.otherUser.first_name}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-sm text-muted-foreground">
          {generateNotificationText(activity)}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(activity.created_at as string).toLocaleString()}
        </p>
      </div>
      {children}
    </div>
  )
}

export default NotificationItem
