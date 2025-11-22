import { MentionChatRegex } from "@/src/components/Dashboard/Chat/constants"
import { RealtimeChannelPrefix } from "../types/prefix"

export function getRealtimeSystemNotificationChannel(userId: string) {
  return `${RealtimeChannelPrefix.SystemNotification}${userId}`
}


/**
 * Extracts mentioned user IDs from message content
 * Supports formats like: @[John Doe](user_id_123)
 * @param message - The message content
 * @returns Array of unique user IDs that were mentioned
 */
export const extractMentionsFromMessage = (message: string): string[] => {
  const mentionRegex = MentionChatRegex
  const mentions: string[] = []
  
  let match
  while ((match = mentionRegex.exec(message)) !== null) {
    const userId = match[2] 
    if (userId && !mentions.includes(userId)) {
      mentions.push(userId)
    }
  }
  
  return mentions
}
