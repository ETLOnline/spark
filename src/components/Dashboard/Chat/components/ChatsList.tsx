import { ScrollArea } from "@radix-ui/react-scroll-area"
import React, { useMemo } from "react"
import { useAtom, useAtomValue } from "jotai"
import { chatStore } from "@/src/store/chat/chatStore"
import { userStore } from "@/src/store/user/userStore"
import Loader from "../../../common/Loader/Loader"
import ChatContactItem from "./ChatContactItem"
import moment from "moment"
import { useOnlineStatus } from "@/src/components/providers/OnlineStatusProvider"
import { spaceStore } from "@/src/store/space/spaceStore"

export const ChatsList = ({
  searchQuery = "",
  typingUsers
}: {
  searchQuery: string
  typingUsers?: Record<number, Set<string>>
}) => {
  const [myChats, setMyChats] = useAtom(chatStore.myChats)
  const authUser = useAtomValue(userStore.AuthUser)
  const { globalOnlineUsers, spaceOnlineUsers } = useOnlineStatus()
  const currentSpace = useAtomValue(spaceStore.currentSpace)

  const onlineUsers = currentSpace ? spaceOnlineUsers : globalOnlineUsers

  const computeTypingLabel = (chat: (typeof myChats)[number]) => {
    if (!typingUsers) return ""
    const chatTypers = typingUsers[chat.id] || new Set<string>()
    if (chatTypers.size === 0) return ""

    const memberIds = (chat.users || []).map((u) => u.user_id).filter(Boolean)
    const typers = memberIds.filter(
      (id) => chatTypers.has(id) && id !== authUser?.unique_id
    )
    if (typers.length === 0) return ""
    if (!chat.is_group) return "typing..."
    const names = (chat.users || [])
      .filter((u) => typers.includes(u.user_id))
      .map((u) => u.user?.first_name)
      .filter(Boolean)
      .slice(0, 3)
    return names.length > 0 ? `${names.join(", ")} typing...` : "typing..."
  }

  const filteredChats = useMemo(() => {
    const chats = myChats.filter((chat) => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase().replace(/\s+/g, "")
      if (
        chat.is_group &&
        chat.name?.toLowerCase().replace(/\s+/g, "").includes(query)
      )
        return true

      if (!chat.is_group && chat.users) {
        const contact = chat.users.find(
          (u) => u.user?.unique_id !== authUser?.unique_id
        )?.user
        if (contact) {
          const fullName = `${contact.first_name} ${contact.last_name}`
            .toLowerCase()
            .replace(/\s+/g, "")
          const email = contact.email?.toLowerCase() || ""
          if (
            fullName.includes(query) ||
            email.replace(/\s+/g, "").includes(query)
          ) {
            return true
          }
        }
      }
      return false
    })

    return chats.sort(
      (a, b) => moment(b.updated_at).valueOf() - moment(a.updated_at).valueOf()
    )
  }, [myChats, searchQuery, authUser])

  return (
    <ScrollArea className="h-[calc(100vh-15rem)] px-2 pb-5">
      {authUser ? (
        <div className="overflow-y-auto h-full space-y-1">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <ChatContactItem key={chat.id} chat={chat} />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No chats found.
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <Loader />
        </div>
      )}
    </ScrollArea>
  )
}

export default ChatsList
