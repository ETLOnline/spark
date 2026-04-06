import { sql } from "drizzle-orm"
import { db } from ".."
import { featureFlagsTable, InsertFeatureFlag } from "../schema"

const featureFlagsSeedList: InsertFeatureFlag[] = [
  {
    key: "Trust_Engine_Enabled",
    label: "Trust Engine",
    is_enabled: true,
    description: "Enable trust engine features for user recognition and scoring"
  },
  {
    key: "Rewards_Enabled",
    label: "Rewards",
    is_enabled: true,
    description: "Enable rewards and badge system for community engagement"
  }
]

export const FeatureFlagsSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      await tx.delete(featureFlagsTable)

      await tx.execute(
        sql`ALTER SEQUENCE feature_flags_id_seq RESTART; UPDATE feature_flags SET id = DEFAULT;`
      )

      const result = await tx
        .insert(featureFlagsTable)
        .values(featureFlagsSeedList)

      if (result.count === featureFlagsSeedList.length) {
        console.log("✅ Feature flags seeded successfully")
      }
    } catch (e) {
      console.error(e)
      tx.rollback()
      console.log("❌ Error seeding feature flags")
      process.exit(1)
    }
  })
}
