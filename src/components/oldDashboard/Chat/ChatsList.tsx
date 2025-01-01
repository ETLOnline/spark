import { ScrollArea } from '@radix-ui/react-scroll-area'
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Badge } from '../../ui/badge'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { chatStore } from '@/src/store/chat/chatStore'
import { userStore } from '@/src/store/user/userStore'
import { SelectChat, SelectUser } from '@/src/db/schema'
import Loader from '../../common/Loader/Loader'

interface ChatsListProps {
	setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
}



const ChatsList = ({ setIsMobileMenuOpen }: ChatsListProps) => {

	const [currentChat, setCurrentChat] = useAtom(chatStore.currentChat)
	const setSwtichedChat = useSetAtom(chatStore.switchedChat)
  const [myChats, setMyChats] = useAtom(chatStore.myChats)
  const authUser = useAtomValue(userStore.AuthUser)

	const ChatItem = React.useMemo( () => ({chat}: {chat: SelectChat}) => {
		const filteredContact = chat?.users?.find((user) => user.user_id !== authUser?.unique_id)
		if(!filteredContact) return null
		const chatContact = filteredContact?.user || null
		if(!chatContact) return null

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
				<Avatar className="h-10 w-10 relative bg-white" >
					{
						!chat?.is_group && chatContact ? (
							<>
								{chatContact?.profile_url ? (<AvatarImage src={chatContact.profile_url} />): null }
								<AvatarFallback>{chatContact.first_name.charAt(0)}</AvatarFallback>
							</>
						): null
					}
					{/* {chat.online && (
						<span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
					)} */}
				</Avatar>
				<div className="flex-1">
					<p className="font-medium">{chat.is_group ? chat.name :`${chatContact?.first_name} ${chatContact?.last_name}`}</p>
					<p className="text-sm text-muted-foreground truncate">{chat?.last_message}</p>
				</div>
				{(chat?.unread_count || 0)  > 0 && (
					<Badge variant="secondary" className="rounded-full px-2 py-1">
						{chat?.unread_count}
					</Badge>
				)}
			</div>
		)
	}, [authUser, currentChat, setCurrentChat, setIsMobileMenuOpen])


  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
			{
				authUser ? (
					<>
						{myChats.map((chat) => (
							<ChatItem key={chat.id} chat={chat} />
						))}
					</>
				): <div className='flex items-center justify-center'><Loader /></div>
			}
    </ScrollArea>
  )
}

export default ChatsList