import { eq } from "drizzle-orm"
import { db } from "../.."
import { InsertShortcut, shortcutsTable } from "../../schema"

export const AddShortcut = async (data: InsertShortcut) => {
  try {
    return (await db.insert(shortcutsTable).values(data).returning()).at(0)
  } catch (e: any) {
    throw new Error("Failed to add shortcut", {
      cause: e
    })
  }
}

export const DeleteShortcut = async (shortcutId: string) => {
  try {
    return await db
      .delete(shortcutsTable)
      .where(eq(shortcutsTable.id, shortcutId))
  } catch (e: any) {
    throw new Error("Failed to delete shortcut", {
      cause: e
    })
  }
}

export const GetUserShortcuts = async (userId: string) => {
  try {
    return await db
      .select()
      .from(shortcutsTable)
      .where(eq(shortcutsTable.user_id, userId))
  } catch (e: any) {
    throw new Error("Failed to get shortcuts", {
      cause: e
    })
  }
}
