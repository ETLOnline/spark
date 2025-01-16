import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { ProfileActivity } from "@/src/app/(dashboard)/profile-activity/page"

type NotificationItemProps = {
  activity: ProfileActivity
  children?: React.ReactNode
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  activity,
  children
}) => {
  return (
    <div className="flex items-center space-x-4 p-4 border-b last:border-b-0">
      <Avatar className="h-12 w-12">
        <AvatarImage src={activity.avatar} alt={activity.name} />
        <AvatarFallback>{activity.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{activity.name}</p>
        <p className="text-sm text-muted-foreground">
          {activity.action === "request" && "Sent you a connection request"}
          {activity.action === "visit" && "Viewed your profile"}
          {activity.action === "sent" && "You sent a connection request"}
          {activity.action === "following" && "You are following"}
          {activity.action === "follower" && "Is following you"}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
      {children}
    </div>
  )
}

export default NotificationItem
