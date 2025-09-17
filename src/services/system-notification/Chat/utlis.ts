import { NotificationEvent } from "minio"
import { NotificationPayload } from "../../notifications/PushNotification.utils"
import { SystemNotification } from "../SystemNotification.utils"

export const SendChatSystemNotification = async (
  user_id: string,
  notificationData: NotificationPayload
) => {
  const notifications = notificationData.receivers.map((receiverId) => ({
    created_by: user_id,
    received_by: receiverId.replace(/^user-/, ""),
    title: notificationData.template.title,
    body: notificationData.template.body,
    deep_link: notificationData.template.deep_link,
    icon: notificationData.template.icon ?? null,
    is_read: 0
  }))
  await SystemNotification(notifications)
}
