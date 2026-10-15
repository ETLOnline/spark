import { sql } from "drizzle-orm"
import { db } from "../../.."
import { EventsReport } from "@/src/types/Reporting/Reporting.schema"
import {
  RawEventTypeRow,
  RawTotal,
  RawHostRankingRow,
  RawTagRankingRow
} from "@/src/types/Reporting/raw-rows.reporting-types"
import { RANKING_LIMIT } from "../constants"
import { FormatUserName } from "@/src/utils/helpers"

/**
 * Events are fully platform-wide — confirmed no community_id/space_id exists
 * on the events table at all, only host_id. Nothing here scopes by community.
 */
export async function GetEventsReportModule(): Promise<EventsReport> {
  const [
    eventTypeRows,
    registrationsRows,
    hostsTotalRows,
    hostsRankingRows,
    tagsTotalRows,
    tagsRankingRows
  ] = await Promise.all([
    // start_date_time / end_date_time are varchar, not real date columns —
    // guard against null/empty/malformed values before casting, or a bad
    // row throws and kills this whole module.
    db.execute(sql`
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
      `),
    db.execute(sql`select count(*) as total from event_users`),
    db.execute(sql`select count(distinct host_id) as total from events`),
    db.execute(sql`
        select e.host_id, u.first_name, u.last_name, u.email, count(*) as total_events
        from events e
        inner join users u on u.unique_id = e.host_id
        group by e.host_id, u.first_name, u.last_name, u.email
        order by total_events desc
        limit ${RANKING_LIMIT}
      `),
    db.execute(sql`
        select count(distinct tag) as total
        from events, unnest(tags) as tag
        where tags is not null
      `),
    db.execute(sql`
        select tag, count(*) as count
        from events, unnest(tags) as tag
        where tags is not null
        group by tag
        order by count desc
        limit ${RANKING_LIMIT}
      `)
  ])

  const eventType = eventTypeRows[0] as unknown as RawEventTypeRow

  return {
    total: Number(eventType.total),
    type: {
      upcoming: Number(eventType.upcoming),
      completed: Number(eventType.completed),
      registrations: Number((registrationsRows[0] as unknown as RawTotal).total)
    },
    hosts: {
      total: Number((hostsTotalRows[0] as unknown as RawTotal).total),
      ranking: (hostsRankingRows as unknown as RawHostRankingRow[]).map(
        (row) => ({
          host_id: row.host_id,
          user_name: FormatUserName(row.first_name, row.last_name),
          email: row.email,
          total_events: Number(row.total_events)
        })
      )
    },
    tags: {
      total: Number((tagsTotalRows[0] as unknown as RawTotal).total),
      ranking: (tagsRankingRows as unknown as RawTagRankingRow[]).map(
        (row) => ({
          tag: row.tag,
          count: Number(row.count)
        })
      )
    }
  }
}
