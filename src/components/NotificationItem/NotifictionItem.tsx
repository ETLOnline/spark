import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import {
  ActivityType,
  ProfileActivity
} from "../Dashboard/Activity/types/activity.types.d"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"

type NotificationItemProps = {
  activity: ProfileActivity
  children?: React.ReactNode
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  activity,
  children
}) => {
  const user = useAtomValue(userStore.Iam)
  return (
    <div className="flex items-center space-x-4 p-4 border-b last:border-b-0">
      <Avatar className="h-12 w-12">
        <AvatarImage
          className="rounded-full"
          src={activity.avatar}
          alt={activity.name}
        />
        <AvatarFallback>{activity.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{activity.name}</p>
        <p className="text-sm text-muted-foreground">
          {activity.type === ActivityType.Connect_Received &&
            "Sent you a connection request"}
          {activity.type === ActivityType.Visited && "Viewed your profile"}
          {activity.type === ActivityType.Connect_Sent &&
            "You sent a connection request"}
          {activity.type === ActivityType.Following && "You are following"}
          {activity.type === ActivityType.Followed && "Is following you"}
          {activity.type === ActivityType.Connect_Accepted &&
            (activity.contact_id === user?.unique_id
              ? `You accepted ${activity.name}'s connection request`
              : `${activity.name} accepted your connection request`)}
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
