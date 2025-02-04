import { useServerAction } from "@/src/hooks/useServerAction"
import {
  AcceptConnectionAction,
  DeleteConnectionAction
} from "@/src/server-actions/Contact/Contact"
import { activityStore } from "@/src/store/activity/activityStore"
import { useSetAtom } from "jotai"
import { useToast } from "@/src/hooks/use-toast"
import { Button } from "../../ui/button"
import { UserCheck, X } from "lucide-react"
import { ProfileActivity } from "./types/activity.types"
import NotificationItem from "../NotificationItem/NotifictionItem"

type RequestProps = {
  activity: ProfileActivity
  variant: "sent" | "received"
}

const Request: React.FC<RequestProps> = ({ activity, variant }) => {
  const setProfileActivities = useSetAtom(
    variant === "received"
      ? activityStore.incomingProfileActivities
      : activityStore.outgoingProfileActivities
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
      setProfileActivities((profileActivities) => {
        let updatedIndex = -1
        const updatedActivities = profileActivities.map((activity, i) => {
          if (
            activity.user_id === user_id &&
            activity.contact_id === contact_id
          ) {
            updatedIndex = i
            return {
              ...activity,
              is_accepted: 1,
              is_requested: 0,
              updated_at: response.data.updated_at
            }
          }
          return activity
        })
        if (updatedIndex > -1) {
          const [item] = updatedActivities.splice(updatedIndex, 1)
          updatedActivities.unshift(item)
        }
        return updatedActivities
      })
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
        profileActivities.map((activity) => {
          if (
            activity.user_id === user_id &&
            activity.contact_id === contact_id
          ) {
            return {
              ...activity,
              is_requested: 0
            }
          }
          return activity
        })
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
    <NotificationItem activity={activity}>
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
