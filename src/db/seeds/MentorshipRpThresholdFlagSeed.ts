import { db } from ".."
import { featureFlagsTable } from "../schema"
import {
  MENTORSHIP_RP_THRESHOLD_ENABLED,
  RP_THRESHOLD
} from "@/src/utils/constants"

export const MentorshipRpThresholdFlagSeed = async () => {
  try {
    await db.insert(featureFlagsTable).values({
      key: MENTORSHIP_RP_THRESHOLD_ENABLED,
      label: "Mentorship RP Threshold",
      is_enabled: false,
      description:
        "Require a minimum RP balance before a mentee can view or request a mentorship session. When OFF, all users can access mentorship regardless of RP.",
      value: RP_THRESHOLD
    })
    console.log("✅ MentorshipRpThresholdFlagSeed seeded successfully")
  } catch (e) {
    console.error("❌ Error seeding MentorshipRpThresholdFlagSeed:", e)
    process.exit(1)
  }
}
