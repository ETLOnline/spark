import {
  ActivityType,
  ProfileActivity
} from "../components/Dashboard/ProfileActivity/types/activity.types.d"
import { AblyClient } from "../services/realtime/AblyClient"

export const joinRequestChannel = (
  channelId: string,
  onRequestReceived: (request: ProfileActivity, activity: string) => void
) => {
  const channel = AblyClient.channels.get(channelId)
  // Subscribe to incoming requests
  channel.subscribe(
    [ActivityType.acceptRequest, ActivityType.delRequest, ActivityType.request],
    (message) => {
      onRequestReceived(message.data, message.name as string)
    }
  )
  // Return functions to send messages and cleanup
  return {
    unsubscribe: () => {
      channel.unsubscribe()
      channel.detach()
    }
  }
}
