import { notificationsTable } from "./../../schema"
import { desc, eq, inArray } from "drizzle-orm"
import { db } from "../.."
import { InsertNotification } from "../../schema"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"

export const AddNotification = async (
  payload: InsertNotification | InsertNotification[]
): Promise<InsertNotification | InsertNotification[]> => {
  try {
    const result = await db
      .insert(notificationsTable)
      .values(Array.isArray(payload) ? payload : [payload])
      .returning()

    return Array.isArray(payload) ? result : result[0]
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const GetNotifications = async () => {
  try {
    const userId = (await AuthUserAction())?.unique_id
    if (!userId) {
      throw new Error("User not authenticated")
    }
    const notifications = await db.query.notificationsTable.findMany({
      where: eq(notificationsTable.received_by, userId),
      orderBy: (notificationsTable) => desc(notificationsTable.created_at),
      with: { creator: true }
    })
    return notifications
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const MarkNotificationAsRead = async (id: number | number[]) => {
  try {
    if (Array.isArray(id)) {
      return await db
        .update(notificationsTable)
        .set({ is_read: 1 })
        .where(inArray(notificationsTable.id, id))
        .returning()
    } else {
      return await db
        .update(notificationsTable)
        .set({ is_read: 1 })
        .where(eq(notificationsTable.id, id))
        .returning()
    }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const DeleteNotification = async (id: number) => {
  try {
    return await db
      .delete(notificationsTable)
      .where(eq(notificationsTable.id, id))
      .returning()
  } catch (error: any) {
    throw new Error(error.message)
  }
}
