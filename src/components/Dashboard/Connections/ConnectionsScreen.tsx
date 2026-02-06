"use client"

import { TabsContent } from "@radix-ui/react-tabs"
import { useAtom, useAtomValue } from "jotai"
import { activityStore } from "@/src/store/activity/activityStore"
import { useEffect, useMemo } from "react"
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

// Common UI for empty states
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-8 text-muted-foreground">{message}</div>
)

const ConnectionsScreen: React.FC<ConnectionsScreenProps> = ({
  incomingActivities,
  outgoingActivities
}) => {
  const [incomingProfileActivities, setIncomingProfileActivities] = useAtom(activityStore.incomingProfileActivities)
  const [outgoingProfileActivities, setOutgoingProfileActivities] = useAtom(activityStore.outgoingProfileActivities)
  const user = useAtomValue(userStore.AuthUser)
  const { toast } = useToast()

  useEffect(() => {
    setIncomingProfileActivities([...incomingActivities])
    setOutgoingProfileActivities([...outgoingActivities])
  }, [incomingActivities, outgoingActivities, setIncomingProfileActivities, setOutgoingProfileActivities])

  useEffect(() => {
    if (!user?.unique_id) return
    const channel = pusherClient.subscribe(user.unique_id)

    channel.bind(ActivityType.request, (request: ProfileActivity) => {
      setIncomingProfileActivities((prev) => {
        const existingIndex = prev.findIndex(a => a.user_id === request.user_id && a.contact_id === request.contact_id)
        if (existingIndex !== -1) {
          const updated = [...prev]
          updated[existingIndex] = request
          return updated
        }
        return [request, ...prev]
      })
      toast({ title: "New Request!", description: `${request.otherUser?.first_name || "Someone"} sent you a request.` })
    })

    channel.bind(ActivityType.delRequest, (request: ProfileActivity) => {
      const filter = (prev: ProfileActivity[]) => prev.filter(a => !(a.user_id === request.user_id && a.contact_id === request.contact_id))
      request.contact_id === user.unique_id ? setIncomingProfileActivities(filter) : setOutgoingProfileActivities(filter)
    })

    channel.bind(ActivityType.acceptRequest, (request: ProfileActivity) => {
      setOutgoingProfileActivities((prev) => prev.map(a =>
        a.user_id === request.user_id && a.contact_id === request.contact_id
          ? { ...a, is_accepted: 1, is_requested: 0, updated_at: request.updated_at } : a
      ))
      toast({ title: "Request Accepted!", description: `You are now connected.` })
    })

    return () => { channel.unbind_all(); pusherClient.unsubscribe(user.unique_id) }
  }, [user?.unique_id, setIncomingProfileActivities, setOutgoingProfileActivities, toast])

  // DEDUPLICATION LOGIC: Ensures only the latest activity per user-pair is shown
  const processedActivities = useMemo(() => {
    const rawList = [...incomingProfileActivities, ...outgoingProfileActivities]
    const uniqueMap = new Map<string, ProfileActivity>()

    rawList.forEach((activity) => {
      // Create a unique key regardless of who started the interaction
      const key = [activity.user_id, activity.contact_id].sort().join("-")
      const existing = uniqueMap.get(key)

      // Keep only the most recently updated record
      if (!existing || moment(activity.updated_at || activity.created_at).isAfter(existing.updated_at || existing.created_at)) {
        uniqueMap.set(key, activity)
      }
    })

    return Array.from(uniqueMap.values()).sort((a, b) =>
      moment.utc(b.updated_at ?? b.created_at).unix() - moment.utc(a.updated_at ?? a.created_at).unix()
    )
  }, [incomingProfileActivities, outgoingProfileActivities])

  const allRequests = processedActivities.filter(a => a.is_requested)
  const incomingRequests = incomingProfileActivities.filter(a => a.is_requested)
  const outgoingRequests = outgoingProfileActivities.filter(a => a.is_requested)
  const connectedProfiles = processedActivities.filter(a => a.is_accepted)

  const renderRequest = (activity: ProfileActivity, fixedVariant?: ReqType) => (
    <Request
      key={`${activity.user_id}-${activity.contact_id}`}
      activity={activity}
      variant={fixedVariant ?? (activity.contact_id === user?.unique_id ? ReqType.incoming : ReqType.outgoing)}
    />
  )

  return (
    <>
      <TabsContent value="all">
        <div className="space-y-4">
          {allRequests.length === 0 ? <EmptyState message="No requests" /> : allRequests.map(a => renderRequest(a))}
        </div>
      </TabsContent>

      <TabsContent value="incoming">
        <div className="space-y-4">
          {incomingRequests.length === 0 ? <EmptyState message="No incoming requests at the moment." /> : incomingRequests.map(a => renderRequest(a, ReqType.incoming))}
        </div>
      </TabsContent>

      <TabsContent value="outgoing">
        <div className="space-y-4">
          {outgoingRequests.length === 0 ? <EmptyState message="No outgoing requests found." /> : outgoingRequests.map(a => renderRequest(a, ReqType.outgoing))}
        </div>
      </TabsContent>

      <TabsContent value="connected">
        <div className="space-y-4">
          {connectedProfiles.length === 0 ? (
            <EmptyState message="No connections available." />
          ) : (
            connectedProfiles.map((a) => (
              <Connection
                key={`${a.user_id}-${a.contact_id}`}
                activity={a}
                variant={a.contact_id === user?.unique_id ? ReqType.incoming : ReqType.outgoing}
              />
            ))
          )}
        </div>
      </TabsContent>
    </>
  )
}

export default ConnectionsScreen