"use client"

import {
  ActivityType,
  ProfileActivity
} from "@/src/components/Dashboard/Activity/types/activity.types.d"
import { TabsContent } from "@radix-ui/react-tabs"
import NotificationItem from "../../NotificationItem/NotifictionItem"
import { Button } from "../../ui/button"
import { UserCheck, UserMinus, X } from "lucide-react"
import { useAtom } from "jotai"
import { activityStore } from "@/src/store/activity/activityStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  AcceptConnectionAction,
  RejectConnectionAction
} from "@/src/server-actions/Contact/Contact"
import { useEffect, useState } from "react"
import { useToast } from "@/src/hooks/use-toast"

type ActivityScreenProps = {
  activities: ProfileActivity[]
}

type ActivityButtonProps = {
  handler: () => void
  actionLoading: boolean
}

type ActivityButtonGroupProps = ActivityButtonProps & {
  secondaryHandler: () => void
  secondaryActionLoading: boolean
}

const RequestButtonGroup: React.FC<ActivityButtonGroupProps> = ({
  handler,
  secondaryHandler,
  actionLoading,
  secondaryActionLoading
}) => (
  <div className="flex space-x-2">
    <Button size="sm" onClick={handler} loading={actionLoading}>
      <UserCheck className="h-4 w-4 mr-2" />
      Accept
    </Button>
    <Button
      size="sm"
      variant="outline"
      onClick={secondaryHandler}
      loading={secondaryActionLoading}
    >
      <X className="h-4 w-4 mr-2" />
      Reject
    </Button>
  </div>
)

const CancelRequestButton: React.FC<ActivityButtonProps> = ({
  handler,
  actionLoading
}) => (
  <Button size="sm" variant="outline" onClick={handler} loading={actionLoading}>
    <X className="h-4 w-4 mr-2" />
    Cancel
  </Button>
)

const UnfollowButton: React.FC<ActivityButtonProps> = ({
  handler,
  actionLoading
}) => (
  <Button size="sm" variant="outline" onClick={handler} loading={actionLoading}>
    <UserMinus className="h-4 w-4 mr-2" />
    Unfollow
  </Button>
)

const ActivityScreen: React.FC<ActivityScreenProps> = ({ activities }) => {
  const [profileActivities, setProfileActivities] = useAtom(
    activityStore.profileActivities
  )

  const [
    rejectConnectionLoading,
    rejectConnectionData,
    rejectConnectionError,
    rejectConnection
  ] = useServerAction(RejectConnectionAction)
  const [
    acceptConnectionLoading,
    acceptConnectionData,
    acceptConnectionError,
    acceptConnection
  ] = useServerAction(AcceptConnectionAction)

  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean
  }>({})

  const { toast } = useToast()

  useEffect(() => {
    setProfileActivities(activities)
  }, [])

  const handleAcceptRequest = async (user_id: string, contact_id: string) => {
    const key = `${user_id}-${contact_id}-accept`
    setLoadingStates((prev) => ({ ...prev, [key]: true }))
    const response = await acceptConnection(user_id, contact_id)
    setLoadingStates((prev) => ({ ...prev, [key]: false }))
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
    const key = `${user_id}-${contact_id}-reject`
    setLoadingStates((prev) => ({ ...prev, [key]: true }))
    const response = await rejectConnection(user_id, contact_id)
    setLoadingStates((prev) => ({ ...prev, [key]: false }))
    if (response?.success) {
      setProfileActivities(
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

  const handleUnfollow = async (user_id: string, contact_id: string) => {
    const key = `${user_id}-${contact_id}-unfollow`
    setLoadingStates((prev) => ({ ...prev, [key]: true }))
    try {
      setProfileActivities(
        profileActivities.filter(
          (activity) =>
            activity.user_id !== user_id &&
            activity.contact_id !== contact_id &&
            activity.type !== ActivityType.Following
        )
      )
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [key]: false }))
    }
  }

  return (
    <>
      <TabsContent value="all">
        <div className="space-y-4">
          {profileActivities.map((activity) => (
            <NotificationItem activity={activity} key={activity.id}>
              {activity.type === ActivityType.Connect_Received ? (
                <RequestButtonGroup
                  handler={() =>
                    handleAcceptRequest(activity.user_id, activity.contact_id)
                  }
                  secondaryHandler={() =>
                    handleDeleteRequest(
                      activity.user_id,
                      activity.contact_id,
                      "received"
                    )
                  }
                  actionLoading={
                    loadingStates[
                      `${activity.user_id}-${activity.contact_id}-accept`
                    ] || false
                  }
                  secondaryActionLoading={
                    loadingStates[
                      `${activity.user_id}-${activity.contact_id}-reject`
                    ] || false
                  }
                />
              ) : activity.type === ActivityType.Connect_Sent ? (
                <CancelRequestButton
                  handler={() =>
                    handleDeleteRequest(
                      activity.user_id,
                      activity.contact_id,
                      "sent"
                    )
                  }
                  actionLoading={
                    loadingStates[
                      `${activity.user_id}-${activity.contact_id}-reject`
                    ] || false
                  }
                />
              ) : (
                activity.type === ActivityType.Following && (
                  <UnfollowButton
                    handler={() =>
                      handleUnfollow(activity.user_id, activity.contact_id)
                    }
                    actionLoading={
                      loadingStates[
                        `${activity.user_id}-${activity.contact_id}-unfollow`
                      ] || false
                    }
                  />
                )
              )}
            </NotificationItem>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="requests">
        <div className="space-y-4">
          {profileActivities
            .filter(
              (activity) =>
                activity.type === ActivityType.Connect_Received ||
                activity.type === ActivityType.Connect_Sent
            )
            .map((activity) => (
              <NotificationItem activity={activity} key={activity.id}>
                {activity.type === ActivityType.Connect_Received ? (
                  <RequestButtonGroup
                    handler={() =>
                      handleAcceptRequest(activity.user_id, activity.contact_id)
                    }
                    secondaryHandler={() =>
                      handleDeleteRequest(
                        activity.user_id,
                        activity.contact_id,
                        "received"
                      )
                    }
                    actionLoading={
                      loadingStates[
                        `${activity.user_id}-${activity.contact_id}-accept`
                      ] || false
                    }
                    secondaryActionLoading={
                      loadingStates[
                        `${activity.user_id}-${activity.contact_id}-reject`
                      ] || false
                    }
                  />
                ) : (
                  activity.type === ActivityType.Connect_Sent && (
                    <CancelRequestButton
                      handler={() =>
                        handleDeleteRequest(
                          activity.user_id,
                          activity.contact_id,
                          "sent"
                        )
                      }
                      actionLoading={
                        loadingStates[
                          `${activity.user_id}-${activity.contact_id}-reject`
                        ] || false
                      }
                    />
                  )
                )}
              </NotificationItem>
            ))}
        </div>
      </TabsContent>
      <TabsContent value="visits">
        <div className="space-y-4">
          {profileActivities
            .filter((activity) => activity.type === ActivityType.Visited)
            .map((activity) => (
              <NotificationItem activity={activity} key={activity.id} />
            ))}
        </div>
      </TabsContent>
      <TabsContent value="following">
        <div className="space-y-4">
          {profileActivities
            .filter(
              (activity) =>
                activity.type === ActivityType.Following ||
                activity.type === ActivityType.Followed
            )
            .map((activity) => (
              <NotificationItem activity={activity} key={activity.id}>
                {activity.type === ActivityType.Following && (
                  <UnfollowButton
                    handler={() =>
                      handleUnfollow(activity.user_id, activity.contact_id)
                    }
                    actionLoading={
                      loadingStates[
                        `${activity.user_id}-${activity.contact_id}-unfollow`
                      ] || false
                    }
                  />
                )}
              </NotificationItem>
            ))}
        </div>
      </TabsContent>
    </>
  )
}

export default ActivityScreen
