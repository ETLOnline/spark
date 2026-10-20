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
 * "Completed" is not a session_requests.status value (nothing ever writes it;
 * finished sessions stay "accepted"). It is derived with the same rule as
 * incrementCompletedSessionsIfNowComplete: the mentor confirmed attendance
 * (attendee_confirmations[mentor_id]) AND the mentor submitted feedback.
 * For group sessions the mentor's feedback lives on one row of the slot, so
 * sibling rows (same mentor/slot/date/start) count as completed too — these
 * totals count session ROWS, not distinct sessions. Every non-rejected row
 * that isn't completed folds into pending, keeping
 * total == pending + completed + rejected exact.
 */
export async function GetMentorSessionTotalsRaw(): Promise<RawSessionsRow> {
  const rows = await db.execute(sql`
    with s as (
      select
        sr.status,
        (
          (sr.attendee_confirmations ->> sr.mentor_id) is not null
          and exists (
            select 1
            from mentorship_feedback mf
            inner join session_requests sib on sib.id = mf.session_request_id
            where mf.submitted_by = sr.mentor_id
              and sib.mentor_id = sr.mentor_id
              and sib.session_date is not distinct from sr.session_date
              and sib.start_time is not distinct from sr.start_time
              and sib.availability_slot_id is not distinct from sr.availability_slot_id
          )
        ) as is_completed
      from session_requests sr
    )
    select
      count(*) as total,
      count(*) filter (where status <> 'rejected' and not is_completed) as pending,
      count(*) filter (where status <> 'rejected' and is_completed) as completed,
      count(*) filter (where status = 'rejected') as rejected
    from s
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
 * "Delivered" is derived the same way as GetMentorSessionTotalsRaw above:
 * the mentor confirmed attendance AND submitted feedback for that session
 * (a group session counts once, since the mentor's feedback is stored on a
 * single row). Mentors with zero completed sessions are excluded entirely,
 * not just ranked last.
 */
export async function GetMentorRankingRaw(): Promise<RawMentorRankingRow[]> {
  const rows = await db.execute(sql`
    select
      u.unique_id as user_id,
      u.first_name,
      u.last_name,
      u.email,
      coalesce(s.total, 0) as sessions_total,
      coalesce(s.completed, 0) as sessions_completed,
      coalesce(s.rejected, 0) as sessions_rejected,
      coalesce(f.total, 0) as feedback_total
    from user_roles ur
    inner join roles r on r.id = ur.role_id and r.name = 'Mentor'
    inner join users u on u.unique_id = ur.user_id
    left join lateral (
      select
        count(*) as total,
        count(*) filter (
          where (sr.attendee_confirmations ->> sr.mentor_id) is not null
            and exists (
              select 1
              from mentorship_feedback mf
              where mf.session_request_id = sr.id
                and mf.submitted_by = sr.mentor_id
            )
        ) as completed,
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
    where coalesce(s.completed, 0) > 0
    order by coalesce(s.completed, 0) desc
    limit ${RANKING_LIMIT}
  `)
  return rows as unknown as RawMentorRankingRow[]
}
