import { UserRoundMinus } from "lucide-react"
import { Button } from "../../ui/button"
import { ProfileActivity } from "./types/activity.types.d"
import NotificationItem from "../../NotificationItem/NotifictionItem"

type FollowProps = {
  activity: ProfileActivity
}

const Follow: React.FC<FollowProps> = ({ activity }) => {
  return (
    <NotificationItem activity={activity} key={activity.id}>
      <Button size="sm" variant="outline" key={activity.id}>
        <UserRoundMinus className="h-4 w-4 mr-2" />
        Unfollow
      </Button>
    </NotificationItem>
  )
}

export default Follow
