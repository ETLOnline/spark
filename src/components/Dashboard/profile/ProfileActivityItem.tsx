import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import Link from "next/link"
import { ProfileActivity } from "../Connections/types/connections.types"
import { userStore } from "@/src/store/user/userStore"
import { useAtomValue } from "jotai"
import { formatRelativeTime } from "@/src/utils/helpers"

type ProfileActivityItemProps = {
  activity: ProfileActivity
  children?: React.ReactNode
  size?: "sm" | "lg"
}

const ProfileActivityItem: React.FC<ProfileActivityItemProps> = ({
  activity,
  children,
  size = "lg"
}) => {
  const user = useAtomValue(userStore.AuthUser)

  const otherUser = activity.otherUser
  const name = `${otherUser.first_name} ${otherUser.last_name}`

  const generateProfileActivityText = (activity: ProfileActivity) => {
    if (activity.is_requested && activity.contact_id === user?.unique_id) {
      return "Sent you a connection request"
    } else if (activity.is_requested && activity.user_id === user?.unique_id) {
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
  }

  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 max-[622px]:flex-col max-[622px]:items-start max-[622px]:space-x-0 max-[622px]:space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <Link href={size === "sm" ? "#" : `/profile/${otherUser.unique_id}`}>
            <AvatarImage
              className="h-[100%] w-[100%] object-cover rounded-full"
              src={otherUser.profile_url as string}
              alt={name}
            />
            <AvatarFallback>{otherUser.first_name}</AvatarFallback>
          </Link>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
          <p className="text-xs text-muted-foreground">
            {generateProfileActivityText(activity)}
          </p>
          {size === "sm" ? null : (
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(activity.created_at)}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

export default ProfileActivityItem
