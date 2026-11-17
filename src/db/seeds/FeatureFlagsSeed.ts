import { sql } from "drizzle-orm"
import { db } from ".."
import { featureFlagsTable, InsertFeatureFlag } from "../schema"
import {
  MENTORSHIP_RP_THRESHOLD_ENABLED,
  AI_POST_MODERATION_ENABLED,
  PRIVATE_COMMUNITY_AI_POST_MODERATION_ENABLED,
  POST_MODERATION_FLAG_DEFINITIONS,
  RP_THRESHOLD
} from "@/src/utils/constants"

const featureFlagsSeedList: InsertFeatureFlag[] = [
  {
    key: "Trust_Engine_Enabled",
    label: "Trust Engine",
    is_enabled: false,
    description: "Enable trust engine features for user recognition and scoring"
  },
  {
    key: "Rewards_Enabled",
    label: "Rewards",
    is_enabled: false,
    description: "Enable rewards and badge system for community engagement"
  },
  {
    key: MENTORSHIP_RP_THRESHOLD_ENABLED,
    label: "Mentorship RP Threshold",
    is_enabled: false,
    description:
      "Require a minimum RP balance before a mentee can view or request a mentorship session. When OFF, all users can access mentorship regardless of RP.",
    value: RP_THRESHOLD
  },
  {
    key: AI_POST_MODERATION_ENABLED,
    ...POST_MODERATION_FLAG_DEFINITIONS[AI_POST_MODERATION_ENABLED],
    is_enabled: false
  },
  {
    key: PRIVATE_COMMUNITY_AI_POST_MODERATION_ENABLED,
    ...POST_MODERATION_FLAG_DEFINITIONS[
      PRIVATE_COMMUNITY_AI_POST_MODERATION_ENABLED
    ],
    is_enabled: false
  }
]

export const FeatureFlagsSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      await tx
        .insert(featureFlagsTable)
        .values(featureFlagsSeedList)
        // An existing flag keeps its state, value and label; only a missing description is
        // filled in (e.g. a flag the admin settings created before the seed ran)
        .onConflictDoUpdate({
          target: featureFlagsTable.key,
          set: {
            description: sql`coalesce(${featureFlagsTable.description}, excluded.description)`
          }
        })

      console.log("✅ Feature flags seeded successfully")
    } catch (e) {
      console.error(e)
      tx.rollback()
      console.log("❌ Error seeding feature flags")
      process.exit(1)
    }
  })
}
