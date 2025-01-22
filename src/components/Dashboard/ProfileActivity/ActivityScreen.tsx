"use client"

import { TabsContent } from "@radix-ui/react-tabs"
import { useAtom, useAtomValue } from "jotai"
import { activityStore } from "@/src/store/activity/activityStore"
import { useEffect } from "react"
import Request from "./Request"
import Connection from "./Connection"
import { userStore } from "@/src/store/user/userStore"
import { ProfileActivity } from "./types/activity.types"

type ActivityScreenProps = {
  activities: ProfileActivity[]
}

const ActivityScreen: React.FC<ActivityScreenProps> = ({ activities }) => {
  const [profileActivities, setProfileActivities] = useAtom(
    activityStore.profileActivities
  )

  const user = useAtomValue(userStore.AuthUser)

  useEffect(() => {
    setProfileActivities(activities)
  }, [])

  return (
    <>
      <TabsContent value="all">
        <div className="space-y-4">
          {profileActivities.map((activity) =>
            activity.is_requested ? (
              <Request
                activity={activity}
                variant={
                  activity.contact_id === user?.unique_id ? "received" : "sent"
                }
              />
            ) : (
              <Connection activity={activity} />
            )
          )}
        </div>
      </TabsContent>
      <TabsContent value="pending requests">
        <div className="space-y-4">
          {profileActivities
            .filter((activity) => activity.is_requested)
            .map((activity) => (
              <Request
                activity={activity}
                variant={
                  activity.contact_id === user?.unique_id ? "received" : "sent"
                }
              />
            ))}
        </div>
      </TabsContent>
      <TabsContent value="accepted requests">
        <div className="space-y-4">
          {profileActivities
            .filter((activity) => activity.is_accepted)
            .map((activity) => (
              <Connection activity={activity} />
            ))}
        </div>
      </TabsContent>
    </>
  )
}

export default ActivityScreen
