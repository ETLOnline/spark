import { rolesTable } from "./../schema"
import { and, eq, inArray, isNull, sql } from "drizzle-orm"
import { db } from "../index"

export const CheckRolePermissionMismatch = async () => {
  const defaultRoles = await db.query.rolesTable.findMany({
    where: and(
      eq(rolesTable.role_type, "DEFAULT"),
      isNull(rolesTable.entity_id),
      isNull(rolesTable.entity_type)
    )
  })

  const defaultRoleSlugs = defaultRoles.map((role) => role.slug)

  const arrayLiteral = `'{${defaultRoleSlugs.join(",")}}'`

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
