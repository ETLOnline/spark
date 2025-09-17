import { AddNotification } from "@/src/db/data-access/notification/query"
import pusherServer from "../realtime/pusherServer"
import { InsertNotification } from "@/src/db/schema"

export async function SystemNotification(
  notifications: InsertNotification | InsertNotification[]
) {
  const data = await AddNotification(notifications)
  await Promise.all(
    (Array.isArray(notifications) ? notifications : [notifications]).map(
      (notification) =>
        pusherServer.trigger(
          `user-system-notification-${notification.received_by}`,
          "system-notifications",
          notification
        )
    )
  )
}
