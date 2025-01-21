import React from "react"
import { ActivityType, ProfileActivity } from "./types/activity.types.d"
import { Button } from "../../ui/button"
import { DeleteConnectionAction } from "@/src/server-actions/Contact/Contact"
import { useServerAction } from "@/src/hooks/useServerAction"
import { UserRoundX } from "lucide-react"
import { useSetAtom } from "jotai"
import { activityStore } from "@/src/store/activity/activityStore"
import { useToast } from "@/src/hooks/use-toast"
import NotificationItem from "../../NotificationItem/NotifictionItem"

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
            activity.type !== ActivityType.Connect_Accepted
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
    <NotificationItem activity={activity} key={activity.id}>
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
