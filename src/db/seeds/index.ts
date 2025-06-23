import { FeatureSeed } from "./FeatureSeed"
import { seedPersonas } from "./personaSeeder"
import { seedTags } from "./TagsSeeder"
import { UserSeed } from "./UserSeed"

const SEEDERS: Record<string, () => Promise<void>> = {
  user: UserSeed,
  feature: FeatureSeed,
  persona: seedPersonas,
  tags: seedTags
}

async function runSeeders() {
  try {
    const args = process.argv.slice(2)
    const seederNames = args.length > 0 ? args : Object.keys(SEEDERS)

    console.log(`🌱 Starting seeders: ${seederNames.join(", ") || "ALL"}`)

    for (const name of seederNames) {
      if (SEEDERS[name]) {
        console.log(`├── Starting ${name} seeder...`)
        await SEEDERS[name]()
        console.log(`├── ✅ ${name} seeder completed`)
      } else {
        console.warn(`├── ⚠️  Unknown seeder: ${name}`)
      }
    }

    console.log("✅ All requested seeders completed")
    process.exit(0)
  } catch (e) {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  }
}

runSeeders()
