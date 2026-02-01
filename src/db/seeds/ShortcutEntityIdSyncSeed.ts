import { eq, and } from "drizzle-orm"
import { db } from ".."
import { 
  shortcutsTable, 
  communitiesTable, 
  channelsTable, 
  spacesTable, 
  projectTable 
} from "../schema"

/**
 * Seeder to populate entity_id in shortcuts table
 * Tries to match URL against all entity types
 */
export const ShortcutEntityIdSyncSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      // Fetch all shortcut records
      const shortcuts = await tx.select().from(shortcutsTable)

      console.log(`📊 Found ${shortcuts.length} shortcuts to process`)

      let updatedCount = 0
      let skippedCount = 0
      let errorCount = 0

      // Process each shortcut
      for (const shortcut of shortcuts) {
        try {
          let entity_id: string | null = null
          let matchedType: string | null = null

          // Try to match as community
          const community = await tx
            .select({ id: communitiesTable.id })
            .from(communitiesTable)
            .where(eq(communitiesTable.slug, shortcut.url))
            .limit(1)

          if (community[0]?.id) {
            entity_id = community[0].id
            matchedType = 'community'
          }

          // If not found, try to match as channel
          if (!entity_id) {
            const channel = await tx
              .select({ id: channelsTable.id })
              .from(channelsTable)
              .where(eq(channelsTable.channel_slug, shortcut.url))
              .limit(1)

            if (channel[0]?.id) {
              entity_id = channel[0].id
              matchedType = 'channel'
            }
          }

          // If not found, try to match as space (URL format: "channel-slug/spaces/space-slug")
          if (!entity_id && shortcut.url.includes('/spaces/')) {
            const urlParts = shortcut.url.split("/").filter(Boolean)
            const channel_slug = urlParts[0]
            const space_slug = urlParts[2] // index 2 because format is: channel-slug/spaces/space-slug

            if (channel_slug && space_slug) {
              // First find the channel
              const channel = await tx
                .select({ id: channelsTable.id })
                .from(channelsTable)
                .where(eq(channelsTable.channel_slug, channel_slug))
                .limit(1)

              if (channel[0]?.id) {
                // Then find the space
                const space = await tx
                  .select({ id: spacesTable.id })
                  .from(spacesTable)
                  .where(
                    and(
                      eq(spacesTable.space_slug, space_slug),
                      eq(spacesTable.channel_id, channel[0].id)
                    )
                  )
                  .limit(1)

                if (space[0]?.id) {
                  entity_id = space[0].id
                  matchedType = 'space'
                }
              }
            }
          }

          // If not found, try to match as project (UUID format)
          if (!entity_id) {
            const project = await tx
              .select({ id: projectTable.id })
              .from(projectTable)
              .where(eq(projectTable.id, shortcut.url))
              .limit(1)

            if (project[0]?.id) {
              entity_id = project[0].id
              matchedType = 'project'
            }
          }

          // Update the shortcut with entity_id
          if (entity_id) {
            await tx
              .update(shortcutsTable)
              .set({ entity_id })
              .where(eq(shortcutsTable.id, shortcut.id))

            updatedCount++
            console.log(`✓ Updated shortcut ${shortcut.id} [${matchedType}]: ${shortcut.url} → ${entity_id}`)
          } else {
            console.warn(`⚠️  No entity found for shortcut ID: ${shortcut.id}, url: ${shortcut.url}`)
            skippedCount++
          }
        } catch (error) {
          console.error(`❌ Error processing shortcut ${shortcut.id}:`, error)
          errorCount++
        }
      }

      console.log("\n" + "=".repeat(50))
      console.log("📈 Migration Summary:")
      console.log(`   ✅ Updated: ${updatedCount}`)
      console.log(`   ⚠️  Skipped: ${skippedCount}`)
      console.log(`   ❌ Errors: ${errorCount}`)
      console.log("=".repeat(50))
      console.log("✅ Shortcut entity_id migration completed successfully")
    } catch (e) {
      console.error("❌ Fatal error during migration:", e)
      tx.rollback()
      console.log("❌ Transaction rolled back")
      process.exit(1)
    }
  })
}