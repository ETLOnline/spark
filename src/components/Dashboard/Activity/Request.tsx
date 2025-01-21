import { UserCheck, X } from "lucide-react"
import NotificationItem from "../../NotificationItem/NotifictionItem"
import { Button } from "../../ui/button"
import { ActivityType, ProfileActivity } from "./types/activity.types.d"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  AcceptConnectionAction,
  DeleteConnectionAction
} from "@/src/server-actions/Contact/Contact"
import { activityStore } from "@/src/store/activity/activityStore"
import { useAtom } from "jotai"
import { useToast } from "@/src/hooks/use-toast"

type RequestProps = {
  activity: ProfileActivity
  variant: "sent" | "received"
}

const Request: React.FC<RequestProps> = ({ activity, variant }) => {
  const [profileActivities, setProfileActivities] = useAtom(
    activityStore.profileActivities
  )

  const [
    rejectConnectionLoading,
    rejectConnectionData,
    rejectConnectionError,
    rejectConnection
  ] = useServerAction(DeleteConnectionAction)
  const [
    acceptConnectionLoading,
    acceptConnectionData,
    acceptConnectionError,
    acceptConnection
  ] = useServerAction(AcceptConnectionAction)

  const { toast } = useToast()

  const handleAcceptRequest = async (user_id: string, contact_id: string) => {
    const response = await acceptConnection(user_id, contact_id)
    if (response?.success) {
      setProfileActivities(
        profileActivities.map((activity) => {
          if (
            activity.user_id === user_id &&
            activity.contact_id === contact_id &&
            (activity.type === ActivityType.Connect_Received ||
              activity.type === ActivityType.Connect_Sent)
          ) {
            return {
              ...activity,
              type: ActivityType.Connect_Accepted
            }
          }
          return activity
        })
      )
      toast({ title: "Connection Accepted!", duration: 3000 })
    } else {
      toast({
        variant: "destructive",
        title: "Unable to Accept Request!",
        description:
          "There was an issue performing the action please try again.",
        duration: 3000
      })
    }
  }

  const handleDeleteRequest = async (
    user_id: string,
    contact_id: string,
    type: "sent" | "received"
  ) => {
    const response = await rejectConnection(user_id, contact_id)
    if (response?.success) {
      setProfileActivities((profileActivities) =>
        profileActivities.filter(
          (activity) =>
            activity.user_id !== user_id &&
            activity.contact_id !== contact_id &&
            activity.type !==
              (type === "received"
                ? ActivityType.Connect_Received
                : ActivityType.Connect_Sent)
        )
      )
      toast({
        title: type === "received" ? "Request Rejected!" : "Request Cancelled!",
        duration: 3000
      })
    } else {
      toast({
        variant: "destructive",
        title: `Unable to ${
          type === "received" ? "Reject" : "Cancel"
        } Request!`,
        description:
          "There was an issue performing the action please try again.",
        duration: 3000
      })
    }
  }

  return (
    <NotificationItem activity={activity} key={activity.id}>
      {variant === "received" ? (
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() =>
              handleAcceptRequest(activity.user_id, activity.contact_id)
            }
            loading={acceptConnectionLoading}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              handleDeleteRequest(
                activity.user_id,
                activity.contact_id,
                variant
              )
            }
            loading={rejectConnectionLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            handleDeleteRequest(activity.user_id, activity.contact_id, variant)
          }
          loading={rejectConnectionLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      )}
    </NotificationItem>
  )
}

export default Request
