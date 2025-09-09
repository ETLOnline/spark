import { beamsServerClient } from "./BeamServer"
import { Template } from "./NotificationTemplates"

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
