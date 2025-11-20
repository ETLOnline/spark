import { db } from "@/src/db"
import { InsertMessage, messagesTable } from "@/src/db/schema"
import { and, eq } from "drizzle-orm"

export const createChatMessage = async (newMessage: InsertMessage) => {
  try {
    const messages = await db
      .insert(messagesTable)
      .values(newMessage)
      .returning()

    if (messages.length > 0) {
      const message = await db.query.messagesTable.findFirst({
        where: eq(messagesTable.id, messages[0].id),
        with: {
          sender: true
        }
      })
      return message
    }

    return null
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const deleteChatMessage = async (
  msg_id: number,
  chat_id: number,
  sender_id: string
) => {
  try {
    const deleted = await db
      .delete(messagesTable)
      .where(
        and(
          eq(messagesTable.id, msg_id),
          eq(messagesTable.chat_id, chat_id),
          eq(messagesTable.sender_id, sender_id)
        )
      )
      .returning()
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}
