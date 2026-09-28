import { db } from ".."
import { featureFlagsTable, InsertFeatureFlag } from "../schema"
import {
  MENTORSHIP_RP_THRESHOLD_ENABLED,
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
  }
]

export const FeatureFlagsSeed = async () => {
  try {
    await db
      .insert(featureFlagsTable)
      .values(featureFlagsSeedList)
      .onConflictDoNothing({ target: featureFlagsTable.key })

    console.log("✅ Feature flags seeded successfully")
  } catch (e) {
    console.error(e)
    console.log("❌ Error seeding feature flags")
    process.exit(1)
  }
}
