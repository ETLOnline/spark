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
  updateLastChatMessage
} from "@/src/db/data-access/chat/query"
import { CreateServerAction } from ".."
import { InsertMessage, SelectUser } from "@/src/db/schema"
import { AuthUserAction } from "../User/AuthUserAction"
import { createChatMessage } from "@/src/db/data-access/chat/message/query"
import ChatChannelHash from "@/src/components/Dashboard/Chat/helper"
import { AblyClientRest } from "@/src/services/realtime/AblyClient"

export const CreatePrivateChatAction = CreateServerAction(
  true,
  async (user_id: string, contact_id: string, space_id?: string) => {
    try {
      let existingChat

      if (space_id) {
        // Check for existing space chat
        const userChatsInSpace = await GetChats(user_id, space_id, false)
        existingChat = userChatsInSpace.find(
          (chat) =>
            chat.users.some((u) => u.user_id === contact_id) &&
            chat.users.some((u) => u.user_id === user_id)
        )
      } else {
        // Check for existing open chat
        existingChat = await GetMutualChat(user_id, contact_id, "open")
      }

      if (existingChat) {
        return { success: false, data: existingChat, existingChat: true }
      }
      const chat = await CreatePrivateChat(user_id, contact_id, space_id)
      return { success: true, data: chat }
    } catch (error) {
      return { error: error }
    }
  }
)

export const CreateGroupChatAction = CreateServerAction(
  true,
  async (userIds: string[], chatName: string, space_id?: string) => {
    try {
      const chat = await CreateGroupChat(userIds, chatName, space_id)
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
  async (message: InsertMessage) => {
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

          // const channelHash = ChatChannelHash(updatedChat.channel_id)

          // send message to channel

          const realtimeChannel = AblyClientRest.channels.get(
            updatedChat.channel_id
          )
          await realtimeChannel.publish("message", newMessage)

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
