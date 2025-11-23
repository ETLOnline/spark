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
  sender_id: string,
  deleted_by_user_id: string
) => {
  try {
    const deleted = await db
      .update(messagesTable)
      .set({
        is_deleted: 1,
        deleted_by: deleted_by_user_id
      })
      .where(
        and(
          eq(messagesTable.id, msg_id),
          eq(messagesTable.chat_id, chat_id),
          eq(messagesTable.sender_id, sender_id)
        )
      )
      .returning()
    return deleted.length > 0 ? deleted[0] : null
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const editChatMessage = async (
  msg_id: number,
  chat_id: number,
  sender_id: string,
  new_content: string,
  old_content: string
) => {
  try {
    console.log("editMessge called", {
      msg_id,
      chat_id,
      sender_id,
      new_content,
      old_content
    })
    const updated = await db
      .update(messagesTable)
      .set({ message: new_content })
      .where(
        and(
          eq(messagesTable.id, msg_id),
          eq(messagesTable.chat_id, chat_id),
          eq(messagesTable.sender_id, sender_id),
          eq(messagesTable.message, old_content)
        )
      )
      .returning()

    console.log("editMessge", updated)
    if (updated.length > 0) {
      const message = await db.query.messagesTable.findFirst({
        where: eq(messagesTable.id, updated[0].id),
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
