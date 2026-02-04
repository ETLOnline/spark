"use client"

import { useEffect, useState } from "react"
import { NormalizedHierarchy } from "./useEntityHierarchy"
import pusherClient from "@/src/services/realtime/PusherClient"

type PresenceCounts = {
  community?: number
  project?: number
  space?: number
  channel?: number
}

export function usePresence(hierarchy: NormalizedHierarchy | null) {
  const [counts, setCounts] = useState<PresenceCounts>({})

  useEffect(() => {
    if (!hierarchy?.communityId) return

    const subscriptions: {
      key: keyof PresenceCounts
      channelName: string
    }[] = []

    // 🔥 Define presence channels dynamically
    subscriptions.push({
      key: "community",
      channelName: `presence-community-${hierarchy.communityId}`
    })

    if (hierarchy.projectId) {
      subscriptions.push({
        key: "project",
        channelName: `presence-project-${hierarchy.projectId}`
      })
    }

    if (hierarchy.spaceId) {
      subscriptions.push({
        key: "space",
        channelName: `presence-space-${hierarchy.spaceId}`
      })
    }

    if (hierarchy.channelId) {
      subscriptions.push({
        key: "channel",
        channelName: `presence-channel-${hierarchy.channelId}`
      })
    }

    const channels: any[] = []

    // 🔁 Subscribe generically
    subscriptions.forEach(({ key, channelName }) => {
      const channel = pusherClient.subscribe(channelName)
      channels.push(channel)

      channel.bind("pusher:subscription_succeeded", (members: any) => {
        setCounts((prev) => ({
          ...prev,
          [key]: members.count
        }))
      })

      channel.bind("pusher:member_added", () => {
        setCounts((prev) => ({
          ...prev,
          [key]: (prev[key] ?? 0) + 1
        }))
      })

      channel.bind("pusher:member_removed", () => {
        setCounts((prev) => ({
          ...prev,
          [key]: Math.max((prev[key] ?? 1) - 1, 0)
        }))
      })
    })

    // CLEANUP
    return () => {
      channels.forEach((ch) => pusherClient.unsubscribe(ch.name))
    }
  }, [hierarchy])

  return {
    communityOnlineUserCount: counts.community ?? 0,
    spaceOnlineUserCount: counts.space ?? 0,
    channelOnlineUserCount: counts.channel ?? 0,
    projectOnlineUserCount: counts.project ?? 0
  }
}
