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
  incomingActivities: ProfileActivity[]
  outgoingActivities: ProfileActivity[]
}

const ActivityScreen: React.FC<ActivityScreenProps> = ({
  incomingActivities,
  outgoingActivities
}) => {
  const [incomingProfileActivities, setIncomingProfileActivities] = useAtom(
    activityStore.incomingProfileActivities
  )
  const [outgoingProfileActivities, setOutgoingProfileActivities] = useAtom(
    activityStore.outgoingProfileActivities
  )

  const user = useAtomValue(userStore.AuthUser)

  const profileActivities = [
    ...incomingProfileActivities,
    ...outgoingProfileActivities
  ].sort((a, b) => {
    return (
      new Date(b.updated_at ?? (b.created_at as string)).getTime() -
      new Date(a.updated_at ?? (a.created_at as string)).getTime()
    )
  })

  useEffect(() => {
    setIncomingProfileActivities([...incomingActivities])
    setOutgoingProfileActivities([...outgoingActivities])
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
                key={activity.user_id + activity.contact_id}
              />
            ) : activity.is_accepted ? (
              <Connection
                activity={activity}
                key={activity.user_id + activity.contact_id}
                variant={
                  activity.contact_id === user?.unique_id ? "received" : "sent"
                }
              />
            ) : null
          )}
        </div>
      </TabsContent>
      <TabsContent value="incoming">
        <div className="space-y-4">
          {incomingProfileActivities
            .filter((activity) => activity.is_requested)
            .map((activity) => (
              <Request
                activity={activity}
                variant={"received"}
                key={activity.user_id + activity.contact_id}
              />
            ))}
        </div>
      </TabsContent>
      <TabsContent value="outgoing">
        <div className="space-y-4">
          {outgoingProfileActivities
            .filter((activity) => activity.is_requested)
            .map((activity) => (
              <Request
                activity={activity}
                variant={"sent"}
                key={activity.user_id + activity.contact_id}
              />
            ))}
        </div>
      </TabsContent>
      <TabsContent value="accepted">
        <div className="space-y-4">
          {profileActivities
            .filter((activity) => activity.is_accepted)
            .map((activity) => (
              <Connection
                activity={activity}
                key={activity.user_id + activity.contact_id}
                variant={
                  activity.contact_id === user?.unique_id ? "received" : "sent"
                }
              />
            ))}
        </div>
      </TabsContent>
    </>
  )
}

export default ActivityScreen
