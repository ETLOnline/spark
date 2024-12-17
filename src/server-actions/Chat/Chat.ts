
import { GetChatWithMessages, GetUserChats } from '@/src/db/data-access/chat/query';
'use server'


export const GetUserChatsAction = async (user_id: string) => {
    try{
        const chats = await GetUserChats(user_id);
        return { success: true , data : chats }
    }catch(error){
        return { error: error }
    }
}

export const GetChatWithMessagesAction = async (chat_id: number) => {
    try{
        const chat = await GetChatWithMessages(chat_id);
        return { success: true , data : chat }
    }catch(error){
        return { error: error }
    }
}