import { sql } from "drizzle-orm"
import { db } from "../../.."
import { UsersReport } from "@/src/types/Reporting/Reporting.schema"
import {
  RawUserTotalsRow,
  RawUserRoleRow
} from "@/src/types/Reporting/raw-rows.reporting-types"

/**
 * users.active / users.inactive / users.online (and the per-role equivalents)
 * are always null: the `users` table has no status, activity, or presence
 * column at all (confirmed against schema.ts — not even a created_at exists).
 * There is nothing to query for these; returning 0 would falsely claim a real
 * measurement was taken.
 */
export async function GetUsersReportModule(): Promise<UsersReport> {
  const [totalsRows, roleRows] = await Promise.all([
    db.execute(sql`
      select
        count(*) as total,
        count(*) filter (where p.verified = true) as verified,
        count(*) filter (where p.is_profile_completed <> 0) as completed_profiles
      from users u
      left join profile p on p.user_id = u.unique_id
    `),
    db.execute(sql`
      select
        r.name as role_name,
        count(*) as total,
        count(*) filter (where p.verified = true) as verified,
        count(*) filter (where p.is_profile_completed <> 0) as completed_profiles
      from user_roles ur
      inner join roles r on r.id = ur.role_id
      left join profile p on p.user_id = ur.user_id
      group by r.name
    `)
  ])

  const totals = totalsRows[0] as unknown as RawUserTotalsRow

  const roles: UsersReport["roles"] = {}
  for (const row of roleRows as unknown as RawUserRoleRow[]) {
    roles[row.role_name] = {
      total: Number(row.total),
      active: null,
      verified: Number(row.verified),
      completed_profiles: Number(row.completed_profiles),
      online: null
    }
  }

  return {
    total: Number(totals.total),
    active: null,
    inactive: null,
    verified: Number(totals.verified),
    completed_profiles: Number(totals.completed_profiles),
    online: null,
    roles
  }
}
