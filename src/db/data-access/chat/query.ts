import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  like,
  ne,
  or,
  sql,
  SQLWrapper
} from "drizzle-orm"
import { db } from "../.."
import {
  chatsTable,
  SpaceChatsTable,
  spacesTable,
  userChatsTable,
  userContactsTable,
  usersTable
} from "../../schema"
import { randomUUID } from "crypto"
import { slugify } from "@/src/utils/helpers"

export const CreatePrivateChat = async (
  user_id: string,
  contact_id: string,
  space_id?: string
) => {
  try {
    const chat = await db
      .insert(chatsTable)
      .values({
        type: space_id ? "space" : "open",
        name: "",
        channel_id: `${user_id}:${contact_id}`
      })
      .returning()

    if (space_id) {
      await db.insert(SpaceChatsTable).values({
        space_id,
        chat_id: chat[0].id
      })
    }

    await db.insert(userChatsTable).values([
      {
        user_id,
        chat_id: chat[0].id
      },
      {
        user_id: contact_id,
        chat_id: chat[0].id
      }
    ])

    return await db.query.chatsTable.findFirst({
      where: eq(chatsTable.id, chat[0].id),
      with: {
        users: {
          with: {
            user: true
          }
        }
      }
    })
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const CreateGroupChat = async (
  userIds: string[],
  chatName: string,
  space_id?: string
) => {
  try {
    const realtimeChannelId = randomUUID()

    const chat = await db
      .insert(chatsTable)
      .values({
        type: space_id ? "space" : "open",
        name: chatName,
        channel_id: realtimeChannelId,
        name_index: slugify(chatName),
        is_group: 1
      })
      .returning()

    if (space_id) {
      await db.insert(SpaceChatsTable).values({
        space_id,
        chat_id: chat[0].id
      })
    }

    const chatUserAttachments = userIds.map((user_id) => ({
      user_id,
      chat_id: chat[0].id
    }))

    await db.insert(userChatsTable).values(chatUserAttachments)

    return await db.query.chatsTable.findFirst({
      where: eq(chatsTable.id, chat[0].id),
      with: {
        users: {
          with: {
            user: true
          }
        }
      }
    })
  } catch (error: any) {
    throw new Error(error.message)
  }
}

// export const GetUserChat = async (user_id: string) => {
//     try{
//         const chats = await db.query.userChatsTable.findFirst({
//             where: eq(userChatsTable.user_id, user_id),
//             // with:{
//             //     chat: true,
//             //     user: true
//             // }
//         })
//         return chats
//     }catch(error:any){
//         throw new Error(error.message);
//     }
// }

export const GetChats = async (
  user_id: string,
  space_id?: string,
  is_group?: boolean
) => {
  try {
    let chatIds: number[] = []

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.unique_id, user_id),
      with: {
        chats: true
      }
    })

    chatIds = user?.chats.map((chat) => chat.chat_id) || []

    if (space_id) {
      const spaceChats = await db.query.SpaceChatsTable.findMany({
        where: eq(SpaceChatsTable.space_id, space_id)
      })
      const spaceChatIds = spaceChats.map((chat) => chat.chat_id)
      chatIds = chatIds.filter((cid) => spaceChatIds.includes(cid))
    }

    const chats = await db.query.chatsTable.findMany({
      where: (chatsTable) =>
        and(
          inArray(chatsTable.id, chatIds),
          eq(chatsTable.type, space_id ? "space" : "open"),
          is_group !== undefined && is_group === false
            ? eq(chatsTable.is_group, 0)
            : undefined
        ),
      orderBy: (chatsTable) => desc(chatsTable.created_at),
      with: {
        users: {
          with: {
            user: {
              with: {
                roles: {
                  with: {
                    role: true
                  }
                }
              }
            }
          }
        }
      }
    })
    return chats
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const GetMutualChatb = async (user_id: string, contact_id: string) => {
  try {
    const chats = await db.query.userChatsTable.findMany({
      where: or(
        eq(userChatsTable.user_id, user_id),
        eq(userChatsTable.user_id, contact_id)
      ),
      with: {
        chat: true,
        user: true
      }
    })
    return chats
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const GetMutualChat = async (
  user_id: string,
  contact_id: string,
  type?: "open" | "space"
) => {
  try {
    const chatId = await db
      .select({ chat_id: userChatsTable.chat_id })
      .from(userChatsTable)
      .where(
        or(
          eq(userChatsTable.user_id, user_id),
          eq(userChatsTable.user_id, contact_id)
        )
      )
      .groupBy(userChatsTable.chat_id)
      .having(eq(count(userChatsTable.chat_id), 2))
    if (chatId.length === 0) return null
    return await db.query.chatsTable.findFirst({
      where: and(
        eq(chatsTable.id, chatId[0].chat_id),
        type ? eq(chatsTable.type, type) : undefined,
        type ? eq(chatsTable.is_group, 0) : undefined
      )
    })
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const GetChatById = async (chat_id: number) => {
  try {
    const chat = await db.query.chatsTable.findFirst({
      where: eq(chatsTable.id, chat_id)
    })
    return chat
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const GetChatByIdWithMessages = async (chat_id: number) => {
  try {
    const chat = await db.query.chatsTable.findFirst({
      where: eq(chatsTable.id, chat_id),
      with: {
        messages: {
          limit: 50,
          orderBy: (messagesTable) => desc(messagesTable.id),
          with: {
            sender: true
          }
        },
        users: {
          with: {
            user: {
              with: {
                roles: {
                  with: {
                    role: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (chat && chat.messages.length > 0) {
      const reversedMessages = chat.messages.reverse()
      chat.messages = reversedMessages
    }

    return chat
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const GetChatBySlugWithMessages = async (slug: string) => {
  try {
    const chat = await db.query.chatsTable.findFirst({
      where: eq(chatsTable.chat_slug, slug),
      with: {
        messages: {
          limit: 50,
          orderBy: (messagesTable) => desc(messagesTable.id),
          with: {
            sender: true
          }
        },
        users: {
          with: {
            user: {
              with: {
                roles: {
                  with: {
                    role: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (chat && chat.messages.length > 0) {
      const reversedMessages = chat.messages.reverse()
      chat.messages = reversedMessages
    }

    return chat
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const updateLastChatMessage = async (
  chatId: number,
  message: string
) => {
  try {
    const [updatedChatResult] = await db
      .update(chatsTable)
      .set({
        last_message: message,
        updated_at: new Date().toISOString()
      })
      .where(eq(chatsTable.id, chatId))
      .returning({ id: chatsTable.id })

    if (!updatedChatResult) {
      return null
    }

    const fullChatWithUsers = await db.query.chatsTable.findFirst({
      where: eq(chatsTable.id, chatId),
      with: {
        users: {
          with: {
            user: true
          }
        }
      }
    })

    return fullChatWithUsers
  } catch (error: any) {
    console.error("Failed to update chat and fetch users:", error)
    throw new Error(error.message)
  }
}

export interface ChatContactFilters {
  user_id?: string
  query?: string
  space_id?: string
  space_slug?: string
  limit?: number
}
export const getChatContacts = async ({
  user_id,
  query,
  space_slug,
  space_id,
  limit
}: ChatContactFilters) => {
  try {
    let userIds: string[] = []
    const whereClause: SQLWrapper[] = []

    if (user_id) {
      const userRelated = await db.query.userContactsTable.findMany({
        where: and(
          or(
            eq(userContactsTable.user_id, user_id),
            eq(userContactsTable.contact_id, user_id)
          ),
          eq(userContactsTable.is_accepted, 1)
        )
      })
      userIds = userRelated.map((user) =>
        user.user_id === user_id ? user.contact_id : user.user_id
      )
      whereClause.push(inArray(usersTable.unique_id, userIds))
    }

    if (space_slug && !space_id) {
      const space = await db.query.spacesTable.findFirst({
        where: eq(spacesTable.space_slug, space_slug),
        columns: {
          id: true
        }
      })
      if (space) {
        space_id = space.id
      }
    }

    if (space_id) {
      const spaceUsers = await db.query.spacesTable.findFirst({
        where: eq(spacesTable.id, space_id),
        columns: {
          id: true
        },
        with: {
          users: true
        }
      })
      const spaceUserIds = spaceUsers?.users.map((user) => user.user_id) || []
      whereClause.push(inArray(usersTable.unique_id, spaceUserIds))
    }

    const users = await db.query.usersTable.findMany({
      limit: limit,
      columns: {
        first_name: true,
        last_name: true,
        email: true,
        external_auth_id: true,
        profile_url: true,
        cover_image: true,
        unique_id: true,
        role: true,
        meta_profile: true
      },
      where: (usersTable, {}) =>
        and(
          query
            ? or(
                like(usersTable.first_name, `%${query}%`),
                like(usersTable.last_name, `%${query}%`),
                like(usersTable.email, `%${query}%`)
              )
            : undefined,
          ...whereClause
        )
    })

    return users
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const getExistingSingleChat = async (
  user_id: string,
  contact_id: string,
  type?: "open" | "space",
  space_id?: string
) => {
  try {
    // Find all chat IDs where both users are participants
    const chatId = await db
      .select({ chat_id: userChatsTable.chat_id })
      .from(userChatsTable)
      .where(
        or(
          eq(userChatsTable.user_id, user_id),
          eq(userChatsTable.user_id, contact_id)
        )
      )
      .groupBy(userChatsTable.chat_id)
      .having(eq(count(userChatsTable.chat_id), 2))

    if (chatId.length === 0) return null

    let chatIds = chatId.map((c) => c.chat_id)

    // If space_id is provided, filter chats that belong to that space
    if (space_id) {
      const spaceChats = await db
        .select({ chat_id: SpaceChatsTable.chat_id })
        .from(SpaceChatsTable)
        .where(
          and(
            inArray(SpaceChatsTable.chat_id, chatIds),
            eq(SpaceChatsTable.space_id, space_id)
          )
        )

      if (spaceChats.length === 0) return null
      chatIds = spaceChats.map((c) => c.chat_id)
    }

    // Find the chat from the filtered chat IDs
    return await db.query.chatsTable.findFirst({
      where: and(
        inArray(chatsTable.id, chatIds),
        type ? eq(chatsTable.type, type) : undefined,
        eq(chatsTable.is_group, 0)
      )
    })
  } catch (error: any) {
    console.log(error.message, "error")
    throw new Error(error.message)
  }
}

export const incrementUnreadCountForChat = async (
  chatId: number,
  user_id: string
) => {
  try {
    // 1. Increment the unread_count for all users who are NOT the sender
    const result = await db
      .update(userChatsTable)
      .set({
        unread_count: sql`${userChatsTable.unread_count} + 1`
      })
      .where(
        and(
          eq(userChatsTable.chat_id, chatId),
          eq(userChatsTable.user_id, user_id)
        )
      )

    return result
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const markChatAsReadForUser = async (chatId: number, userId: string) => {
  try {
    const [result] = await db
      .update(userChatsTable)
      .set({ unread_count: 0 })
      .where(
        and(
          eq(userChatsTable.chat_id, chatId),
          eq(userChatsTable.user_id, userId)
        )
      )
      .returning({
        userId: userChatsTable.user_id,
        chatId: userChatsTable.chat_id
      })

    return result
  } catch (error: any) {
    throw new Error(error.message)
  }
}
export const getExistingGroupName = async (
  chatName: string,
  space_id?: string
) => {
  try {
    if (!space_id) {
      return undefined
    }
    const chatNameSlugfy = slugify(chatName)
    const existingChat = await db.query.chatsTable.findFirst({
      where: and(
        eq(chatsTable.is_group, 1),
        eq(chatsTable.name_index, chatNameSlugfy),

        inArray(
          chatsTable.id,
          sql`${db
            .select({ chat_id: SpaceChatsTable.chat_id })
            .from(SpaceChatsTable)
            .where(eq(SpaceChatsTable.space_id, space_id))}`
        )
      ),
      with: {
        users: {
          with: {
            user: true
          }
        }
      }
    })

    return existingChat
  } catch (error: any) {
    console.error("Error during group name check:", error.message)
    throw new Error(error.message)
  }
}
