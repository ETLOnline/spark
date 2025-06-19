"use client"

import { ChatScreen } from "@/src/components/Dashboard/Chat"
import { SelectChat } from "@/src/db/schema"
import {
  GetChatBySlugWithMessagesAction,
  GetChatsAction
} from "@/src/server-actions/Chat/Chat"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAtom, useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { chatStore } from "@/src/store/chat/chatStore"

export default function ChatPage() {
  const searchParams = useSearchParams()
  const [currentChat, setCurrentChat] = useState<SelectChat | undefined>(
    undefined
  )
  const [allChats, setAllChats] = useState<SelectChat[]>([])
  const [loading, setLoading] = useState(true)

  const permission = useAtomValue(userStore.Permissions)
  const [permissionChecker, setPermissionChecker] = useAtom(
    chatStore.permissionCheckerAtom
  )

  // Initialize PermissionChecker if not already set
  useEffect(() => {
    if (permission && !permissionChecker) {
      const checker = new PermissionChecker("global", permission)
      setPermissionChecker(checker)
    }
  }, [permission, permissionChecker, setPermissionChecker])

  useEffect(() => {
    const fetchChatsAndCurrentChat = async () => {
      try {
        setLoading(true)
        let selectedCurrentChatSlug = null

        // Fetch all chats
        const chatsRes = await GetChatsAction()
        let fetchedChats: SelectChat[] = []

        if (chatsRes?.success && chatsRes?.data) {
          fetchedChats = chatsRes.data
          setAllChats(fetchedChats)
        }

        // Determine which chat to select
        if (fetchedChats.length > 0) {
          const activeChatParam = searchParams.get("active_chat")

          if (activeChatParam) {
            selectedCurrentChatSlug = activeChatParam
          } else {
            selectedCurrentChatSlug = fetchedChats[0].chat_slug
          }

          // Fetch the selected chat with messages
          const currentChatRes = await GetChatBySlugWithMessagesAction(
            selectedCurrentChatSlug
          )

          if (currentChatRes.success) {
            setCurrentChat(currentChatRes.data)
          }
        }
      } catch (error) {
        console.error("Error fetching chats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChatsAndCurrentChat()
  }, [searchParams])

  if (loading) {
    return <div>Loading chats...</div>
  }

  return (
    <Suspense>
      <ChatScreen allChatsSSR={allChats} currentChatSSR={currentChat} />
    </Suspense>
  )
}
