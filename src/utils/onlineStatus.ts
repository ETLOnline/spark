import pusherClient from "@/src/services/realtime/PusherClient"

export type OnlineStatusContext = "global" | "space"

interface OnlineStatusManager {
  onlineUsers: Set<string>
  unsubscribe: () => void
}
export function subscribeToOnlineStatus(
  context: OnlineStatusContext,
  spaceId?: string,
  onUsersChange?: (users: Set<string>) => void
): OnlineStatusManager {
  const channelName =
    context === "global" ? "presence-online-users" : `presence-space-${spaceId}`

  const presenceChannel = pusherClient.subscribe(channelName)
  const onlineUsers = new Set<string>()

  presenceChannel.bind("pusher:subscription_succeeded", (members: any) => {
    onlineUsers.clear()
    members.each((member: any) => {
      onlineUsers.add(member.id)
    })

    onUsersChange?.(onlineUsers)
  })

  presenceChannel.bind("pusher:member_added", (member: any) => {
    onlineUsers.add(member.id)
    onUsersChange?.(onlineUsers)
  })

  presenceChannel.bind("pusher:member_removed", (member: any) => {
    onlineUsers.delete(member.id)
    onUsersChange?.(onlineUsers)
  })

  const unsubscribe = () => {
    presenceChannel.unbind_all()
    pusherClient.unsubscribe(channelName)
  }

  return { onlineUsers, unsubscribe }
}
