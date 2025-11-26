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
  ChevronDown,
  Edit,
  FileIcon,
  Menu,
  PlusCircle,
  Search,
  Send,
  SmileIcon,
  Trash2
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
import { ChatsList } from "./components/ChatsList"
import {
  AddMessageToChatAction,
  DeleteMessageFromChatAction,
  EditChaMessagetAction,
  GetChatWithMessagesAction,
  incrementUnreadCountForChatAction,
  MarkChatAsReadAction,
  sendFilesAndImagesInChatAction,
  SendTypingIndicatorAction
} from "@/src/server-actions/Chat/Chat"
import moment from "moment-timezone"
import Link from "next/link"
import Loader from "../../common/Loader/Loader"
import { useServerAction } from "@/src/hooks/useServerAction"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { formatFileSize, getUserRole, isOnlyEmoji } from "@/src/utils/helpers"
import CreateNewChat from "./components/CreateNewChat"
import Avvvatars from "avvvatars-react"
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch
} from "../../ui/emoji-picker"
import { spaceStore } from "@/src/store/space/spaceStore"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import pusherClient from "@/src/services/realtime/PusherClient"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../../ui/dropdown-menu"
import { toast } from "@/src/hooks/use-toast"
import EditMessageModal from "./components/EditMessageModal"
import AttachmentModal from "./components/AttachmentModal"
import Image from "next/image"

interface ChatScreenProps {
  currentChatSSR: SelectChat | undefined
  allChatsSSR: SelectChat[]
}

type ChatUpdatePayload = {
  chatId: number
  lastMessage: string
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
  onMessageReceived: (message: SelectMessage) => void,
  onMessageDeleted?: (msgId: number) => void,
  onMessageEdited?: (msgId: number, newContent: string) => void,
  onTyping?: (userId: string, isTyping: boolean, chatId: number) => void
) {
  const channelName = `private-chat-${chatId}`
  const channel = pusherClient.subscribe(channelName)

  channel.bind("new-message", (data: { message: SelectMessage }) => {
    onMessageReceived(data.message)
  })

  channel.bind("message-deleted", (data: { id: number }) => {
    onMessageDeleted?.(data.id)
  })
  channel.bind(
    "message-edited",
    (data: { id: number; new_content: string }) => {
      onMessageEdited?.(data.id, data.new_content)
    }
  )
  channel.bind("typing", (data: { userId: string; isTyping: boolean }) => {
    onTyping?.(data.userId, data.isTyping, chatId)
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
  const [newMessage, setNewMessage] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useAtom(
    chatStore.isMobileMenuOpen
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initialChatLoadRef = useRef<boolean>(true)
  const [currentChat, setCurrentChat] = useAtom(chatStore.currentChat)
  const [switchedChat, setSwitchedChat] = useAtom(chatStore.switchedChat)
  const [myChats, setMyChats] = useAtom(chatStore.myChats)
  const [editingMessage, setEditingMessage] = useState<SelectMessage | null>(
    null
  )
  const [typingUsers, setTypingUsers] = useState<Record<number, Set<string>>>(
    {}
  )
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [fileString, setFileString] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false)
  const authUser = useAtomValue(userStore.AuthUser)
  const [searchQuery, setSearchQuery] = useState<string>("")
  type ChatRealtime = { chatId: number; unsubscribe: () => void }[]
  const [chatRealTime, setChatRealtime] = useState<ChatRealtime>([])

  const [chatContact, setChatContact] = useState<SelectUser | null>(null)
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
  const [
    deletedMessageLoading,
    deletedMessageState,
    deletedMessageError,
    deleteMessageFromChat
  ] = useServerAction(DeleteMessageFromChatAction)

  const [, , , updateChatMsg] = useServerAction(EditChaMessagetAction)
  const [, , , sendTypingIndicator] = useServerAction(SendTypingIndicatorAction)
  const [uploadLoding, , , uploadAttachment] = useServerAction(
    sendFilesAndImagesInChatAction
  )

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
    if (!authUser) return

    chatRealTime?.forEach((ch) => ch.unsubscribe())
    const subscriptions = myChats.map((chat) => {
      const { unsubscribe } = joinChannel(
        chat.id,
        (message) => {
          setMessages((prev) => [...prev, message])
          setMyChats((prevChats) =>
            prevChats.map((c) =>
              c.id === message.chat_id
                ? {
                    ...c,
                    last_message: message.message,
                    last_message_at: message.created_at
                  }
                : c
            )
          )
        },
        (msgId) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? { ...m, is_deleted: 1, message: "This message was deleted" }
                : m
            )
          )
        },
        (msgId, newContent) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId ? { ...m, message: newContent } : m
            )
          )
        },
        (userId: string, isTyping: boolean, chatId: number) => {
          setTypingUsers((prev) => {
            const updated = { ...prev }
            if (!updated[chatId]) updated[chatId] = new Set<string>()
            if (isTyping) updated[chatId].add(userId)
            else updated[chatId].delete(userId)
            return updated
          })
        }
      )
      return { chatId: chat.id, unsubscribe }
    })

    setChatRealtime(subscriptions)

    return () => subscriptions.forEach((s) => s.unsubscribe())
  }, [myChats, authUser])

  useEffect(() => {
    if (!switchedChat) return
    handleChatSwitch(switchedChat.id)
    setSwitchedChat(null)
  }, [switchedChat])

  /**
   * Handles switching to a different chat by fetching the chat data and its messages.
   * ...
   */
  const handleChatSwitch = async (chatId: number) => {
    initialChatLoadRef.current = true
    const newSwitchedChat = await fetchChatWithMessages(chatId)
    if (newSwitchedChat && newSwitchedChat.data) {
      setCurrentChat(newSwitchedChat.data)
      setMessages(newSwitchedChat.data.messages)
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
      const update = data.update as ChatUpdatePayload

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
  }, [authUser, setMyChats, currentChat])

  const handleInputChange = async (val: string) => {
    setNewMessage(val)

    if (!currentChat) return

    await sendTypingIndicator(currentChat.id, true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(async () => {
      await sendTypingIndicator(currentChat.id, false)
      typingTimeoutRef.current = null
    }, 2000)
  }
  const handleSendMessage = async () => {
    if (
      (newMessage.trim() === "" && !fileString) ||
      !currentChat ||
      !authUser
    ) {
      return
    }

    try {
      const messageContent = fileString || newMessage
      const messageType = selectedFile?.type?.startsWith("image/")
        ? "image"
        : selectedFile
          ? "file"
          : "text"

      const newMsg: InsertMessage = {
        sender_id: authUser?.unique_id || "",
        chat_id: currentChat?.id || 0,
        message: messageContent,
        type: messageType
      }

      setNewMessage("")
      setFileString(null)
      setSelectedFile(null)

      await addMessageToChat(newMsg, currentSpace?.id)

      setShowAttachmentModal(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      })
    }
  }

  const handleDelteMsg = async (msg: SelectMessage) => {
    try {
      if (
        authUser?.unique_id === msg.sender_id &&
        currentChat?.id === msg.chat_id
      ) {
        await deleteMessageFromChat(msg.id, currentChat.id, authUser.unique_id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive"
      })
    }
  }

  const handleSaveEditedMessage = async (updatedText: string) => {
    if (!editingMessage || !currentChat || !authUser) return

    try {
      await updateChatMsg(
        editingMessage.id,
        currentChat.id,
        authUser.unique_id,
        updatedText,
        editingMessage.message
      )
      setEditingMessage(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save edited message.",
        variant: "destructive"
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      try {
        const res = await uploadAttachment(file.name, base64, file.type)
        if (res?.success && res.data) {
          setShowAttachmentModal(true)
          const { fileRecord } = res.data
          const fileString = `${fileRecord.file_path},${fileRecord.file_name},${fileRecord.file_size}`
          setFileString(fileString)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong",
          duration: 3000
        })
      }
    }
    reader.readAsDataURL(file)
  }

  const closeAttachmentModal = () => {
    setShowAttachmentModal(false)
    setFileString(null)
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
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
          {/* ChatsList component will now display the properly sorted myChats */}
          {canView && (
            <ChatsList typingUsers={typingUsers} searchQuery={searchQuery} />
          )}
        </CardContent>
      </Card>

      {/* Main chat area */}
      {canView && (
        <Card className="flex-1 flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div className="flex items-center">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
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
                <SheetContent side="left" className="w-[80%] sm:w-[385px] p-0">
                  <CardHeader>
                    <CardTitle>
                      Chats <CreateNewChat />
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search chats..." className="pl-8" />
                    </div>
                  </CardHeader>
                  <ChatsList
                    searchQuery={searchQuery}
                    typingUsers={typingUsers}
                  />
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
                      <Avvvatars value={currentChat.name || ""} style="shape" />
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
                        <>
                          <p className="text-sm font-medium leading-none">
                            {currentChat.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            Group Chat (
                            {currentChat.users
                              ?.map(
                                (user) =>
                                  `${user.user?.first_name} ${user.user?.last_name}`
                              )
                              .join(", ")}
                            )
                          </p>
                        </>
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
                        className={`group mb-4 flex items-center ${
                          message.sender_id === authUser?.unique_id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {isOnlyEmoji(message.message) && !message.is_deleted ? (
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
                          <div
                            className={`rounded-lg pl-2 max-w-[70%] ${
                              message.sender_id === authUser?.unique_id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted pr-2"
                            }`}
                          >
                            {message.sender_id !== authUser?.unique_id &&
                            currentChat.is_group ? (
                              <p className="text-sm font-semibold mb-1 text-left text-muted-foreground">
                                ~ {message.sender?.first_name}
                              </p>
                            ) : null}
                            <div className="text-sm flex items-center justify-center  ">
                              {message.is_deleted ? (
                                <span className="italic">
                                  {message.sender_id === authUser?.unique_id
                                    ? "You deleted this message"
                                    : "This message was deleted"}
                                </span>
                              ) : (
                                <>
                                  {message.type === "image" &&
                                    message.message.split(",").length === 3 &&
                                    (() => {
                                      const [fileUrl, fileName, fileSize] =
                                        message.message.split(",")

                                      return (
                                        <Image
                                          src={fileUrl}
                                          alt="Post image"
                                          className="rounded-lg max-h-96 w-full object-cover bg-gradient-to-r from-accent to-secondary"
                                          width={1000}
                                          height={1000}
                                          style={{ objectFit: "contain" }}
                                        />
                                      )
                                    })()}

                                  {message.type === "file" &&
                                    message.message.split(",").length === 3 &&
                                    (() => {
                                      const [fileUrl, fileName, fileSize] =
                                        message.message.split(",")
                                      return (
                                        <Link href={fileUrl} target="_blank">
                                          <div
                                            className={`flex items-center ${message.sender_id === authUser.unique_id ? "bg-primary text-primary-foreground" : "bg-muted"} space-x-2 p-2 rounded-lg`}
                                          >
                                            <FileIcon className="h-8 w-8" />
                                            <span className="font-medium">
                                              {fileName}
                                            </span>
                                            <span className="text-xs">
                                              {formatFileSize(Number(fileSize))}
                                            </span>
                                          </div>
                                        </Link>
                                      )
                                    })()}

                                  {message.type === "text" && (
                                    <span>{message.message}</span>
                                  )}
                                </>
                              )}
                              {!message.is_deleted &&
                                message.sender_id === authUser?.unique_id && (
                                  <div className="self-start">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="opacity-0  group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 transition-all duration-200"
                                        >
                                          <ChevronDown />
                                        </Button>
                                      </DropdownMenuTrigger>

                                      <DropdownMenuContent
                                        align="end"
                                        className="w-40"
                                      >
                                        {message.type !== "image" &&
                                          message.type !== "file" && (
                                            <DropdownMenuItem
                                              onClick={() =>
                                                setEditingMessage(message)
                                              }
                                            >
                                              <Edit className="mr-2 h-4 w-4" />
                                              Edit
                                            </DropdownMenuItem>
                                          )}

                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleDelteMsg(message)
                                          }
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                        <p className="text-xs ml-2 text-right hidden group-hover:block">
                          {moment
                            .utc(message.created_at)
                            .local()
                            .format("hh:mm A")}
                        </p>
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
              <CardFooter className="p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  onChange={(e) => {
                    e.preventDefault()
                  }}
                  className="flex w-full space-x-2"
                >
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="flex-1"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach file"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                  <Popover>
                    <PopoverTrigger>
                      <SmileIcon />
                    </PopoverTrigger>
                    <PopoverContent side="top" align="end" className="p-0">
                      <EmojiPicker
                        className="h-[342px]"
                        onEmojiSelect={({ emoji }: any) =>
                          setNewMessage(`${newMessage}${emoji}`)
                        }
                      >
                        <EmojiPickerSearch />
                        <EmojiPickerContent />
                        <EmojiPickerFooter />
                      </EmojiPicker>
                    </PopoverContent>
                  </Popover>
                  <Button type="submit" size="icon">
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
      {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          onSave={handleSaveEditedMessage}
          onClose={() => setEditingMessage(null)}
        />
      )}

      <AttachmentModal
        open={showAttachmentModal}
        onClose={closeAttachmentModal}
        file={selectedFile}
        onSend={handleSendMessage}
        sending={newMessageLoading}
        fileString={fileString ?? ""}
      />
    </div>
  )
}
