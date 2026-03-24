import { beamsServerClient } from "./BeamServerClient"

type Template = {
  title: string
  body: string
  deep_link: string
  icon?: string
}

export type NotificationPayload = {
  receivers: string[]
  template: Template
}

export async function sendPushNotification({
  receivers,
  template
}: NotificationPayload) {
  try {
    await beamsServerClient.publishToUsers(receivers, {
      web: {
        notification: template
      }
    })
  } catch (error) {
    console.error("❌ Failed to send Beams notification:", error)
  }
}
