import { sql } from "drizzle-orm"
import { db } from "../index"

export const CheckRolePermissionMismatch = async () => {
  const slugsToCheck: string[] = [
    "community_admin",
    "community_editor",
    "community_viewer",
    "channel_admin",
    "channel_editor",
    "channel_viewer",
    "space_admin",
    "space_editor",
    "space_viewer",
    "project_admin",
    "project_editor",
    "project_viewer"
  ]

  const arrayLiteral = `'{${slugsToCheck.join(",")}}'`

  const result = await db.execute(sql`
    SELECT DISTINCT scoped.id AS scoped_role_id,
                    scoped.name AS scoped_role_name,
                    scoped.slug
    FROM roles AS scoped
    JOIN roles AS def
      ON scoped.slug = def.slug AND def.role_type = 'DEFAULT'
    WHERE scoped.role_type = 'SCOPED'
      AND scoped.slug = ANY(${sql.raw(arrayLiteral)})
      AND (
        EXISTS (
          SELECT 1
          FROM role_permissions AS def_rp
          WHERE def_rp.role_id = def.id
            AND NOT EXISTS (
              SELECT 1
              FROM role_permissions AS scoped_rp
              WHERE scoped_rp.role_id = scoped.id
                AND scoped_rp.permission_id = def_rp.permission_id
            )
        )
        OR
        EXISTS (
          SELECT 1
          FROM role_permissions AS scoped_rp
          WHERE scoped_rp.role_id = scoped.id
            AND NOT EXISTS (
              SELECT 1
              FROM role_permissions AS def_rp
              WHERE def_rp.role_id = def.id
                AND def_rp.permission_id = scoped_rp.permission_id
            )
        )
      );
  `)

  const rows = (result as any).rows ?? result

  if (rows.length === 0) {
    console.log("✅ All scoped roles are in sync with their default roles.")
  } else {
    console.log("❌ Mismatched Scoped Roles Detected:")
    rows.forEach((row: any) => {
      console.log(
        `- ${row.slug} (ID: ${row.scoped_role_id}) → ${row.scoped_role_name}`
      )
    })
  }
}
