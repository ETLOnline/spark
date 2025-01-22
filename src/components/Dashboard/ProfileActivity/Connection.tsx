import { DeleteConnectionAction } from "@/src/server-actions/Contact/Contact"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useSetAtom } from "jotai"
import { activityStore } from "@/src/store/activity/activityStore"
import { useToast } from "@/src/hooks/use-toast"
import NotificationItem from "../../NotificationItem/NotifictionItem"
import { Button } from "../../ui/button"
import { UserRoundX } from "lucide-react"
import { ProfileActivity } from "./types/activity.types"

type ConnectionProps = {
  activity: ProfileActivity
}

const Connection: React.FC<ConnectionProps> = ({ activity }) => {
  const setProfileActivities = useSetAtom(activityStore.profileActivities)

  const [disconnectLoading, disconnectData, disconnectError, disconnect] =
    useServerAction(DeleteConnectionAction)

  const { toast } = useToast()

  const handleDeleteRequest = async (user_id: string, contact_id: string) => {
    const response = await disconnect(user_id, contact_id)
    if (response?.success) {
      setProfileActivities((profileActivities) =>
        profileActivities.filter(
          (activity) =>
            activity.user_id !== user_id &&
            activity.contact_id !== contact_id &&
            activity.is_accepted
        )
      )
      toast({
        title: "Disconnected!",
        duration: 3000
      })
    } else {
      toast({
        variant: "destructive",
        title: `Unable to disconnect!`,
        description:
          "There was an issue performing the action please try again.",
        duration: 3000
      })
    }
  }

  return (
    <NotificationItem activity={activity}>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          handleDeleteRequest(activity.user_id, activity.contact_id)
        }
        loading={disconnectLoading}
      >
        <UserRoundX className="h-4 w-4 mr-2" />
        Disconnect
      </Button>
    </NotificationItem>
  )
}

export default Connection
