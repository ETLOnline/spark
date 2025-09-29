import { RealtimeChannelPrefix } from "../types/prefix"

export function getRealtimeSystemNotificationChannel(userId: string) {
  return `${RealtimeChannelPrefix.SystemNotification}${userId}`
}
