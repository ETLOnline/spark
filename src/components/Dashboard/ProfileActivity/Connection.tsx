import { DeleteContactAction } from "@/src/server-actions/Contact/Contact"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useSetAtom } from "jotai"
import { activityStore } from "@/src/store/activity/activityStore"
import { useToast } from "@/src/hooks/use-toast"
import { Button } from "../../ui/button"
import { UserRoundX } from "lucide-react"
import { ProfileActivity } from "./types/activity.types"
import NotificationItem from "@/src/components/NotificationItem/NotifictionItem"

type ConnectionProps = {
  activity: ProfileActivity
  variant: "sent" | "received"
}

const Connection: React.FC<ConnectionProps> = ({ activity,variant }) => {
  const setProfileActivities = useSetAtom(
    variant === "received"
      ? activityStore.incomingProfileActivities
      : activityStore.outgoingProfileActivities
  )

  const [disconnectLoading, disconnectData, disconnectError, disconnect] =
    useServerAction(DeleteContactAction)

  const { toast } = useToast()

  const handleDeleteRequest = async (user_id: string, contact_id: string) => {
    const response = await disconnect(user_id, contact_id)
    if (response?.success) {
      setProfileActivities((profileActivities) =>
        profileActivities.map((activity) => {
          if (
            activity.user_id === user_id &&
            activity.contact_id === contact_id
          ) {
            return {
              ...activity,
              is_accepted: 0
            }
          }
          return activity
        })
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
