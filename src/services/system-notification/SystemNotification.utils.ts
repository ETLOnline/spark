import { AddNotification } from "@/src/db/data-access/notification/query"
import pusherServer from "../realtime/pusherServer"
import { InsertNotification } from "@/src/db/schema"
import { NotificationPayload } from "../notifications/PushNotification.utils"

type NotificationWithUser = NotificationPayload & {
  user_id: string
}
function prepareDataForNotification(
  notificationData: NotificationWithUser
): InsertNotification | InsertNotification[] {
  const notifications = notificationData.receivers.map((receiverId) => ({
    created_by: notificationData.user_id,
    received_by: receiverId,
    title: notificationData.template.title,
    body: notificationData.template.body,
    deep_link: notificationData.template.deep_link,
    icon: notificationData.template.icon ?? null,
    is_read: 0
  }))
  return notifications
}

export async function SendSystemNotification(
  notifications: NotificationWithUser
) {
  try {
    const proccessedNotifications = prepareDataForNotification(notifications)
    await AddNotification(proccessedNotifications)
    const notificationsArray = Array.isArray(proccessedNotifications)
      ? proccessedNotifications
      : [proccessedNotifications]

    await Promise.all(
      notificationsArray.map((notification) =>
        pusherServer.trigger(
          `${notification.received_by}`,
          "system-notifications",
          notification
        )
      )
    )

    console.log("✅ System notifications sent successfully")
  } catch (error) {
    console.error("❌ Failed to send system notifications:", error)
  }
}
