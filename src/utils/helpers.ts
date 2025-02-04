import { ProfileActivity } from "../components/Dashboard/Connections/types/activity.types"
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
