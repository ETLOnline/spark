
import { db } from "@/src/db";
import { InsertMessage, messagesTable } from "@/src/db/schema";


export const createChatMessage = async (newMessage:InsertMessage) => {
    try{
        const messages = await db.insert(messagesTable).values(newMessage).returning()
        if(messages.length > 0){
            return messages[0]
        }

    }catch(error:any){
        throw new Error(error.message)
    }
}