"use client"

import {
  ActivityType,
  ProfileActivity
} from "@/src/components/Dashboard/Activity/types/activity.types.d"
import { TabsContent } from "@radix-ui/react-tabs"
import NotificationItem from "../../NotificationItem/NotifictionItem"
import { Button } from "../../ui/button"
import { UserCheck, UserMinus, X } from "lucide-react"
import { useAtomValue, useSetAtom } from "jotai"
import { activityStore } from "@/src/store/activity/activityStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  AcceptConnectionAction,
  RejectConnectionAction
} from "@/src/server-actions/Contact/Contact"
import { useEffect } from "react"

type ActivityScreenProps = {
  activities: ProfileActivity[]
}

type ActivityButtonProps = {
  handler: () => void
}

type ActivityButtonGroupProps = ActivityButtonProps & {
  secondaryHandler: () => void
}

const RequestButtonGroup: React.FC<ActivityButtonGroupProps> = ({
  handler,
  secondaryHandler
}) => (
  <div className="flex space-x-2">
    <Button size="sm" onClick={handler}>
      <UserCheck className="h-4 w-4 mr-2" />
      Accept
    </Button>
    <Button size="sm" variant="outline" onClick={secondaryHandler}>
      <X className="h-4 w-4 mr-2" />
      Reject
    </Button>
  </div>
)

const CancelRequestButton: React.FC<ActivityButtonProps> = ({ handler }) => (
  <Button size="sm" variant="outline" onClick={handler}>
    <X className="h-4 w-4 mr-2" />
    Cancel
  </Button>
)

const UnfollowButton: React.FC<ActivityButtonProps> = ({ handler }) => (
  <Button size="sm" variant="outline" onClick={handler}>
    <UserMinus className="h-4 w-4 mr-2" />
    Unfollow
  </Button>
)

const ActivityScreen: React.FC<ActivityScreenProps> = ({ activities }) => {
  const setProfileActivities = useSetAtom(activityStore.profileActivities)
  const profileActivities = useAtomValue(activityStore.profileActivities)

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

  useEffect(() => {
    setProfileActivities(activities)
  }, [])

  const handleAcceptRequest = async (user_id: string, contact_id: string) => {
    try {
      await acceptConnection(user_id, contact_id)
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
    } catch (error) {
      console.error(error)
    }
  }

  const handleRejectRequest = async (user_id: string, contact_id: string) => {
    try {
      await rejectConnection(user_id, contact_id)
      setProfileActivities(
        activities.filter(
          (activity) =>
            activity.user_id !== user_id &&
            activity.contact_id !== contact_id &&
            activity.type !== ActivityType.Connect_Sent
        )
      )
    } catch (error) {
      console.error(error)
    }
  }

  const handleUnfollow = async (user_id: string, contact_id: string) => {
    try {
      setProfileActivities(
        activities.filter(
          (activity) =>
            activity.user_id !== user_id &&
            activity.contact_id !== contact_id &&
            activity.type !== ActivityType.Following
        )
      )
    } catch (error) {
      console.error(error)
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
                    handleRejectRequest(activity.user_id, activity.contact_id)
                  }
                />
              ) : activity.type === ActivityType.Connect_Sent ? (
                <CancelRequestButton
                  handler={() =>
                    handleRejectRequest(activity.user_id, activity.contact_id)
                  }
                />
              ) : (
                activity.type === ActivityType.Following && (
                  <UnfollowButton
                    handler={() =>
                      handleUnfollow(activity.user_id, activity.contact_id)
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
          {activities
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
                      handleRejectRequest(activity.user_id, activity.contact_id)
                    }
                  />
                ) : (
                  activity.type === ActivityType.Connect_Sent && (
                    <CancelRequestButton
                      handler={() =>
                        handleRejectRequest(
                          activity.user_id,
                          activity.contact_id
                        )
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
          {activities
            .filter((activity) => activity.type === ActivityType.Visited)
            .map((activity) => (
              <NotificationItem activity={activity} key={activity.id} />
            ))}
        </div>
      </TabsContent>
      <TabsContent value="following">
        <div className="space-y-4">
          {activities
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
