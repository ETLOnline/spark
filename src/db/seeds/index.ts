import { FeatureSeed } from "./FeatureSeed"
import { RolesSeed } from "./RolesSeed"
import { UserSeed } from "./UserSeed"
import { PermissionsSeed } from "./PermissionsSeed"
import { RolePermissionsSeed } from "./RolePermissionsSeed"
import { TagSeed } from "./TagsSeeder"
import { CommunityCategorySeed } from "./CommunityCategories"
import { MentorSeed } from "./MentorSeed"
import { NewRolePermissions } from "./NewRolePermissions"
import { CommunityUserListRolePermission } from "./CommunityUserListRolePermission"

const SEEDERS: Record<string, () => Promise<void>> = {
  FeatureSeed,
  TagSeed,
  PermissionsSeed,
  RolesSeed,
  RolePermissionsSeed,
  UserSeed,
  MentorSeed,
  CommunityCategorySeed,
  NewRolePermissions,
  CommunityUserListRolePermission
}

async function runSeeders() {
  try {
    const args = process.argv.slice(2)
    const excludedSeeders = [
      "UserSeed",
      "NewRolePermissions",
      "CommunityUserListRolePermission"
    ]

    const seederNames =
      args.length > 0
        ? args
        : Object.keys(SEEDERS).filter((s) => !excludedSeeders.includes(s))
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

export const runSeeds = async () => {
  await MentorSeed();
};
runSeeders()
