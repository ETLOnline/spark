"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet"
import {
  Menu,
  Send,
  Search,
  SmileIcon,
  PencilLine,
  PlusCircle
} from "lucide-react"
import { useAtom, useAtomValue } from "jotai"
import { chatStore } from "@/src/store/chat/chatStore"
import {
  InsertMessage,
  SelectChat,
  SelectMessage,
  SelectUser,
  SelectUserChat
} from "@/src/db/schema"
import { userStore } from "@/src/store/user/userStore"
import ChatsList from "./components/ChatsList"
import {
  AddMessageToChatAction,
  GetChatWithMessagesAction,
  incrementUnreadCountForChatAction,
  MarkChatAsReadAction
} from "@/src/server-actions/Chat/Chat"
import moment from "moment-timezone"
import Link from "next/link"
import Loader from "../../common/Loader/Loader"
import { useServerAction } from "@/src/hooks/useServerAction"
import { getUserRole, isOnlyEmoji } from "@/src/utils/helpers"
import CreateNewChat from "./components/CreateNewChat"
import Avvvatars from "avvvatars-react"
import { spaceStore } from "@/src/store/space/spaceStore"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import pusherClient from "@/src/services/realtime/PusherClient"
import RichTextEditor from "@/src/components/common/TiptapRichEditor"
import { MessageContent } from "./components/MessageContent"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch
} from "../../ui/emoji-picker"
import "@/src/components/common/RichEditorFormat.css"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "../../ui/dialog"

interface ChatScreenProps {
  currentChatSSR: SelectChat | undefined
  allChatsSSR: SelectChat[]
}

type ChatUpdatePayload = {
  chatId: number
  lastMessage: string
  wasMentioned?: boolean
  sender_id: string
}

/**
 * Joins a specified channel for a chat.
 *
 * @param {number} chatId - The ID of the chat to join.
 * @param {(message: SelectMessage) => void} onMessageReceived - Callback function to handle received messages.
 * @returns {{ unsubscribe: () => void }} An object containing a function to unsubscribe.
 */
function joinChannel(
  chatId: number,
  onMessageReceived: (message: SelectMessage) => void
) {
  const channelName = `private-chat-${chatId}`
  const channel = pusherClient.subscribe(channelName)

  channel.bind("new-message", (data: { message: SelectMessage }) => {
    onMessageReceived(data.message)
  })

  function unsubscribe() {
    channel.unbind_all()
    pusherClient.unsubscribe(channelName)
  }

  return { unsubscribe }
}

/**
 * ChatScreen component renders the chat interface including the list of chats and the main chat area.
 */
export function ChatScreen({ currentChatSSR, allChatsSSR }: ChatScreenProps) {
  const currentSpace = useAtomValue(spaceStore.currentSpace)
  const { permissionChecker } = usePermissionChecker(
    currentSpace ? "scoped" : "global",
    "SPACE",
    currentSpace?.id
  )
  const permissionNamespaceCreate = currentSpace
    ? "space.chat.create"
    : "chat.create"
  const permissionNamespaceView = currentSpace ? "space.chat.view" : "chat.view"

  const [, , , markAsRead] = useServerAction(MarkChatAsReadAction)
  const [, , , incrementUnreadCount] = useServerAction(
    incrementUnreadCountForChatAction
  )

  const canCreate = permissionChecker
    ? permissionChecker?.canAccess(permissionNamespaceCreate)
    : false
  const canView = permissionChecker
    ? permissionChecker?.canAccess(permissionNamespaceView)
    : false

  const [messages, setMessages] = useState<SelectMessage[]>([])
  const [richMessageContent, setRichMessageContent] = useState("")
  const [showRichEditorToolbar, setShowRichEditorToolbar] = useState(false)
  const [isMentionActive, setIsMentionActive] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useAtom(
    chatStore.isMobileMenuOpen
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initialChatLoadRef = useRef<boolean>(true)
  const [currentChat, setCurrentChat] = useAtom(chatStore.currentChat)
  const [switchedChat, setSwitchedChat] = useAtom(chatStore.switchedChat)
  const [myChats, setMyChats] = useAtom(chatStore.myChats)
  const authUser = useAtomValue(userStore.AuthUser)
  const [chatRealTime, setChatRealtime] = useState<{
    unsubscribe: () => void
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [chatContact, setChatContact] = useState<SelectUser | null>(null)
  const [availableUsers, setAvailableUsers] = useState<SelectUser[]>([])
  const [
    fetchingChatMessages,
    switchedChatState,
    switchedChatError,
    fetchChatWithMessages
  ] = useServerAction(GetChatWithMessagesAction)
  const [
    newMessageLoading,
    newMessageState,
    newMessageError,
    addMessageToChat
  ] = useServerAction(AddMessageToChatAction)

  useEffect(() => {
    setCurrentChat(currentChatSSR || null)
    setMyChats(allChatsSSR || [])
    initialChatLoadRef.current = true
    const initialMessages = currentChatSSR?.messages || []

    setMessages(initialMessages)
    scrollToBottom()
    return () => {
      setCurrentChat(null)
      setMyChats([])
      setMessages([])
    }
  }, [])
  const scrollToBottom = useCallback(() => {
    const behavior: ScrollBehavior = initialChatLoadRef.current
      ? "auto"
      : "smooth"
    messagesEndRef.current?.scrollIntoView({ behavior })
    initialChatLoadRef.current = false
  }, [])

  useEffect(() => {
    if (!currentChat) {
      setAvailableUsers([])
      return
    }

    if (currentChat.is_group === 1) {
      const chatUsers = currentChat.users
        ?.map((u) => u.user)
        .filter((user): user is SelectUser => Boolean(user))
        .filter(
          (user) => user.unique_id !== authUser?.unique_id
        ) as SelectUser[]

      if (chatUsers && chatUsers.length > 0) {
        setAvailableUsers(chatUsers)
      } else {
        setAvailableUsers([])
      }
    } else {
      setAvailableUsers([])
    }
  }, [currentChat])

  useEffect(() => {
    if (!currentChat || !authUser) return
    chatRealTime?.unsubscribe()

    const { unsubscribe } = joinChannel(currentChat.id, (message) => {
      setMessages((prev) => [...prev, message])

      setMyChats((prevChats) => {
        const updatedChats = prevChats.map((chat) => {
          if (chat.id === message.chat_id) {
            return {
              ...chat,
              last_message: message.message,
              last_message_at: message.created_at,
              unread_count: 0
            }
          }
          return chat
        })
        return updatedChats
      })
    })

    setChatRealtime({ unsubscribe })

    if (!currentChat.is_group) {
      const chatContact = currentChat.users?.find(
        (user) => user.user_id !== authUser?.unique_id
      )?.user
      setChatContact(chatContact || null)
    }

    const channelName = `presence-chat-${currentChat.id}`
    const presenceChannel = pusherClient.subscribe(channelName)

    return () => {
      unsubscribe()
      presenceChannel.unsubscribe()
    }
  }, [currentChat?.id, authUser])

  useEffect(() => {
    if (!switchedChat) return
    handleChatSwitch(switchedChat.id)
    setSwitchedChat(null)
  }, [switchedChat])

  const handleChatSwitch = async (chatId: number) => {
    initialChatLoadRef.current = true

    setAvailableUsers([])
    setRichMessageContent("")
    setShowRichEditorToolbar(false)

    const newSwitchedChat = await fetchChatWithMessages(chatId)
    if (newSwitchedChat && newSwitchedChat.data) {
      const transformedMessages = (newSwitchedChat.data.messages?.map(
        (msg) => ({
          ...msg,
          mentions: msg.mentions ?? undefined
        })
      ) || []) as SelectMessage[]
      const transformedChat = {
        ...newSwitchedChat.data,
        messages: transformedMessages
      } as SelectChat
      setCurrentChat(transformedChat)
      setMessages(transformedMessages)
    }

    await markAsRead(chatId)

    setMyChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          const updatedUsers = chat.users?.map((uc) => {
            if (uc.user_id === authUser?.unique_id) {
              return { ...uc, unread_count: 0 } as SelectUserChat
            }
            return uc
          })
          return { ...chat, users: updatedUsers }
        }
        return chat
      })
    )
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, authUser])

  useEffect(() => {
    if (!authUser) return

    const userChannelName = `private-user-${authUser.unique_id}`
    const userChannel = pusherClient.subscribe(userChannelName)

    userChannel.bind("chat-update", (data: { update: ChatUpdatePayload }) => {
      const update = data.update

      setMyChats((prevChats) => {
        const updatedChat = prevChats.find((chat) => chat.id === update.chatId)

        if (updatedChat && update.lastMessage) {
          const newChats = prevChats.map((chat) => {
            if (chat.id === update.chatId) {
              const isActiveChat = currentChat?.id === update.chatId
              const updatedUsers = chat.users?.map((uc) => {
                if (uc.user_id === authUser.unique_id) {
                  if (
                    !isActiveChat &&
                    authUser.unique_id !== update.sender_id
                  ) {
                    incrementUnreadCount(update.chatId, uc.user_id)
                  }
                  return {
                    ...uc,
                    unread_count: isActiveChat
                      ? uc.unread_count || 0
                      : (uc.unread_count || 0) + 1
                  } as SelectUserChat
                }
                return uc
              })
              return {
                ...chat,
                last_message: update.lastMessage,
                updated_at: new Date().toISOString(),
                users: updatedUsers
              }
            }
            return chat
          })
          return newChats
        }
        return prevChats
      })
    })

    userChannel.bind(
      "chat-created",
      (data: { newChat: SelectChat; initiatorId: string; spaceId: string }) => {
        const { newChat, initiatorId, spaceId } = data
        if (initiatorId === authUser?.unique_id) {
          return
        }
        const currentSpaceId = currentSpace?.id

        if (currentSpaceId === spaceId) {
          setMyChats((prevChats) => [newChat, ...prevChats])
          setSwitchedChat(newChat)
        }
      }
    )

    return () => {
      userChannel.unbind_all()
      pusherClient.unsubscribe(userChannelName)
    }
  }, [authUser, setMyChats, currentChat, currentSpace])

  const handleSendMessage = async () => {
    if (richMessageContent.trim() === "" || !currentChat || !authUser) return

    const contentToSend = richMessageContent
      .replace(
        /<span[^>]*data-type="mention"[^>]*data-id="([^"]*)"[^>]*data-label="([^"]*)"[^>]*>@[^<]*<\/span>/g,
        "@[ $2 ]($1)"
      )
      .replace(/<p[^>]*>/g, "")
      .replace(/<\/p>/g, "\n")
      .replace(/<br\s*\/?>/g, "\n")
      .trim()

    const messageToUpdateChatList = richMessageContent.includes("<p>")
      ? "Rich text message"
      : contentToSend

    if (contentToSend === "") return

    const newMsg: InsertMessage = {
      sender_id: authUser?.unique_id || "",
      chat_id: currentChat?.id || 0,
      message: contentToSend,
      type: "text"
    }

    setMyChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChat.id
          ? {
              ...chat,
              last_message: messageToUpdateChatList,
              last_message_at: moment().toISOString(),
              updated_at: moment().toISOString(),
              unread_count: 0
            }
          : chat
      )
    )

    setRichMessageContent("")

    await addMessageToChat(newMsg, currentSpace?.id)
  }

  const currentMessageContent = richMessageContent

  const handleEmojiSelect = (emoji: string) => {
    setRichMessageContent((prev) => `${prev}${emoji}`)
  }

  return (
    <>
      <div className="flex h-[calc(100vh-7rem)] gap-4">
        {/* Contacts list - visible on desktop, hidden on mobile */}
        <Card className="w-80 flex-shrink-0 border-r hidden md:flex md:flex-col h-full">
          <CardHeader className="px-3">
            <CardTitle className="flex items-center justify-between">
              Chats
              {canCreate && <CreateNewChat />}
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {canView && <ChatsList searchQuery={searchQuery} />}
          </CardContent>
        </Card>

        {/* Main chat area */}
        {canView && (
          <Card className="flex-1 flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center">
                <Sheet
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden mr-2"
                    >
                      <Menu />
                      <span className="sr-only">Toggle contacts</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[80%] sm:w-[385px] p-0"
                  >
                    <CardHeader>
                      <CardTitle>
                        Chats <CreateNewChat />
                      </CardTitle>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search chats..." className="pl-8" />
                      </div>
                    </CardHeader>
                    <ChatsList searchQuery={searchQuery} />
                  </SheetContent>
                </Sheet>
                {currentChat ? (
                  <Link
                    href={
                      currentChat.is_group
                        ? "#"
                        : `/profile/${chatContact?.unique_id}`
                    }
                  >
                    <div className="flex ">
                      {currentChat.is_group ? (
                        <Avvvatars
                          value={currentChat.name || ""}
                          style="shape"
                        />
                      ) : (
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={
                              currentChat && !currentChat.is_group
                                ? chatContact?.profile_url || undefined
                                : undefined
                            }
                            alt={currentChat.name || ""}
                          />
                          <AvatarFallback>
                            {currentChat && !currentChat.is_group
                              ? chatContact?.first_name[0]
                              : currentChat.name}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="ml-4 space-y-1">
                        {!currentChat?.is_group && chatContact ? (
                          <>
                            <p className="text-sm font-medium leading-none">{`${chatContact?.first_name} ${chatContact?.last_name}`}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {getUserRole(chatContact, currentSpace?.id)}
                            </p>
                          </>
                        ) : null}

                        {currentChat?.is_group ? (
                          <div onClick={() => setIsDialogOpen(true)}>
                            <p className="text-sm font-medium leading-none">
                              {currentChat.name}
                            </p>
                            <p className="text-sm text-muted-foreground truncate whitespace-normal line-clamp-1">
                              Group Chat (
                              {currentChat.users
                                ?.map(
                                  (user) =>
                                    `${user.user?.first_name} ${user.user?.last_name}`
                                )
                                .join(", ")}
                              )
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ) : null}
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
            {currentChat ? (
              <>
                <CardContent className="flex-1 min-h-0 p-4 flex flex-col">
                  {authUser && currentChat && !fetchingChatMessages ? (
                    <ScrollArea className="flex-1 pr-4 mt-2">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`mb-4 flex items-start ${
                            message.sender_id === authUser?.unique_id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {isOnlyEmoji(message.message) ? (
                            <div className="">
                              {message.sender_id !== authUser?.unique_id &&
                              currentChat.is_group ? (
                                <p className="text-sm font-semibold mb-1 text-left text-muted-foreground">
                                  ~ {message.sender?.first_name}
                                </p>
                              ) : null}
                              <p className="text-4xl">{message.message}</p>
                            </div>
                          ) : (
                            <div className=" group flex items-center">
                              <div
                                className={`rounded-lg p-3  rich-editor ${
                                  message.sender_id === authUser?.unique_id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                {message.sender_id !== authUser?.unique_id &&
                                currentChat.is_group ? (
                                  <p className="text-sm font-semibold mb-1 text-left text-muted-foreground">
                                    ~ {message.sender?.first_name}
                                  </p>
                                ) : null}
                                <MessageContent content={message.message} />
                              </div>
                              <div className="text-xs ml-2 mt-2 text-right hidden group-hover:block">
                                <p>
                                  {moment
                                    .utc(message.created_at)
                                    .local()
                                    .format("hh:mm A")}
                                </p>
                                <p>
                                  {moment
                                    .utc(message.created_at)
                                    .local()
                                    .fromNow()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </ScrollArea>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Loader />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 relative">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage()
                    }}
                    className="flex w-full space-x-2 items-end"
                  >
                    <div className="flex-1" key={currentChat?.id || "no-chat"}>
                      <RichTextEditor
                        value={richMessageContent}
                        onChange={setRichMessageContent}
                        image_uploading={true}
                        entity="chats"
                        showMentions={
                          currentChat?.is_group === 1 &&
                          availableUsers.length > 0
                        }
                        mentionUsers={availableUsers}
                        showToolbar={showRichEditorToolbar}
                        minHeight={`${showRichEditorToolbar ? "100px" : "30px"}`}
                        limit={5000}
                        editable={!newMessageLoading}
                        onEnterPress={handleSendMessage}
                        onMentionStateChange={setIsMentionActive}
                        showFooter={false}
                        isScrollAble={true}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title={
                        showRichEditorToolbar
                          ? "Hide Formatting Menu (Enter sends)"
                          : "Show Formatting Menu (Enter adds line)"
                      }
                      onClick={() => {
                        setShowRichEditorToolbar((prev) => !prev)
                      }}
                      className={`p-1 ${
                        showRichEditorToolbar
                          ? "bg-secondary"
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      <PencilLine className="h-5 w-5" />
                      <span className="sr-only">Toggle Formatting Menu</span>
                    </Button>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Insert Emoji"
                          className="p-1"
                        >
                          <SmileIcon className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="top" align="end" className="p-0">
                        <EmojiPicker
                          className="h-[342px]"
                          onEmojiSelect={({ emoji }: any) =>
                            handleEmojiSelect(emoji)
                          }
                        >
                          <EmojiPickerSearch />
                          <EmojiPickerContent />
                          <EmojiPickerFooter />
                        </EmojiPicker>
                      </PopoverContent>
                    </Popover>

                    <Button
                      type="submit"
                      size="icon"
                      disabled={
                        newMessageLoading || currentMessageContent.trim() === ""
                      }
                    >
                      {newMessageLoading ? (
                        <Loader />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </CardFooter>
              </>
            ) : null}
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Group Members</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[80vh]">
            {currentChat?.users?.map((member) => (
              <Link
                href={`/profile/${member.user_id}`}
                key={member.user_id}
                className="flex flex-row items-center gap-2 mb-2 p-2 hover:bg-muted/55 hover:cursor-pointer rounded-md"
              >
                <Avatar>
                  <AvatarImage
                    src={member.user?.profile_url || undefined}
                    alt={member.user?.first_name}
                  />
                  <AvatarFallback>{member.user?.first_name}</AvatarFallback>
                </Avatar>
                <div>
                  <p>
                    {member.user?.first_name} {member.user?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.user
                      ? getUserRole(member.user, currentSpace?.id)
                      : ""}
                  </p>
                </div>
              </Link>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
