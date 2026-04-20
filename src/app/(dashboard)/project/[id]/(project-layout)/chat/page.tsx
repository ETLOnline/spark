"use client"
import { ChatScreen } from "@/src/components/Dashboard/Chat"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetChatsAction } from "@/src/server-actions/Chat/Chat"
import { chatStore } from "@/src/store/chat/chatStore"
import { projectStore } from "@/src/store/project/projectStore"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import React, { Suspense, useEffect } from "react"

function Page() {
  const currentSpace = useAtomValue(spaceStore.currentSpace)

  const [myChats, setMyChats] = useAtom(chatStore.myChats)
  const switchChat = useSetAtom(chatStore.switchedChat)

  const [chatlistLoading, chatlist, chatlistError, getChatList] =
    useServerAction(GetChatsAction)

  useEffect(() => {
    if (currentSpace) {
      getChatList(currentSpace?.id).then((res) => {
        if (res && res.success && res.data) {
          setMyChats(res.data)
          if (res.data.length > 0) {
            switchChat(res.data[0])
          }
        }
      })
    }
  }, [currentSpace])

  return (
    <Suspense>
      <ChatScreen allChatsSSR={myChats} currentChatSSR={undefined} />
    </Suspense>
  )
}

export default Page
