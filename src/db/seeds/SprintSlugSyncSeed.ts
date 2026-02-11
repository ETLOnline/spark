import { eq, isNull } from "drizzle-orm"
import { db } from ".."
import { slugify } from "@/src/utils/helpers"
import { SprintTable } from "../schema"

export const SprintSlugSyncSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      const sprints = await tx
        .select()
        .from(SprintTable)
        .where(isNull(SprintTable.slug))

      console.log(`📊 Found ${sprints.length} sprints without slug...`)

      for (const sprint of sprints) {
        if (!sprint.title) continue

        // Generate slug
        const generatedSlug = slugify(sprint.title)

        // Update slug

        await tx
          .update(SprintTable)
          .set({ slug: generatedSlug })
          .where(eq(SprintTable.id, sprint.id))

        console.log(`✅ Added slug for sprint: ${generatedSlug}`)
      }

      console.log(`\n🚀 Sprint slug migration finished.`)
    } catch (e) {
      console.error("❌ Sprint slug seed failed:", e)
      tx.rollback()
    }
  })
}
