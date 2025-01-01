"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet"
import { Menu, Search, Send, Phone, Video, MoreVertical, SmileIcon } from 'lucide-react'
import { Badge } from "@/src/components/ui/badge"
import { getDefaultStore, useAtom, useAtomValue } from "jotai"
import { chatStore } from "@/src/store/chat/chatStore"
import { InsertMessage, SelectChat, SelectMessage, SelectUser, SelectUserChat } from "@/src/db/schema"
import { userStore } from "@/src/store/user/userStore"
import { AblyClient } from "@/src/services/realtime/AblyClient"
import ChatsList from "./ChatsList"
import ChatChannelHash from "./helper"
import { AddMessageToChatAction, GetChatWithMessagesAction } from "@/src/server-actions/Chat/Chat"
import moment from 'moment-timezone'
import Link from "next/link"
import Loader from "../../common/Loader/Loader"
import { useServerAction } from "@/src/hooks/useServerAction"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"


interface ChatScreenProps {
  currentChatSSR: SelectChat | undefined
  allChatsSSR: SelectChat[]
}

// Function to join a channel (for group or one-to-one chat)
/**
 * Joins a specified channel and sets up message subscription and sending functionality.
 *
 * @param {string} channelName - The name of the channel to join.
 * @param {(message: SelectMessage) => void} onMessageReceived - Callback function to handle received messages.
 * @returns {{ sendMessage: (content: any) => void }} An object containing a function to send messages to the channel.
 */
function joinChannel(channelName : string, onMessageReceived: (message: SelectMessage) => void) {
  const channel = AblyClient.channels.get(channelName);

  // Subscribe to messages
  channel.subscribe((message) => {
    onMessageReceived(message.data);
  });

  // Send a message
  function sendMessage(content:any) {
    channel.publish('message', content);
  }

  function unsubscribe(){
    channel.unsubscribe();
    channel.detach()
  }

  return { sendMessage , unsubscribe };
}

/**
 * ChatScreen component renders the chat interface including the list of chats and the main chat area.
 * It handles the display of messages, sending new messages, and switching between different chats.
 *
 * @param {ChatScreenProps} props - The properties for the ChatScreen component.
 * @param {Chat} props.currentChatSSR - The current chat data fetched from the server-side rendering.
 * @param {Chat[]} props.allChatsSSR - The list of all chats fetched from the server-side rendering.
 *
 * @returns {JSX.Element} The rendered ChatScreen component.
 *
 * @component
 *
 * @example
 * // Example usage of ChatScreen component
 * <ChatScreen currentChatSSR={currentChatData} allChatsSSR={allChatsData} />
 *
 * @remarks
 * This component uses several hooks and atoms for state management and side effects:
 * - `useState` for managing local state such as messages, newMessage, isMobileMenuOpen, chat, and chatContact.
 * - `useRef` for referencing the end of the messages list to scroll into view.
 * - `useAtom` and `useAtomValue` from Jotai for managing global state related to the current chat, switched chat, and authenticated user.
 * - `useEffect` for handling side effects such as setting initial state, joining chat channels, and handling chat switches.
 * - `useCallback` for memoizing the scrollToBottom function.
 *
 * The component also includes several nested components and elements for rendering the chat interface:
 * - `Card`, `CardHeader`, `CardContent`, `CardFooter` for structuring the chat interface.
 * - `Sheet`, `SheetTrigger`, `SheetContent` for handling the mobile menu.
 * - `Link` for navigating to the chat contact's profile.
 * - `Avatar`, `AvatarImage`, `AvatarFallback` for displaying the chat contact's avatar.
 * - `ScrollArea` for displaying the list of messages with a scrollable area.
 * - `Loader` for displaying a loading indicator while fetching chat messages.
 * - `Input` and `Button` for handling the input and sending of new messages.
 */
export function ChatScreen({ currentChatSSR, allChatsSSR }: ChatScreenProps) {

  const [messages, setMessages] = useState<SelectMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentChat, setCurrentChat] = useAtom(chatStore.currentChat)
  const [switchedChat, setSwitchedChat] = useAtom(chatStore.switchedChat)
  const [myChats, setMyChats] = useAtom(chatStore.myChats)
  const authUser = useAtomValue(userStore.AuthUser)
  const [chatRealTime, setChatRealtime] = useState<any>(null);
  const [chatContact , setChatContact] = useState<SelectUser | null>(null);
  const [fetchingChatMessages , switchedChatState , switchedChatError, fetchChatWithMessages] = useServerAction(GetChatWithMessagesAction)

  useEffect(()=>{
    setCurrentChat(currentChatSSR || null)
    setMyChats(allChatsSSR || [])
    setMessages(currentChatSSR?.messages || [])
    scrollToBottom()
  },[])


  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  useEffect(() => {
    if (!currentChat || !authUser) return
    // Join a channel (e.g., "general" or "user1-user2" for one-to-one chat)
    // const channelId = ChatChannelHash(currentChat.channel_id)
    const { sendMessage, unsubscribe } = joinChannel(currentChat.channel_id, (message) => {
      setMessages((prev) => [...prev, message])
    });

    setChatRealtime({ sendMessage, unsubscribe });

    if(!currentChat.is_group){
      const chatContact = currentChat.users?.find(user => user.user_id !== authUser?.unique_id)?.user
      setChatContact(chatContact || null) 
    }

    // return () => {
    //   unsubscribe();
    // }

  }, [currentChat?.channel_id, authUser]);

  useEffect(()=>{
    if(!switchedChat) return
    chatRealTime?.unsubscribe()
    setChatRealtime(null)
    handleChatSwitch(switchedChat.id)
    setSwitchedChat(null)
    
  },[switchedChat])

  /**
   * Handles switching to a different chat by fetching the chat data and its messages.
   * 
   * @param {number} chatId - The ID of the chat to switch to.
   * @returns {Promise<void>} A promise that resolves when the chat has been switched.
   */
  const handleChatSwitch = async(chatId: number) => {
    const newSwitchedChat = await fetchChatWithMessages(chatId)
    if(newSwitchedChat && newSwitchedChat.data){
      setCurrentChat(newSwitchedChat.data)
      setMessages(newSwitchedChat.data.messages)
    }
  }


  useEffect(() => {
    scrollToBottom()
  }, [messages, authUser])

  /**
   * Handles the sending of a new message in the chat.
   * 
   * This function checks if the new message is not empty, creates a new message object,
   * clears the input field, and then calls the action to add the message to the chat.
   * 
   * @async
   * @function handleSendMessage
   * @returns {Promise<void>} A promise that resolves when the message has been added to the chat.
   */
  const handleSendMessage = async() => {
    if (newMessage.trim() === "") return
    const newMsg: InsertMessage = {
      sender_id: authUser?.unique_id || '',
      chat_id: currentChat?.id || 0,
      message: newMessage,
      type: "text"
    }
    setNewMessage("")
    await AddMessageToChatAction(newMsg)
  }

  return (
    <div className="flex h-full gap-4">
      {/* Contacts list - visible on desktop, hidden on mobile */}
      <Card className="w-80 flex-shrink-0 border-r hidden md:flex md:flex-col">
        <CardHeader>
          <CardTitle>Chats</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ChatsList setIsMobileMenuOpen={setIsMobileMenuOpen} />
        </CardContent>
      </Card>

      {/* Main chat area */}
      
        <Card className="flex-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div className="flex items-center">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden mr-2">
                    <Menu />
                    <span className="sr-only">Toggle contacts</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[80%] sm:w-[385px] p-0">
                  <CardHeader>
                    <CardTitle>Chats</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search chats..." className="pl-8" />
                    </div>
                  </CardHeader>
                  <ChatsList setIsMobileMenuOpen={setIsMobileMenuOpen} />
                </SheetContent>
              </Sheet>
              {
                currentChat ? (
                  <Link href={currentChat.is_group ? '#' : `/profile/${chatContact?.unique_id}`}>
                    <div className="flex ">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={currentChat && !currentChat.is_group ? chatContact?.profile_url || undefined : undefined} alt={currentChat.name || ''} />
                        <AvatarFallback>{currentChat && !currentChat.is_group ? chatContact?.first_name[0] : currentChat.name}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        {
                          !currentChat?.is_group && chatContact ? (
                            <>
                              <p className="text-sm font-medium leading-none">{`${chatContact?.first_name} ${chatContact?.last_name}`}</p>
                              <p className="text-sm text-muted-foreground">
                                {currentChat.is_group ? "Group Chat" : chatContact?.email}
                              </p>
                            </>

                          ): null
                        }

                        {
                          currentChat?.is_group ? (
                            <p className="text-sm font-medium leading-none">{currentChat.name}</p>
                          ): null
                        }
                      
                      </div>
                    </div>
                  </Link>
                ): null
              }
            </div>
            
            {/* calling options for future */}

            {/* <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
                <span className="sr-only">Start voice call</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-4 w-4" />
                <span className="sr-only">Start video call</span>
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </div> */}

          </CardHeader>
          {
            currentChat ? ( 
              <>
                <CardContent className="flex-1 overflow-hidden p-4">
                  {
                    authUser && currentChat && !fetchingChatMessages ? (
                      <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`mb-4 flex ${
                              message.sender_id === authUser?.unique_id ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`rounded-lg p-3 max-w-[70%] ${
                                message.sender_id === authUser?.unique_id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {moment.utc(message.created_at).local().format('hh:mm A')}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </ScrollArea>
                    ): <div className="flex h-full items-center justify-center"><Loader/></div>
                  }
                </CardContent>
                <CardFooter className="p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage()
                    }}
                    onChange={(e)=>{
                      e.preventDefault()
                    }}
                    className="flex w-full space-x-2"
                  >
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                      // type="text"
                    />
                    <Popover>
                      <PopoverTrigger>
                        <SmileIcon/>
                      </PopoverTrigger>
                      <PopoverContent side="top" align="end" className="p-0">
                        <Picker data={data} onEmojiSelect={(emoji:any) => setNewMessage(`${newMessage}${emoji.native}`)} />
                      </PopoverContent>
                    </Popover>
                    <Button type="submit" size="icon">
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send message</span>
                    </Button>
                  </form>
                </CardFooter>
              </>
            ): null
          }
        </Card>
      
    </div>
  )
}

