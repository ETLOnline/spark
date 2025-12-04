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

export const deleteChatMessage = async (msg_id: number) => {
  try {
    const deleted = await db
      .update(messagesTable)
      .set({
        is_deleted: 1
      })
      .where(and(eq(messagesTable.id, msg_id)))
      .returning()
    return deleted.length > 0 ? deleted[0] : null
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const editChatMessage = async (
  msg_id: number,

  new_content: string
) => {
  try {
    const updated = await db
      .update(messagesTable)
      .set({ message: new_content })
      .where(and(eq(messagesTable.id, msg_id)))
      .returning()

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
