import { eq, inArray } from "drizzle-orm"
import { db } from "../.."
import { channelsTable, InsertShortcut, projectTable, shortcutsTable, spacesTable } from "../../schema"

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
export const GetUserShortcutsByRelations = async (userId: string) => {
  try {
    return await db.query.shortcutsTable.findMany({
      where: eq(shortcutsTable.user_id, userId),
      with: {
        // Updated to use the correct column names from your schema
        community: { 
          columns: { 
            id: true, 
            title: true, // Community uses 'community_name'
            slug: true 
          } 
        },
        channel: { 
          columns: { 
            id: true, 
            channel_name: true, 
            channel_slug: true 
          } 
        },
        space: { 
          columns: { 
            id: true, 
            space_name: true, 
            space_slug: true 
          } 
        },
        project: { 
          columns: { 
            id: true, 
            project_name: true, 
            project_slug: true 
          } 
        },
      },
    });
  } catch (e: any) {
    throw new Error("Failed to get shortcuts", { cause: e });
  }
};
