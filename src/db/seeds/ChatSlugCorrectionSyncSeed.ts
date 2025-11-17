import { eq, sql } from "drizzle-orm"
import { db } from ".."
import { chatsTable } from "../schema"
import { slugify } from "@/src/utils/helpers"

export const ChatSlugCorrectionSyncSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      // Fetch all chat records
      const chats = await tx.select().from(chatsTable).where(eq(chatsTable.is_group, 1));
      
      console.log(`📊 Found ${chats.length} chats to process`)
      
      // Update each chat with slugified name
      for (const chat of chats) {
        if (chat.name) {
          const slug = slugify(chat.name)
          
          await tx
            .update(chatsTable)
            .set({ name_index: slug })
            .where(sql`${chatsTable.id} = ${chat.id}`)
        }
      }
      
      console.log("✅ Chat slugs updated successfully")
      
    } catch (e) {
      console.error(e)
      tx.rollback()
      console.log("❌ Error updating chat slugs")
      process.exit(1)
    }
  })
}