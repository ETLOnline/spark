import { eq } from "drizzle-orm"
import { db } from "../.."
import { chatsTable, userChatsTable } from "../../schema"


export const GetUserChats = async (user_id: string) => {
    try{
        const chats = await db.query.userChatsTable.findMany({
            where: eq(userChatsTable.user_id, user_id),
            // with:{
            //     chat: true,
            //     user: true
            // }
        })
        return chats
    }catch(error:any){
        throw new Error(error.message);
    }
}

export const GetChatWithMessages = async (chat_id: number) => {
    try{
        const chat = await db.query.chatsTable.findFirst({
            where: eq(chatsTable.id, chat_id),
            // with:{
            //     messages: true
            // }
        })
        return chat
    }catch(error:any){
        throw new Error(error.message);
    }
}