import { FeatureSeed } from "./FeatureSeed"
import { UserSeed } from "./UserSeed"

;(async () => {
  try {
    console.log("🌱 Seeding Started")
    // Seed Features
    await UserSeed()
    await FeatureSeed()

    console.log("✅ Seeding Completed")
    process.exit(0)
  } catch (e) {
    console.log("❌ Error seeding")
    process.exit(1)
  }
})()
