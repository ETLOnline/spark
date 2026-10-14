import { sql } from "drizzle-orm"
import { db } from "../../.."
import { MentorshipReport } from "@/src/types/Reporting/Reporting.schema"
import {
  RawMentorTotalsRow,
  RawAvailabilityRow,
  RawSessionsRow,
  RawFeedbackRow,
  RawMentorRankingRow
} from "@/src/types/Reporting/raw-rows.reporting-types"
import { RANKING_LIMIT } from "../constants"
import { FormatUserName } from "@/src/utils/helpers"

export async function GetMentorshipReportModule(): Promise<MentorshipReport> {
  const [
    totalsRows,
    availabilityRows,
    sessionsRows,
    feedbackRows,
    rankingRows
  ] = await Promise.all([
    // total/active/verified describe MENTOR-ROLE USERS (role = "Mentor"),
    // not sessions. `active` = profile.is_mentor_active, which has NO
    // recency logic — it's true once title+company are filled and the
    // mentor has EVER added >=1 availability slot, with no date check, so
    // a mentor dormant for a year can still read as "active" here.
    db.execute(sql`
        select
          count(*) as total,
          count(*) filter (where p.is_mentor_active = true) as active,
          count(*) filter (where p.verified = true) as verified
        from user_roles ur
        inner join roles r on r.id = ur.role_id and r.name = 'Mentor'
        left join profile p on p.user_id = ur.user_id
      `),
    db.execute(sql`
        select
          count(*) as total_slots,
          count(*) filter (where is_active = true) as active_slots
        from mentor_availability
      `),
    // Real session_requests.status values are pending/accepted/rejected/
    // resubmitted/completed. The contract only has 3 buckets, so accepted
    // and resubmitted (both "not yet in a terminal state") fold into
    // pending — this keeps total == pending + completed + rejected exact.
    db.execute(sql`
        select
          count(*) as total,
          count(*) filter (where status in ('pending', 'accepted', 'resubmitted')) as pending,
          count(*) filter (where status = 'completed') as completed,
          count(*) filter (where status = 'rejected') as rejected
        from session_requests
      `),
    db.execute(sql`
        select count(*) as total from mentorship_feedback
      `),
    db.execute(sql`
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
            count(*) filter (where status = 'completed') as completed,
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
        order by coalesce(s.total, 0) desc
        limit ${RANKING_LIMIT}
      `)
  ])

  const totals = totalsRows[0] as unknown as RawMentorTotalsRow
  const availability = availabilityRows[0] as unknown as RawAvailabilityRow
  const sessions = sessionsRows[0] as unknown as RawSessionsRow
  const feedback = feedbackRows[0] as unknown as RawFeedbackRow

  return {
    total: Number(totals.total),
    active: Number(totals.active),
    verified: Number(totals.verified),
    availability: {
      total_slots: Number(availability.total_slots),
      active_slots: Number(availability.active_slots)
    },
    sessions: {
      total: Number(sessions.total),
      pending: Number(sessions.pending),
      completed: Number(sessions.completed),
      rejected: Number(sessions.rejected)
    },
    feedback: {
      total: Number(feedback.total)
    },
    ranking: {
      users: (rankingRows as unknown as RawMentorRankingRow[]).map((row) => ({
        info: {
          user_name: FormatUserName(row.first_name, row.last_name),
          email: row.email,
          total: Number(row.sessions_total)
        },
        sessions: {
          total: Number(row.sessions_total),
          completed: Number(row.sessions_completed),
          rejected: Number(row.sessions_rejected)
        },
        feedback: {
          total: Number(row.feedback_total)
        }
      }))
    }
  }
}
