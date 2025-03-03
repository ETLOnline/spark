import pageMeta from "@/src/utils/constants"
import { ProfileActivity } from "../components/Dashboard/Connections/types/connections.types.d"
import { InsertNotification } from "../db/schema"
import { AblyClient } from "../services/realtime/AblyClient"

export const joinRequestChannel = (
  channelId: string,
  onRequestReceived: (request: ProfileActivity, activity: string) => void,
  channelEvents: string[]
) => {
  const channel = AblyClient.channels.get(channelId)
  // Subscribe to incoming requests
  channel.subscribe(channelEvents, (message) => {
    onRequestReceived(message.data, message.name as string)
  })
  // Return functions to send messages and cleanup
  return {
    unsubscribe: () => {
      channel.unsubscribe(channelEvents)
    }
  }
}

export const killConnection = (
  acvtivitySetter: React.Dispatch<React.SetStateAction<ProfileActivity[]>>,
  action: "reject" | "disconnect",
  user_id: string,
  contact_id: string
) => {
  acvtivitySetter((profileActivities: ProfileActivity[]) =>
    profileActivities.map((activity) => {
      if (activity.user_id === user_id && activity.contact_id === contact_id) {
        return action === "disconnect"
          ? {
              ...activity,
              is_accepted: 0
            }
          : { ...activity, is_requested: 0 }
      }
      return activity
    })
  )
}

export const joinNotificationChannel = (
  channelId: string,
  onRequestReceived: (
    notifcation: InsertNotification,
    activity: string
  ) => void,
  channelEvents: string[]
) => {
  const channel = AblyClient.channels.get(channelId)
  // Subscribe to incoming notifications
  channel.subscribe(channelEvents, (message) => {
    onRequestReceived(message.data, message.name as string)
  })
  // Return functions to send messages and cleanup
  return {
    unsubscribe: () => {
      channel.unsubscribe()
    }
  }
}

export const generateUrl = (path: string) => {
  return `${window.location.origin}${path}`
}

export const getPagePath = (page: string) => {
  const targetPageMeta = pageMeta.find((meta) => meta.id === page)
  return targetPageMeta ? targetPageMeta.url : ""
}
