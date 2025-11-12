"use server"
import {
  ChatContactFilters,
  CreateGroupChat,
  CreatePrivateChat,
  GetChatByIdWithMessages,
  GetChatBySlugWithMessages,
  getChatContacts,
  GetMutualChat,
  GetChats,
  updateLastChatMessage,
  getExistingSingleChat,
  incrementUnreadCountForChat,
  markChatAsReadForUser
} from "@/src/db/data-access/chat/query"
import { CreateServerAction } from ".."
import { InsertMessage } from "@/src/db/schema"
import { AuthUserAction } from "../User/AuthUserAction"
import { createChatMessage } from "@/src/db/data-access/chat/message/query"
import { AblyClientRest } from "@/src/services/realtime/AblyClient"
import { GetSpaceById } from "@/src/db/data-access/spaces/query"
import {
  SendChatNotification,
  SendMessageNotification
} from "@/src/services/notifications/Chat/utils"
import { createChatEmailNotification } from "@/src/services/notify/chat/chat"
import { NotificationEvent } from "@/src/services/notify/types/events"

export const CreatePrivateChatAction = CreateServerAction(
  true,
  async (user_id: string, contact_id: string, space_id?: string) => {
    try {
      const space = await GetSpaceById(space_id || "")

      if (user_id == contact_id) {
        return {
          success: false,
          error: "You cannot start a chat with yourself"
        }
      }
      const chatType = space_id ? "space" : "open"
      const existingChat = await getExistingSingleChat(
        user_id,
        contact_id,
        chatType,
        space_id
      )

      if (existingChat) {
        return { success: false, data: existingChat, existingChat: true }
      }
      const newChat = await CreatePrivateChat(user_id, contact_id, space_id)
      if (!newChat) {
        return { success: false, data: null }
      }

      const chatMembers = newChat.users

      for (const member of chatMembers) {
        const userChannel = AblyClientRest.channels.get(
          `user:${member.user_id}`
        )
        await userChannel.publish("chat-created", {
          newChat,
          initiatorId: user_id,
          spaceId: space_id
        })
      }

      await SendChatNotification(NotificationEvent.CHAT_INVITE, newChat, space)

      await createChatEmailNotification(
        NotificationEvent.CHAT_INVITE,
        [contact_id],
        space_id || ""
      )
      return { success: true, data: newChat }
    } catch (error) {
      return { error: error }
    }
  }
)

export const CreateGroupChatAction = CreateServerAction(
  true,
  async (userIds: string[], chatName: string, space_id?: string) => {
    try {
      const authUser = await AuthUserAction()
      const space = await GetSpaceById(space_id || "")

      const chat = await CreateGroupChat(userIds, chatName, space_id)

      if (!chat) {
        return { success: false, data: null }
      }

      // Get the list of users in the newly created chat
      const chatUsers = chat.users?.map((userChat) => userChat.user) || []

      // Loop through each user and publish the "chat-created" event to their channel
      for (const user of chatUsers) {
        if (!user?.unique_id) continue
        const userChannel = AblyClientRest.channels.get(
          `user:${user.unique_id}`
        )

        await userChannel.publish("chat-created", {
          newChat: chat,
          initiatorId: authUser.unique_id,
          spaceId: space_id
        })
      }

      await SendChatNotification(NotificationEvent.CHAT_INVITE, chat, space)

      await createChatEmailNotification(
        NotificationEvent.CHAT_INVITE,
        userIds,
        space_id || ""
      )
      return { success: true, data: chat }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetChatsAction = CreateServerAction(
  true,
  async (space_id?: string) => {
    try {
      const authUser = await AuthUserAction()

      const user_id = authUser.unique_id
      const chats = await GetChats(user_id, space_id)
      return { success: true, data: chats }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetMutualChatAction = CreateServerAction(
  true,
  async (contact_id: string, type?: "open" | "space") => {
    try {
      const authUser = await AuthUserAction()
      if (authUser) {
        const chat = await GetMutualChat(authUser.unique_id, contact_id, type)
        return { success: true, data: chat }
      }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetChatWithMessagesAction = CreateServerAction(
  true,
  async (chat_id: number) => {
    try {
      const chat = await GetChatByIdWithMessages(chat_id)
      return { success: true, data: chat }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetChatBySlugWithMessagesAction = CreateServerAction(
  true,
  async (slug: string) => {
    try {
      const chat = await GetChatBySlugWithMessages(slug)
      return { success: true, data: chat }
    } catch (error) {
      return { error: error }
    }
  }
)

export const AddMessageToChatAction = CreateServerAction(
  true,
  async (message: InsertMessage, space_id?: string) => {
    try {
      const authUser = await AuthUserAction()
      if (authUser) {
        const newMessagePlayload = {
          ...message,
          sender_id: authUser.unique_id
        }
        const newMessage = await createChatMessage(newMessagePlayload)
        if (newMessage) {
          // update last message on chat
          const updatedChat = await updateLastChatMessage(
            newMessage.chat_id,
            newMessage.message
          )
          if (!updatedChat) {
            return { success: false }
          }
          // const channelHash = ChatChannelHash(updatedChat.channel_id)

          // send message to channel

          const realtimeChannel = AblyClientRest.channels.get(
            updatedChat.channel_id
          )
          await realtimeChannel.publish("message", newMessage)

          const chatUsers = updatedChat.users

          for (const userChat of chatUsers) {
            const userId = userChat.user_id

            if (userId !== authUser.unique_id) {
              const userNotificationChannel = AblyClientRest.channels.get(
                `user:${userId}`
              )
              await userNotificationChannel.publish("chat-update", {
                chatId: updatedChat.id,
                lastMessage: newMessage.message,
                sender_id: authUser.unique_id
              })
            }
          }

          const space = await GetSpaceById(space_id || "")

          await SendMessageNotification(updatedChat, space)

          return { success: true, data: newMessage }
        } else {
          return { error: "Failed to create message" }
        }
      }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetChatContactsAction = CreateServerAction(
  true,
  async (filters: ChatContactFilters) => {
    try {
      const contacts = await getChatContacts(filters)
      return { success: true, data: contacts }
    } catch (error) {
      return { error: error }
    }
  }
)

export const MarkChatAsReadAction = CreateServerAction(
  true,
  async (chat_id: number) => {
    try {
      const authUser = await AuthUserAction()
      if (!authUser) return { success: false, error: "Unauthorized" }

      const result = await markChatAsReadForUser(chat_id, authUser.unique_id)
      return { success: true, data: result }
    } catch (error) {
      return { error: error }
    }
  }
)

export const incrementUnreadCountForChatAction = CreateServerAction(
  true,
  async (chat_id: number, user_id: string) => {
    try {
      console.log(chat_id, user_id)
      const result = await incrementUnreadCountForChat(chat_id, user_id)
      return { success: true, data: result }
    } catch (error) {
      return { error: error }
    }
  }
)
