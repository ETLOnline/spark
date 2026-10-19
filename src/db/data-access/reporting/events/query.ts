import { sql } from "drizzle-orm"
import { db } from "../../.."
import {
  RawEventTypeRow,
  RawTotal,
  RawHostRankingRow,
  RawTagRankingRow
} from "@/src/types/Reporting/raw-rows.reporting-types"
import { RANKING_LIMIT } from "../constants"

/**
 * start_date_time / end_date_time are varchar, not real date columns —
 * guard against null/empty/malformed values before casting, or a bad row
 * throws and kills this whole module.
 */
export async function GetEventTypeStatsRaw(): Promise<RawEventTypeRow> {
  const rows = await db.execute(sql`
    select
      count(*) as total,
      count(*) filter (
        where start_date_time is not null and start_date_time <> ''
          and start_date_time::date >= current_date
      ) as upcoming,
      count(*) filter (
        where end_date_time is not null and end_date_time <> ''
          and end_date_time::date < current_date
      ) as completed
    from events
  `)
  return rows[0] as unknown as RawEventTypeRow
}

export async function GetEventRegistrationsTotalRaw(): Promise<RawTotal> {
  const rows = await db.execute(sql`
    select count(*) as total from event_users
  `)
  return rows[0] as unknown as RawTotal
}

export async function GetEventHostsTotalRaw(): Promise<RawTotal> {
  const rows = await db.execute(sql`
    select count(distinct host_id) as total from events
  `)
  return rows[0] as unknown as RawTotal
}

/** Events are fully platform-wide — confirmed no community_id/space_id exists on the events table at all, only host_id. */
export async function GetEventHostRankingRaw(): Promise<RawHostRankingRow[]> {
  const rows = await db.execute(sql`
    select e.host_id, u.first_name, u.last_name, u.email, count(*) as total_events
    from events e
    inner join users u on u.unique_id = e.host_id
    group by e.host_id, u.first_name, u.last_name, u.email
    order by total_events desc
    limit ${RANKING_LIMIT}
  `)
  return rows as unknown as RawHostRankingRow[]
}

export async function GetEventTagsTotalRaw(): Promise<RawTotal> {
  const rows = await db.execute(sql`
    select count(distinct tag) as total
    from events, unnest(tags) as tag
    where tags is not null
  `)
  return rows[0] as unknown as RawTotal
}

export async function GetEventTagRankingRaw(): Promise<RawTagRankingRow[]> {
  const rows = await db.execute(sql`
    select tag, count(*) as count
    from events, unnest(tags) as tag
    where tags is not null
    group by tag
    order by count desc
    limit ${RANKING_LIMIT}
  `)
  return rows as unknown as RawTagRankingRow[]
}
