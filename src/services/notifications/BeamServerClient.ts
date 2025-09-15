import PushNotifications from "@pusher/push-notifications-server"

export const beamsServerClient = new PushNotifications({
  instanceId: process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID as string,
  secretKey: process.env.NEXT_PUBLIC_PUSHER_BEAMS_SECRET_KEY as string
})
