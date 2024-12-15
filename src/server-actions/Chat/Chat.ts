import { db } from '@/src/db';
import { chatTable, userChatsTable } from './../../db/schema';
import { eq } from 'drizzle-orm';
'use server'


export const GetUserChats = async (user_id: string) => {
    try{
        const chats = await db.query.userChatsTable.findMany({
            where: eq(userChatsTable.user_id, user_id),
            with:{
                chat: true,
                user: true
            }
        })
        return { success: true , data : chats }
    }catch(error){
        return { error: error }
    }
}

export const GetChatWithMessages = async (chat_id: number) => {
    try{
        const chat = await db.query.chatTable.findFirst({
            where: eq(chatTable.id, chat_id),
            with:{
                messages: true
            }
        })
        return { success: true , data : chat }
    }catch(error){
        return { error: error }
    }
}