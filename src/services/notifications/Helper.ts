import { beamsServerClient } from "./BeamServer"

type Template = {
  title: string
  body: string
  deep_link: string
  icon?: string
}

type NotificationPayload = {
  receivers: string[]
  template: Template
}

export async function sendBeamsNotification({
  receivers,
  template
}: NotificationPayload) {
  try {
    await beamsServerClient.publishToInterests(receivers, {
      web: {
        notification: template
      }
    })
  } catch (error) {
    console.error("❌ Failed to send Beams notification:", error)
  }
}
