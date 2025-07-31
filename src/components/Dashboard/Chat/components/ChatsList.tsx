import { ScrollArea } from "@radix-ui/react-scroll-area"
import React, { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar"
import { Badge } from "../../../ui/badge"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { chatStore } from "@/src/store/chat/chatStore"
import { userStore } from "@/src/store/user/userStore"
import { SelectChat, SelectUser } from "@/src/db/schema"
import Loader from "../../../common/Loader/Loader"
import ChatContactItem from "./ChatContactItem"

const ChatsList = ({ searchQuery = "" }) => {
  const [myChats, setMyChats] = useAtom(chatStore.myChats)
  const authUser = useAtomValue(userStore.AuthUser)

  const filteredChats = myChats.filter((chat) => {
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

  return (
    <ScrollArea className="h-[calc(100vh-15rem)] px-2  pb-5">
      {authUser ? (
        <div className="overflow-y-auto h-full space-y-1 ">
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
