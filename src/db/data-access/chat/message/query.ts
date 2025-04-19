
import { db } from "@/src/db";
import { InsertMessage, messagesTable } from "@/src/db/schema";
import { eq } from "drizzle-orm";


export const createChatMessage = async (newMessage:InsertMessage) => {
    try{
        const messages = await db.insert(messagesTable).values(newMessage).returning()

        if(messages.length > 0){
            const message = await db.query.messagesTable.findFirst({
                where: eq(messagesTable.id, messages[0].id),
                with: {
                    sender: true,
                    
                }
            }) 
            return message
        }

        return null

    }catch(error:any){
        throw new Error(error.message)
    }
}