"use client"

import { TabsContent } from "@radix-ui/react-tabs"
import { useAtom, useAtomValue } from "jotai"
import { activityStore } from "@/src/store/activity/activityStore"
import { useEffect } from "react"
import Request from "./Request"
import Connection from "./Connection"
import { userStore } from "@/src/store/user/userStore"
import {
  ActivityType,
  ProfileActivity,
  ReqType
} from "./types/connections.types"
import { useToast } from "@/src/hooks/use-toast"
import pusherClient from "@/src/services/realtime/PusherClient"
import moment from "moment"

type ConnectionsScreenProps = {
  incomingActivities: ProfileActivity[]
  outgoingActivities: ProfileActivity[]
}

const ConnectionsScreen: React.FC<ConnectionsScreenProps> = ({
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

  const { toast } = useToast()

  const profileActivities = [
    ...incomingProfileActivities,
    ...outgoingProfileActivities
  ].sort((a, b) => {
    return (
      moment.utc(b.updated_at ?? b.created_at).unix() -
      moment.utc(a.updated_at ?? a.created_at).unix()
    )
  })

  useEffect(() => {
    setIncomingProfileActivities([...incomingActivities])
    setOutgoingProfileActivities([...outgoingActivities])
  }, [incomingActivities, outgoingActivities])

  useEffect(() => {
    if (!user?.unique_id) return
    const channel = pusherClient.subscribe(user.unique_id)
    channel.bind(ActivityType.request, (request: ProfileActivity) => {
      setIncomingProfileActivities((prev) => {
        const existingIndex = prev.findIndex(
          (a) =>
            a.user_id === request.user_id && a.contact_id === request.contact_id
        )

        if (existingIndex !== -1) {
          const updated = [...prev]
          updated[existingIndex] = request
          return updated
        } else {
          return [request, ...prev]
        }
      })

      toast({
        title: "New Request!",
        description: `${request.otherUser?.first_name || "Someone"} sent you a request.`,
        duration: 3000
      })
    })

    channel.bind(ActivityType.delRequest, (request: ProfileActivity) => {
      if (request.contact_id === user.unique_id) {
        setIncomingProfileActivities((prev) =>
          prev.filter(
            (a) =>
              !(
                a.user_id === request.user_id &&
                a.contact_id === request.contact_id
              )
          )
        )
      } else {
        setOutgoingProfileActivities((prev) =>
          prev.filter(
            (a) =>
              !(
                a.user_id === request.user_id &&
                a.contact_id === request.contact_id
              )
          )
        )
      }
    })

    channel.bind(ActivityType.acceptRequest, (request: ProfileActivity) => {
      setOutgoingProfileActivities((prev) =>
        prev.map((activity) =>
          activity.user_id === request.user_id &&
          activity.contact_id === request.contact_id
            ? {
                ...activity,
                is_accepted: 1,
                is_requested: 0,
                updated_at: request.updated_at
              }
            : activity
        )
      )
      toast({
        title: "Request Accepted!",
        description: `You are now connected.`,
        duration: 3000
      })
    })

    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(user.unique_id)
    }
  }, [
    user?.unique_id,
    setIncomingProfileActivities,
    setOutgoingProfileActivities
  ])

  return (
    <>
      <TabsContent value="all">
        <div className="space-y-4">
          {profileActivities.map((activity) =>
            activity.is_requested ? (
              <Request
                activity={activity}
                variant={
                  activity.contact_id === user?.unique_id
                    ? ReqType.incoming
                    : ReqType.outgoing
                }
                key={activity.user_id + activity.contact_id}
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
                variant={ReqType.incoming}
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
                variant={ReqType.outgoing}
                key={activity.user_id + activity.contact_id}
              />
            ))}
        </div>
      </TabsContent>
      <TabsContent value="connected">
        <div className="space-y-4">
          {profileActivities
            .filter((activity) => activity.is_accepted)
            .map((activity) => (
              <Connection
                activity={activity}
                key={activity.user_id + activity.contact_id}
                variant={
                  activity.contact_id === user?.unique_id
                    ? ReqType.incoming
                    : ReqType.outgoing
                }
              />
            ))}
        </div>
      </TabsContent>
    </>
  )
}

export default ConnectionsScreen
