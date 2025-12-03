"use client"

import { useOnlineStatus } from "@/src/components/providers/OnlineStatusProvider"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { SelectChat } from "@/src/db/schema"
import { parseMentions } from "@/src/services/realtime/utils/helper"
import { chatStore } from "@/src/store/chat/chatStore"
import { userStore } from "@/src/store/user/userStore"
import {
  computeTypingLabel,
  parseLastMessageType
} from "@/src/utils/clientHelper"
import Avvvatars from "avvvatars-react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { AtSign } from "lucide-react"
import { useMemo } from "react"

interface ChatContactItemProps {
  chat: SelectChat
  typingUsers?: Record<number, Set<string>>
}

const ChatContactItem = ({ chat, typingUsers }: ChatContactItemProps) => {
  const authUser = useAtomValue(userStore.AuthUser)
  const authUserId = authUser?.unique_id
  const [currentChat, setCurrentChat] = useAtom(chatStore.currentChat)
  const setSwtichedChat = useSetAtom(chatStore.switchedChat)
  const setIsMobileMenuOpen = useSetAtom(chatStore.isMobileMenuOpen)
  const { getOnlineUsers } = useOnlineStatus()

  const users = getOnlineUsers()

  const filteredContact = chat?.users?.find(
    (user) => user.user_id !== authUser?.unique_id
  )

  const chatContact = filteredContact?.user || null

  const isCurrentUserMentioned = useMemo(() => {
    if (!authUserId || !chat.last_message) return false
    const mentionRegex = new RegExp(`@\\[[^\\]]+\\]\\(${authUserId}\\)`, "g")
    return mentionRegex.test(chat.last_message)
  }, [chat.last_message, authUserId])

  const lastMessageInfo = useMemo(() => {
    return parseLastMessageType(chat.last_message)
  }, [chat.last_message])

  const typingLabel = computeTypingLabel({ chat, typingUsers, authUserId })

  if (!filteredContact) return null
  if (!chatContact) return null

  const isContactOnline = users.has(filteredContact.user_id)

  const currentUserChatRecord = chat?.users?.find(
    (user) => user.user_id === authUser?.unique_id
  )

  const unreadCount = currentUserChatRecord?.unread_count || 0

  return (
    <div
      key={chat.id}
      className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${
        currentChat?.id === chat.id ? "bg-secondary" : "hover:bg-secondary/50"
      }`}
      onClick={() => {
        setSwtichedChat(chat || null)
        setIsMobileMenuOpen(false)
      }}
    >
      {chat?.is_group ? (
        <Avvvatars value={chat.name || ""} style="shape" />
      ) : (
        <div className="relative h-10 w-10">
          <Avatar className="h-10 w-10 bg-white">
            {chatContact?.profile_url ? (
              <AvatarImage src={chatContact.profile_url} />
            ) : (
              <AvatarFallback>
                {chatContact.first_name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>

          {isContactOnline && (
            <span
              className="absolute bottom-0 right-0 z-50 
                     h-3 w-3 rounded-full bg-green-500 
                     border-2 border-white"
            ></span>
          )}
        </div>
      )}

      <div className="flex-1 max-w-[60%]">
        <p className="font-medium truncate">
          {chat.is_group
            ? chat.name
            : `${chatContact?.first_name} ${chatContact?.last_name}`}
        </p>

        {typingLabel ? (
          <p className="text-sm text-primary truncate animate-pulse">
            {typingLabel}
          </p>
        ) : (
          <>
            {lastMessageInfo.type === "text" && (
              <p
                className="text-sm text-muted-foreground truncate"
                dangerouslySetInnerHTML={{
                  __html: lastMessageInfo.content ?? ""
                }}
              />
            )}

            {lastMessageInfo.type === "image" && (
              <p className="text-sm text-muted-foreground truncate">
                {lastMessageInfo.filename}
              </p>
            )}

            {lastMessageInfo.type === "file" && (
              <p className="text-sm text-muted-foreground truncate">
                {lastMessageInfo.filename}
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {isCurrentUserMentioned && unreadCount > 0 && (
          <Badge
            variant="secondary"
            className="rounded-full px-2 py-1 bg-primary/10 text-primary"
          >
            <AtSign className="h-3 w-3" />
          </Badge>
        )}

        {unreadCount > 0 && (
          <Badge variant="secondary" className="rounded-full px-2 py-1">
            {unreadCount}
          </Badge>
        )}
      </div>
    </div>
  )
}

export default ChatContactItem
