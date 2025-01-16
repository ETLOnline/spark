"use client"

import {
  ActivityType,
  ProfileActivity
} from "@/src/components/Dashboard/Activity/types/activity.types.d"
import { TabsContent } from "@radix-ui/react-tabs"
import NotificationItem from "../../NotificationItem/NotifictionItem"
import { Button } from "../../ui/button"
import { UserCheck, UserMinus, X } from "lucide-react"
import { useSetAtom } from "jotai"
import { activityStore } from "@/src/store/activity/activityStore"

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

  const handleAcceptRequest = (id: string) => {
    // setProfileActivities(
    //   activities.map((activity) =>
    //     activity.id === id ? { ...activity, action:ActivityType.Following } : activity
    //   )
    // )
    // Here you would typically send an API request to accept the connection
  }

  const handleRejectRequest = (id: string) => {
    // setProfileActivities(activities.filter((activity) => activity.id !== id))
    // Here you would typically send an API request to reject the connection
  }

  const handleCancelRequest = (id: string) => {
    // setProfileActivities(activities.filter((activity) => activity.id !== id))
    // Here you would typically send an API request to cancel the sent request
  }

  const handleUnfollow = (id: string) => {
    // setProfileActivities(activities.filter((activity) => activity.id !== id))
    // Here you would typically send an API request to cancel the sent request
  }

  return (
    <>
      <TabsContent value="all">
        <div className="space-y-4">
          {activities.map((activity) => (
            <NotificationItem activity={activity}>
              {activity.type === ActivityType.Connect_Received ? (
                <RequestButtonGroup
                  handler={() =>
                    handleAcceptRequest(
                      activity.contact_id + activity.contact_id
                    )
                  }
                  secondaryHandler={() =>
                    handleRejectRequest(
                      activity.contact_id + activity.contact_id
                    )
                  }
                />
              ) : activity.type === ActivityType.Connect_Sent ? (
                <CancelRequestButton
                  handler={() =>
                    handleCancelRequest(
                      activity.contact_id + activity.contact_id
                    )
                  }
                />
              ) : (
                activity.type === ActivityType.Following && (
                  <UnfollowButton
                    handler={() =>
                      handleUnfollow(activity.contact_id + activity.contact_id)
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
              <NotificationItem activity={activity}>
                {activity.type === ActivityType.Connect_Received ? (
                  <RequestButtonGroup
                    handler={() =>
                      handleAcceptRequest(
                        activity.contact_id + activity.contact_id
                      )
                    }
                    secondaryHandler={() =>
                      handleRejectRequest(
                        activity.contact_id + activity.contact_id
                      )
                    }
                  />
                ) : (
                  activity.type === ActivityType.Connect_Sent && (
                    <CancelRequestButton
                      handler={() =>
                        handleCancelRequest(
                          activity.contact_id + activity.contact_id
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
              <NotificationItem activity={activity} />
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
              <NotificationItem activity={activity}>
                {activity.type === ActivityType.Following && (
                  <UnfollowButton
                    handler={() =>
                      handleUnfollow(activity.contact_id + activity.contact_id)
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
