import { and, eq, isNull, sql } from "drizzle-orm"
import { db } from "../index"
import { rolesTable } from "../schema"

export const SyncRolePermissionsSeeder = async () => {
  console.log("🔄 Starting Role Permissions Sync Seeder...")

  const defaultRoles = await db.query.rolesTable.findMany({
    where: and(
      eq(rolesTable.role_type, "DEFAULT"),
      isNull(rolesTable.entity_id),
      isNull(rolesTable.entity_type)
    )
  })

  const defaultRoleSlugs = defaultRoles
    .map((role) => role.slug)
    .filter((r) => r !== null)

  for (const slug of defaultRoleSlugs) {
    console.log(`🔄 Syncing permissions for slug: ${slug}`)

    const result = await db.execute(sql`
      SELECT DISTINCT scoped.id AS scoped_role_id,
                      scoped.name AS scoped_role_name,
                      scoped.slug
      FROM roles AS scoped
      JOIN roles AS def
        ON scoped.slug = def.slug AND def.role_type = 'DEFAULT'
      WHERE scoped.role_type = 'SCOPED'
        AND scoped.slug = ANY(${sql.raw(`'{${slug}}'`)})
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

    if (result.length === 0) {
      console.log(`✅ No conflict found for slug: ${slug}`)
      continue
    } else {
      console.log(`⚠️ ${result.length} Conflict found for slug: ${slug}`)
    }

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
