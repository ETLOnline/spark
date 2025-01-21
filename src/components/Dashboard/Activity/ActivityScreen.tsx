"use client"

import {
  ActivityType,
  ProfileActivity
} from "@/src/components/Dashboard/Activity/types/activity.types.d"
import { TabsContent } from "@radix-ui/react-tabs"
import NotificationItem from "../../NotificationItem/NotifictionItem"
import { useAtom } from "jotai"
import { activityStore } from "@/src/store/activity/activityStore"
import { useEffect } from "react"
import Request from "./Request"
import Follow from "./Follow"
import Connection from "./Connection"

type ActivityScreenProps = {
  activities: ProfileActivity[]
}

const ActivityScreen: React.FC<ActivityScreenProps> = ({ activities }) => {
  const [profileActivities, setProfileActivities] = useAtom(
    activityStore.profileActivities
  )

  useEffect(() => {
    console.log(activities.map((activity) => activity.type));
    
    setProfileActivities(activities)
  }, [])

  return (
    <>
      <TabsContent value="all">
        <div className="space-y-4">
          {profileActivities.map((activity) =>
            activity.type === ActivityType.Connect_Received ? (
              <Request activity={activity} variant="received" />
            ) : activity.type === ActivityType.Connect_Sent ? (
              <Request activity={activity} variant="sent" />
            ) : activity.type === ActivityType.Connect_Accepted ? (
              <Connection activity={activity} />
            ) : (
              activity.type === ActivityType.Following && (
                <Follow activity={activity} />
              )
            )
          )}
        </div>
      </TabsContent>
      <TabsContent value="requests">
        <div className="space-y-4">
          {profileActivities
            .filter(
              (activity) =>
                activity.type === ActivityType.Connect_Received ||
                activity.type === ActivityType.Connect_Sent ||
                activity.type === ActivityType.Connect_Accepted
            )
            .map((activity) =>
              activity.type === ActivityType.Connect_Received ? (
                <Request activity={activity} variant="received" />
              ) : activity.type === ActivityType.Connect_Sent ? (
                <Request activity={activity} variant="sent" />
              ) : (
                <Connection activity={activity} />
              )
            )}
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
              <Follow activity={activity} />
            ))}
        </div>
      </TabsContent>
    </>
  )
}

export default ActivityScreen
