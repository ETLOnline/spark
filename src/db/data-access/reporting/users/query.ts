import { sql } from "drizzle-orm"
import { db } from "../../.."
import {
  RawUserTotalsRow,
  RawUserRoleRow
} from "@/src/types/Reporting/raw-rows.reporting-types"

/**
 * users.active / users.inactive / users.online (and the per-role equivalents)
 * are always null: the `users` table has no status, activity, or presence
 * column at all (confirmed against schema.ts — not even a created_at exists).
 * There is nothing to query for these; returning 0 would falsely claim a real
 * measurement was taken. That null-filling is business logic, not a query
 * concern — it happens in GetUsersReportModuleAction, not here.
 */
export async function GetUserTotalsRaw(): Promise<RawUserTotalsRow> {
  const rows = await db.execute(sql`
    select
      count(*) as total,
      count(*) filter (where p.verified = true) as verified,
      count(*) filter (where p.is_profile_completed <> 0) as completed_profiles
    from users u
    left join profile p on p.user_id = u.unique_id
  `)
  return rows[0] as unknown as RawUserTotalsRow
}

/**
 * role_type = GLOBAL excludes scoped roles (Channel Admin, Space Viewer, etc.) — only identity-level roles like Student/Mentor/Faculty belong in this breakdown.
 * Starts from `roles`, not `user_roles` — a left join keeps every GLOBAL role in the result (as a 0 row) even if no user currently holds it, instead of silently dropping it.
 */
export async function GetUserRoleBreakdownRaw(): Promise<RawUserRoleRow[]> {
  const rows = await db.execute(sql`
    select
      r.name as role_name,
      count(ur.user_id) as total,
      count(*) filter (where p.verified = true) as verified,
      count(*) filter (where p.is_profile_completed <> 0) as completed_profiles
    from roles r
    left join user_roles ur on ur.role_id = r.id
    left join profile p on p.user_id = ur.user_id
    where r.role_type in ('GLOBAL')
    group by r.name
  `)
  return rows as unknown as RawUserRoleRow[]
}

/**
 * Raw signup timestamps for the new-user trend, one per profile.
 * profile.created_at is a varchar, not a real date column, so it can hold
 * anything (including hand-edited garbage like "2026-20-10" — shaped like a
 * date, invalid month). No date parsing/casting happens here on purpose: a
 * SQL-side cast (`::date`) throws on an invalid value and takes down the
 * whole query with it. Parsing happens in JS instead (see
 * GetUsersReportModuleAction), where `new Date(x)` never throws — an
 * unparseable value just becomes an `Invalid Date` that's filtered out.
 */
export async function GetProfileSignupTimestampsRaw(): Promise<
  { created_at: string | null }[]
> {
  const rows = await db.execute(sql`select created_at from profile`)
  return rows as unknown as { created_at: string | null }[]
}
