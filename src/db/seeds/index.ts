import { FeatureSeed } from "./FeatureSeed"
import { RolesSeed } from "./RolesSeed"
import { UserSeed } from "./UserSeed"
import { PermissionsSeed } from "./PermissionsSeed"
import { RolePermissionsSeed } from "./RolePermissionsSeed"
import { TagSeed } from "./TagsSeeder"
import { CommunityCategorySeed } from "./CommunityCategories"
import { CommunityUserListRolePermission } from "./CommunityUserListRolePermission"
import { NewTagsSeed } from "./NewTagsSeeder"
import { CheckRolePermissionMismatch } from "./CheckRolePermissionMismatch"
import { SyncRolePermissionsSeeder } from "./SyncScopedPermissions"
import { siteSettingsSeed } from "./SiteSettingsSeed"
import { UpdateRoleTable } from "./UpdateRolesTable"
import { EmailTemplatesSeed } from "./EmailTemplatesSeed"
import { ChatSlugCorrectionSyncSeed } from "./ChatSlugCorrectionSyncSeed"
import { ShortcutEntityIdSyncSeed } from "./ShortcutEntityIdSyncSeed"
import { EmailTemplatesForCommunityRequestSeed } from "./EmailTemplatesForCommunityRquest"
import { JoinInviteEmailSeed } from "./JoinInviteEmail"
import { ContactUsEmailTemplatesSeed } from "./ContactUsEmailTemplatesSeed"
import { FeatureFlagsSeed } from "./FeatureFlagsSeed"
import { RewardsSeed } from "./RewardsSeed"
import { RewardLevelsSeed } from "./RewardLevelsSeed"
import { BackfillLedgerCommunityIdSeed } from "./BackfillLedgerCommunityIdSeed"
import { DeduplicateUserRolesSeed } from "./DeduplicateUserRolesSeed"

const SEEDERS: Record<string, () => Promise<void>> = {
  FeatureSeed,
  TagSeed,
  PermissionsSeed,
  RolesSeed,
  RolePermissionsSeed,
  UserSeed,
  CommunityCategorySeed,
  UpdateRoleTable,
  CommunityUserListRolePermission,
  NewTagsSeed,
  CheckRolePermissionMismatch,
  SyncRolePermissionsSeeder,
  siteSettingsSeed,
  EmailTemplatesSeed,
  ChatSlugCorrectionSyncSeed,
  ShortcutEntityIdSyncSeed,
  EmailTemplatesForCommunityRequestSeed,
  JoinInviteEmailSeed,
  ContactUsEmailTemplatesSeed,
  FeatureFlagsSeed,
  RewardsSeed,
  RewardLevelsSeed,
  BackfillLedgerCommunityIdSeed,
  DeduplicateUserRolesSeed
}

async function runSeeders() {
  try {
    const args = process.argv.slice(2)
    const excludedSeeders = [
      "UserSeed",
      "UpdateRoleTable",
      "CommunityUserListRolePermission",
      "NewTagsSeed",
      "CheckRolePermissionMismatch",
      "SyncRolePermissionsSeeder",
      "EmailTemplatesSeed",
      "ChatSlugCorrectionSyncSeed",
      "ChatSlugCorrectionSyncSeed",
      "ShortcutEntityIdSyncSeed",
      "EmailTemplatesForCommunityRequestSeed",
      "JoinInviteEmailSeed",
      "ContactUsEmailTemplatesSeed",
      "BackfillLedgerCommunityIdSeed"
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

runSeeders()
