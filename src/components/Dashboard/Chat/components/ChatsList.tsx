import { ScrollArea } from '@radix-ui/react-scroll-area'
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../../../ui/avatar'
import { Badge } from '../../../ui/badge'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { chatStore } from '@/src/store/chat/chatStore'
import { userStore } from '@/src/store/user/userStore'
import { SelectChat, SelectUser } from '@/src/db/schema'
import Loader from '../../../common/Loader/Loader'
import ChatContactItem from './ChatContactItem'

interface ChatsListProps {
}



const ChatsList = ({ }: ChatsListProps) => {
  const [myChats, setMyChats] = useAtom(chatStore.myChats)
  const authUser = useAtomValue(userStore.AuthUser)

  return (
    <ScrollArea className="h-[calc(100vh-20rem)] px-2">
      {
        authUser ? (
          <>
            {myChats.map((chat) => (
              <ChatContactItem key={chat.id} chat={chat} />
            ))}
          </>
        ) : <div className='flex items-center justify-center'><Loader /></div>
      }
    </ScrollArea>
  )
}

export default ChatsList