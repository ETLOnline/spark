"use client"

import { ChatScreen } from "@/src/components/Dashboard/Chat"
import { SelectChat } from "@/src/db/schema"
import {
  GetChatBySlugWithMessagesAction,
  GetChatsAction
} from "@/src/server-actions/Chat/Chat"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import Loader from "@/src/components/common/Loader/Loader"

export default function ChatPage() {
  const searchParams = useSearchParams()
  const [currentChat, setCurrentChat] = useState<SelectChat | undefined>(
    undefined
  )
  const [allChats, setAllChats] = useState<SelectChat[]>([])
  const [loading, setLoading] = useState(true)

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
    return (
      <div className="flex justify-center h-full w-full">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  }

  return (
    <Suspense>
      <ChatScreen allChatsSSR={allChats} currentChatSSR={currentChat} />
    </Suspense>
  )
}
