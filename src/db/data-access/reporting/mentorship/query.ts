import { sql } from "drizzle-orm"
import { db } from "../../.."
import {
  RawMentorTotalsRow,
  RawAvailabilityRow,
  RawSessionsRow,
  RawFeedbackRow,
  RawMentorRankingRow
} from "@/src/types/Reporting/raw-rows.reporting-types"
import { RANKING_LIMIT } from "../constants"

/**
 * total/active/verified describe MENTOR-ROLE USERS (role = "Mentor"), not
 * sessions. `active` = profile.is_mentor_active, which has NO recency logic
 * — it's true once title+company are filled and the mentor has EVER added
 * >=1 availability slot, with no date check, so a mentor dormant for a year
 * can still read as "active" here.
 */
export async function GetMentorTotalsRaw(): Promise<RawMentorTotalsRow> {
  const rows = await db.execute(sql`
    select
      count(*) as total,
      count(*) filter (where p.is_mentor_active = true) as active,
      count(*) filter (where p.verified = true) as verified
    from user_roles ur
    inner join roles r on r.id = ur.role_id and r.name = 'Mentor'
    left join profile p on p.user_id = ur.user_id
  `)
  return rows[0] as unknown as RawMentorTotalsRow
}

export async function GetMentorAvailabilityTotalsRaw(): Promise<RawAvailabilityRow> {
  const rows = await db.execute(sql`
    select
      count(*) as total_slots
    from mentor_availability
  `)
  return rows[0] as unknown as RawAvailabilityRow
}

/**
 * "Completed" is not a session_requests.status value — nothing ever writes
 * it. It comes from profile.total_completed_sessions, the same counter the
 * public /mentors listing reads (GetMentors in db/data-access/mentor/query.ts),
 * summed across every Mentor-role user (not just the top-10 shown in the
 * ranking table) so this platform-wide total reflects all mentors.
 * total/rejected are still row counts from session_requests, so
 * total == pending + completed + rejected is an approximation, not exact —
 * "completed" and "total/rejected" come from different sources.
 */
export async function GetMentorSessionTotalsRaw(): Promise<RawSessionsRow> {
  const rows = await db.execute(sql`
    select
      t.total,
      t.rejected,
      c.completed,
      greatest(t.total - t.rejected - c.completed, 0) as pending
    from (
      select
        count(*) as total,
        count(*) filter (where status = 'rejected') as rejected
      from session_requests
    ) t,
    (
      select coalesce(sum(p.total_completed_sessions), 0) as completed
      from user_roles ur
      inner join roles r on r.id = ur.role_id and r.name = 'Mentor'
      inner join profile p on p.user_id = ur.user_id
    ) c
  `)
  return rows[0] as unknown as RawSessionsRow
}

export async function GetMentorFeedbackTotalsRaw(): Promise<RawFeedbackRow> {
  const rows = await db.execute(sql`
    select count(*) as total from mentorship_feedback
  `)
  return rows[0] as unknown as RawFeedbackRow
}

/**
 * Ranked by sessions_completed ("delivered"). This does NOT come from
 * session_requests.status — that column's real values are pending/accepted/
 * rejected/resubmitted/slot_suggested; 'completed' is never written there.
 * "Delivered" comes from profile.total_completed_sessions, the same counter
 * the public /mentors listing reads (GetMentors in
 * db/data-access/mentor/query.ts) — keeps this leaderboard's numbers
 * consistent with what mentors see about themselves. Mentors with zero
 * completed sessions are excluded entirely, not just ranked last.
 */
export async function GetMentorRankingRaw(): Promise<RawMentorRankingRow[]> {
  const rows = await db.execute(sql`
    select
      u.unique_id as user_id,
      u.first_name,
      u.last_name,
      u.email,
      coalesce(s.total, 0) as sessions_total,
      coalesce(p.total_completed_sessions, 0) as sessions_completed,
      coalesce(s.rejected, 0) as sessions_rejected,
      coalesce(f.total, 0) as feedback_total
    from user_roles ur
    inner join roles r on r.id = ur.role_id and r.name = 'Mentor'
    inner join users u on u.unique_id = ur.user_id
    left join profile p on p.user_id = u.unique_id
    left join lateral (
      select
        count(*) as total,
        count(*) filter (where status = 'rejected') as rejected
      from session_requests sr
      where sr.mentor_id = u.unique_id
    ) s on true
    -- "addressed to" this mentor, per mentorship_feedback.recipient_id
    -- (null recipient_id = group-wide feedback, not attributable here).
    left join lateral (
      select count(*) as total
      from mentorship_feedback mf
      where mf.recipient_id = u.unique_id
    ) f on true
    where coalesce(p.total_completed_sessions, 0) > 0
    order by coalesce(p.total_completed_sessions, 0) desc
    limit ${RANKING_LIMIT}
  `)
  return rows as unknown as RawMentorRankingRow[]
}
