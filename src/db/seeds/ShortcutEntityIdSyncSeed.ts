import { eq } from "drizzle-orm"
import { db } from ".."
import {
  shortcutsTable,
  communitiesTable,
  channelsTable,
  spacesTable,
  projectTable
} from "../schema"

export const ShortcutEntityIdSyncSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      const shortcuts = await tx.select().from(shortcutsTable)
      console.log(
        `📊 Processing ${shortcuts.length} shortcuts with STRICT isolation...`
      )

      for (const shortcut of shortcuts) {
        // Reset everything to null for this row to ensure no "bleeding" from other types
        const updateData: any = {
          community_id: null,
          channel_id: null,
          space_id: null,
          project_id: null
        }
        let matched = false

        // 1. STRICT COMMUNITY: ONLY fill community_id
        if (shortcut.type === "community") {
          const community = await tx
            .select({ id: communitiesTable.id })
            .from(communitiesTable)
            .where(eq(communitiesTable.slug, shortcut.url))
            .limit(1)

          if (community[0]) {
            updateData.community_id = community[0].id
            matched = true
          }
        }

        // 2. STRICT CHANNEL: ONLY fill channel_id
        else if (shortcut.type === "channel") {
          const channel = await tx
            .select({ id: channelsTable.id })
            .from(channelsTable)
            .where(eq(channelsTable.channel_slug, shortcut.url))
            .limit(1)

          if (channel[0]) {
            updateData.channel_id = channel[0].id
            matched = true
          }
        }

        // 3. STRICT SPACE: ONLY fill space_id
        else if (shortcut.type === "space") {
          const parts = shortcut.url.split("/").filter(Boolean)
          const sSlug = parts[2] || shortcut.url // fallback if url is just the slug

          const space = await tx
            .select({ id: spacesTable.id })
            .from(spacesTable)
            .where(eq(spacesTable.space_slug, sSlug))
            .limit(1)

          if (space[0]) {
            updateData.space_id = space[0].id
            matched = true
          }
        }

        // 4. STRICT PROJECT: ONLY fill project_id
        else if (shortcut.type === "project") {
          const project = await tx
            .select({ id: projectTable.id })
            .from(projectTable)
            .where(eq(projectTable.id, shortcut.url))
            .limit(1)

          if (project[0]) {
            updateData.project_id = project[0].id
            matched = true
          }
        }

        if (matched) {
          await tx
            .update(shortcutsTable)
            .set(updateData)
            .where(eq(shortcutsTable.id, shortcut.id))
          console.log(`✅ Fixed ${shortcut.type} (Isolated ID)`)
        }
      }

      console.log(`\n🚀 Migration Finished. Each type now has ONLY its own ID.`)
    } catch (e) {
      console.error("❌ Seeder failed:", e)
      tx.rollback()
    }
  })
}
