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
  ChevronDown,
  Edit,
  FileIcon,
  Paperclip,
  Trash2,
  X,
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
import { formatFileSize, getUserRole, isOnlyEmoji } from "@/src/utils/helpers"
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
import { toast } from "@/src/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../../ui/dropdown-menu"
import { FileUpload } from "../../ui/file-upload"
import Image from "next/image"
import { useOnlineStatus } from "../../providers/OnlineStatusProvider"
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
  const authUser = useAtomValue(userStore.AuthUser)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [chatContact, setChatContact] = useState<SelectUser | null>(null)
  const [availableUsers, setAvailableUsers] = useState<SelectUser[]>([])
  const [openAttachment, setOpenAttachment] = useState<boolean>(false)
  type ChatRealtime = { chatId: number; unsubscribe: () => void }[]

  const [chatRealTime, setChatRealtime] = useState<ChatRealtime>([])
  const { getOnlineUsers } = useOnlineStatus()

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
    if (!authUser || !myChats.length) return

    // Unsubscribe old channels
    chatRealTime?.forEach((c) => c.unsubscribe())

    const subscriptions = myChats.map((chat) => {
      const { unsubscribe } = joinChannel(
        chat.id,

        // NEW MESSAGE
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

        // DELETE
        (msgId) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? { ...m, is_deleted: 1, message: "This message was deleted" }
                : m
            )
          )
        },

        // EDIT
        (msgId, newContent) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId ? { ...m, message: newContent } : m
            )
          )
        },

        // TYPING
        (userId, isTyping, chatId) => {
          setTypingUsers((prev) => {
            const updated = { ...prev }
            if (!updated[chatId]) updated[chatId] = new Set()
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
    try {
      if (!currentChat || !authUser) return

      let type: "text" | "image" | "file" = "text"
      let messageToSend = ""

      if (fileString) {
        const [file_path, file_name, file_size, file_type] =
          fileString.split(",")

        if (file_type.startsWith("image/")) type = "image"
        else type = "file"

        messageToSend = fileString
      } else {
        const contentToSend = richMessageContent
          .replace(
            /<span[^>]*data-type="mention"[^>]*data-id="([^"]*)"[^>]*data-label="([^"]*)"[^>]*>@[^<]*<\/span>/g,
            "@[ $2 ]($1)"
          )
          .replace(/<p[^>]*>/g, "")
          .replace(/<\/p>/g, "\n")
          .replace(/<br\s*\/?>/g, "\n")
          .trim()

        if (contentToSend === "") return

        messageToSend = contentToSend
      }

      if (editingMessage) {
        await updateChatMsg(
          editingMessage.id,
          currentChat.id,
          authUser.unique_id,
          messageToSend,
          editingMessage.message
        )

        setEditingMessage(null)
      } else {
        const newMsg: InsertMessage = {
          sender_id: authUser.unique_id,
          chat_id: currentChat.id,
          message: messageToSend,
          type
        }

        await addMessageToChat(newMsg, currentSpace?.id)
      }

      setRichMessageContent("")
      setFileString("")
      setOpenAttachment(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message",
        duration: 3000
      })
    }
  }

  const currentMessageContent = richMessageContent

  const handleEmojiSelect = (emoji: string) => {
    setRichMessageContent((prev) => `${prev}${emoji}`)
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
  const handleFileUpload = (files: File[]) => {
    const file = files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      try {
        const res = await uploadAttachment(file.name, base64, file.type)
        if (res?.success && res.data) {
          const { fileRecord } = res.data
          setRichMessageContent(fileRecord.file_name)
          const fileString = `${fileRecord.file_path},${fileRecord.file_name},${fileRecord.file_size},${fileRecord.file_type}`
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

  const handleTyping = async () => {
    if (!currentChat || !authUser) return

    await sendTypingIndicator(currentChat.id, true)

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    typingTimeoutRef.current = setTimeout(async () => {
      await sendTypingIndicator(currentChat.id, false)
      typingTimeoutRef.current = null
    }, 1000)
  }

  const users = getOnlineUsers()

  const isContactOnline = (() => {
    const chat = myChats.find((c) => c.id === currentChat?.id)
    if (!chat) return false

    const otherUser = chat.users?.find(
      (user) => user.user_id !== authUser?.unique_id
    )

    return otherUser ? users.has(otherUser.user_id) : false
  })()

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
                    <ChatsList
                      typingUsers={typingUsers}
                      searchQuery={searchQuery}
                    />
                  </SheetContent>
                </Sheet>
                {currentChat
                  ? (() => {
                      const otherUser = !currentChat.is_group
                        ? currentChat.users?.find(
                            (u) => u.user?.unique_id !== authUser?.unique_id
                          )?.user
                        : null

                      return (
                        <Link
                          href={
                            currentChat.is_group
                              ? "#"
                              : `/profile/${otherUser?.unique_id}`
                          }
                        >
                          <div className="flex">
                            {/* AVATAR */}
                            {currentChat.is_group ? (
                              <Avvvatars
                                value={currentChat.name || "Group"}
                                style="shape"
                              />
                            ) : (
                              <div className="relative h-9 w-9">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage
                                    src={otherUser?.profile_url || undefined}
                                  />
                                  <AvatarFallback>
                                    {otherUser?.first_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>

                                {isContactOnline && (
                                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                              </div>
                            )}

                            <div className="ml-4 space-y-1">
                              {/* PRIVATE CHAT */}
                              {!currentChat.is_group && otherUser ? (
                                <>
                                  <p className="text-sm font-medium leading-none">
                                    {otherUser.first_name} {otherUser.last_name}
                                  </p>

                                  {(() => {
                                    const role = getUserRole(
                                      otherUser,
                                      currentSpace?.id
                                    )

                                    return role ? (
                                      <p className="text-sm text-muted-foreground truncate">
                                        {role}
                                      </p>
                                    ) : null
                                  })()}
                                </>
                              ) : (
                                <>
                                  <p className="text-sm font-medium leading-none">
                                    {currentChat.name}
                                  </p>

                                  <p className="text-sm text-muted-foreground truncate">
                                    Group Chat (
                                    {currentChat.users
                                      ?.map(
                                        (u) =>
                                          `${u.user?.first_name} ${u.user?.last_name}`
                                      )
                                      .join(",")}
                                    )
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      )
                    })()
                  : null}
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
                            <div className="flex group gap-2">
                              <div className="relative group flex flex-col">
                                {/* MESSAGE BUBBLE */}
                                <div
                                  className={`rounded-lg py-2 pl-2 rich-editor flex gap-1 flex-col pr-6 ${
                                    message.sender_id === authUser?.unique_id
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  {message.sender_id !== authUser?.unique_id &&
                                  currentChat.is_group ? (
                                    <p className="text-sm font-semibold mb-1 text-muted-foreground">
                                      ~ {message.sender?.first_name}
                                    </p>
                                  ) : null}

                                  {message.is_deleted ? (
                                    <span className="italic text-sm">
                                      {message.sender_id === authUser?.unique_id
                                        ? "You deleted this message"
                                        : "This message was deleted"}
                                    </span>
                                  ) : (
                                    <>
                                      {message.type === "image" &&
                                        (() => {
                                          const parts =
                                            message.message?.split(",") || []
                                          if (parts.length !== 4) return null

                                          const [file_path, file_name] = parts
                                          return (
                                            <Image
                                              src={file_path}
                                              alt={file_name || "Image"}
                                              className="rounded-lg max-h-96 w-full object-cover bg-gradient-to-r from-accent to-secondary"
                                              width={1000}
                                              height={1000}
                                              style={{ objectFit: "contain" }}
                                            />
                                          )
                                        })()}

                                      {message.type === "file" &&
                                        (() => {
                                          const parts =
                                            message.message?.split(",") || []
                                          if (parts.length !== 4) return null

                                          const [fileUrl, fileName, fileSize] =
                                            parts

                                          return (
                                            <Link
                                              href={fileUrl}
                                              target="_blank"
                                            >
                                              <div
                                                className={`flex items-center ${
                                                  message.sender_id ===
                                                  authUser?.unique_id
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-white"
                                                } space-x-2 p-2 rounded-lg`}
                                              >
                                                <FileIcon className="h-8 w-8" />
                                                <span className="font-medium">
                                                  {fileName}
                                                </span>
                                                <span className="text-xs">
                                                  {formatFileSize(
                                                    Number(fileSize)
                                                  )}
                                                </span>
                                              </div>
                                            </Link>
                                          )
                                        })()}

                                      {message.type === "text" && (
                                        <MessageContent
                                          content={message.message}
                                        />
                                      )}
                                    </>
                                  )}
                                </div>

                                {/* DROPDOWN TOP RIGHT INSIDE BUBBLE */}
                                {!message.is_deleted &&
                                  message.sender_id === authUser?.unique_id && (
                                    <div className="absolute self-end">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 hover:bg-transparent transform -translate-y-2 group-hover:translate-y-0 transition-all duration-200"
                                          >
                                            <ChevronDown className="w-4 h-4 text-black" />
                                          </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                          align="end"
                                          className="w-40"
                                        >
                                          {message.type === "text" && (
                                            <DropdownMenuItem
                                              onClick={() => {
                                                setEditingMessage(message)
                                                setRichMessageContent(
                                                  message.message
                                                )
                                              }}
                                            >
                                              <Edit className="mr-2 h-4 w-4" />{" "}
                                              Edit
                                            </DropdownMenuItem>
                                          )}

                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleDelteMsg(message)
                                            }
                                            className="text-red-600"
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />{" "}
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  )}
                              </div>
                              {/* TIME RIGHT SIDE */}

                              <div className="text-xs text-right hidden group-hover:block">
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
                      {openAttachment ? (
                        <div className=" flex flex-col">
                          <Button
                            onClick={() => setOpenAttachment(false)}
                            className=" bg-muted w-12 h-12 self-end"
                          >
                            <X className="text-white w-12 h-12" />
                          </Button>
                          <FileUpload
                            accept="image/*,application/*"
                            onChange={handleFileUpload}
                          />
                        </div>
                      ) : (
                        <RichTextEditor
                          value={richMessageContent}
                          onChange={(val) => {
                            setRichMessageContent(val)
                            handleTyping()
                          }}
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
                      )}
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

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setOpenAttachment(true)}
                      title="Attach file"
                    >
                      <Paperclip className="h-4 w-4" />
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
