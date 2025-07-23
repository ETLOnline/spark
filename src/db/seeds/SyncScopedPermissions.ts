import { sql } from "drizzle-orm"
import { db } from "../index"

export const SyncRolePermissionsSeeder = async () => {
  console.log("🔄 Starting Role Permissions Sync Seeder...")

  const ROLE_GROUPS: Record<string, string[]> = {
    community: ["community_admin", "community_editor", "community_viewer"],
    channel: ["channel_admin", "channel_editor", "channel_viewer"],
    space: ["space_admin", "space_editor", "space_viewer"],
    project: ["project_admin", "project_editor", "project_viewer"]
  }

  const selectedSlugs = Object.values(ROLE_GROUPS).flat()

  for (const slug of selectedSlugs) {
    console.log(`🔄 Syncing permissions for slug: ${slug}`)

    // Insert missing permissions
    await db.execute(sql`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT scoped.id, rp.permission_id
      FROM roles AS scoped
      JOIN roles AS def ON def.slug = scoped.slug AND def.role_type = 'DEFAULT'
      JOIN role_permissions AS rp ON rp.role_id = def.id
      WHERE scoped.role_type = 'SCOPED'
        AND scoped.slug = ${slug}
        AND NOT EXISTS (
          SELECT 1 FROM role_permissions
          WHERE role_id = scoped.id AND permission_id = rp.permission_id
        );
    `)

    // Remove extra permissions
    await db.execute(sql`
      DELETE FROM role_permissions
      WHERE role_id IN (
        SELECT scoped.id
        FROM roles AS scoped
        WHERE scoped.role_type = 'SCOPED'
          AND scoped.slug = ${slug}
      )
      AND permission_id NOT IN (
        SELECT rp.permission_id
        FROM roles AS def
        JOIN role_permissions AS rp ON rp.role_id = def.id
        WHERE def.role_type = 'DEFAULT'
          AND def.slug = ${slug}
      );
    `)

    console.log(`✅ Synced: ${slug}`)
  }

  console.log("🎉 All scoped roles synced successfully.")
}
