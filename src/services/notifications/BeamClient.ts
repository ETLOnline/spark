// src/lib/beamsClient.ts

import * as PusherPushNotifications from "@pusher/push-notifications-web"

let beamsClient: PusherPushNotifications.Client | null = null

export function getBeamsClient() {
  if (!beamsClient) {
    beamsClient = new PusherPushNotifications.Client({
      instanceId: process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID as string
    })
  }
  return beamsClient
}
