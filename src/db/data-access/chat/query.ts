
import { asc, count, desc, eq, inArray, or } from "drizzle-orm"
import { db } from "../.."
import { chatsTable, userChatsTable, usersTable } from "../../schema"


export const CreatePrivateChat = async (user_id: string, contact_id: string) => {
    try{
        const chat = await db.insert(chatsTable).values({
            type: "private",
            name: "",
            channel_id: `${user_id}:${contact_id}`,
        }).returning()
        await db.insert(userChatsTable).values(
            [
                {
                    user_id,
                    chat_id: chat[0].id
                },
                {
                    user_id: contact_id,
                    chat_id: chat[0].id
                }
            ]
        )

        return await db.query.chatsTable.findFirst({
            where: eq(chatsTable.id, chat[0].id),
        })

        
    }catch(error:any){
        throw new Error(error.message);
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


export const GetUserChats = async (user_id: string) => {
    try{
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.unique_id, user_id),
            with:{
                chats: true
            }
        })
        const chatIds = user?.chats.map((chat) => chat.chat_id) || []
        const chats = await db.query.chatsTable.findMany({
            where: (chatsTable) => inArray(chatsTable.id, chatIds),
            orderBy: (chatsTable) => desc(chatsTable.created_at),
            with:{
                users: {
                    with:{
                        user: true
                    }
                }
            } 
        })
        return chats
    }catch(error:any){
        throw new Error(error.message);
    }
}


export const GetMutualChatb = async (user_id: string, contact_id: string) => {
    try{
        const chats = await db.query.userChatsTable.findMany({
            where: or(
                eq(userChatsTable.user_id, user_id),
                eq(userChatsTable.user_id, contact_id)
            ), 
            with:{
                chat: true,
                user: true
            },
        
        })
        return chats
    }catch(error:any){
        throw new Error(error.message);
    }
}

export const GetMutualChat = async (user_id: string, contact_id: string) => {
    try{
        const chatId = await db.select({ chat_id: userChatsTable.chat_id }).from(userChatsTable).where(
            or(
                eq(userChatsTable.user_id, user_id),
                eq(userChatsTable.user_id, contact_id)
            )
        ).groupBy(
            userChatsTable.chat_id
        ).having(
            eq(count(userChatsTable.chat_id), 2)
        )
        if(chatId.length === 0) return null
        return await db.query.chatsTable.findFirst({
            where: eq(chatsTable.id, chatId[0].chat_id)
        })
    }catch(error:any){
        throw new Error(error.message);
    }
}

export const GetChatById = async (chat_id: number) => {
    try{
        const chat = await db.query.chatsTable.findFirst({
            where: eq(chatsTable.id, chat_id),
        })
        return chat
    }catch(error:any){
        throw new Error(error.message);
    }
}

export const GetChatByIdWithMessages = async (chat_id: number) => {
    try{
        const chat = await db.query.chatsTable.findFirst({
            where: eq(chatsTable.id, chat_id),
            with:{
                messages: {
                    limit:50,
                    orderBy: (messagesTable) => desc(messagesTable.id),
                    

                },
                users: {
                    with:{
                        user: true
                    }
                }
            }
        })

        if (chat && chat.messages.length > 0) {
            const reversedMessages = chat.messages.reverse()
            chat.messages = reversedMessages
        }

        return chat
    }catch(error:any){
        throw new Error(error.message);
    }
}

export const GetChatBySlugWithMessages = async (slug: string) => {
    try{
        const chat = await db.query.chatsTable.findFirst({
            where: eq(chatsTable.chat_slug, slug),
            with:{
                messages: {
                    limit:50,
                    orderBy: (messagesTable) => desc(messagesTable.id)
                },
                users: {
                    with:{
                        user: true
                    }
                }
            }
        })

        if (chat && chat.messages.length > 0) {
            const reversedMessages = chat.messages.reverse()
            chat.messages = reversedMessages
        }

        return chat
    }catch(error:any){
        throw new Error(error.message);
    }
}

export const updateLastChatMessage = async (chatId: number, message: string) => {
    try{
        const updatedChat = await db.update(chatsTable).set({
            last_message: message
        }).where(
            eq(chatsTable.id, chatId)
        ).returning()
        return updatedChat[0]
    }catch(error:any){
        throw new Error(error.message);
    }
}