import { permissions } from "@/src/utils/constants"
import { and, eq } from "drizzle-orm"
import { db } from "../.."
import { permissionsTable } from "../../schema"

export const getRoleIdsWithPermission = async (
  nameSpace: string,
  action: string
) => {
  const permission = await db.query.permissionsTable.findFirst({
    where: and(
      eq(permissionsTable.namespace, nameSpace),
      eq(permissionsTable.action, action)
    ),
    with: {
      roles: { columns: { role_id: true } }
    }
  })
  return permission?.roles.map((row) => row.role_id) ?? []
}
