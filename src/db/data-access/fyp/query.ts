import { sql } from "drizzle-orm"
import { db } from "../.."
import { AdvisorRequestStatus } from "@/src/types/AdvisorRequest/AdvisorRequest"
import { MilestoneStatus } from "@/src/types/Milestone/Milestone"
import {
  FypDashboardFilters,
  FypDashboardStatsFilters,
  RawFypDashboardRow,
  RawFypDashboardStats
} from "@/src/types/Fyp/Fyp"


const COMPLETED_MILESTONE_STATUSES = [
  MilestoneStatus.COMPLETED_PENDING_VERIFICATION,
  MilestoneStatus.VERIFIED
]

export async function GetFypDashboardProjects(
  filters: FypDashboardFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<RawFypDashboardRow[]> {
  const { communityId, searchTerm, domainTagId, status } = filters
  const offset = (page - 1) * limit

  const rows = await db.execute(sql`
    with latest_request as (
      -- A space can be re-requested after a rejection/expiry, so a plain
      -- join to advisor_requests would duplicate spaces with more than one
      -- request. Keep only each space's most recent one.
      select distinct on (r.space_id)
        r.id as request_id,
        r.space_id,
        r.status as request_status,
        r.domain_tag_id,
        r.accepted_by
      from advisor_requests r
      order by r.space_id, r.created_at desc
    ),
    filtered_projects as (
      -- Every filter lives here, and total_count is captured before the
      -- limit/offset slice below, so this is the only place that scans
      -- spaces/channels/latest_request for the whole (unpaginated) result.
      select
        s.id as space_id,
        s.space_slug,
        s.space_name,
        ch.channel_slug,
        lr.request_id,
        lr.request_status,
        lr.domain_tag_id,
        lr.accepted_by,
        count(*) over () as total_count
      from latest_request lr
      inner join spaces s on s.id = lr.space_id
      left join channels ch on ch.channel_id = s.channel_id
      where 1 = 1
        ${communityId ? sql`and ch.community_id = ${communityId}` : sql``}
        ${searchTerm ? sql`and s.space_name ilike ${`%${searchTerm}%`}` : sql``}
        ${domainTagId ? sql`and lr.domain_tag_id = ${domainTagId}` : sql``}
        ${status ? sql`and lr.request_status = ${status}` : sql``}
      order by s.space_name asc
      limit ${limit} offset ${offset}
    )
    select
      fp.space_id,
      fp.space_slug,
      fp.space_name as project_name,
      fp.channel_slug,
      fp.request_id,
      fp.request_status,
      fp.total_count,
      t.name as domain,
      sup.first_name as supervisor_first_name,
      sup.last_name as supervisor_last_name,
      adv.first_name as advisor_first_name,
      adv.last_name as advisor_last_name,
      coalesce(milestones.total, 0) as milestones_total,
      coalesce(milestones.completed, 0) as milestones_completed
    from filtered_projects fp
    left join tags t on t.id = fp.domain_tag_id
    -- University Supervisor = the first "Space Admin" added to the space.
    -- Multiple admins can exist for a space, so we only take the earliest.
    left join lateral (
      select su.user_id
      from space_users su
      where su.space_id = fp.space_id and su.role = 'Space Admin'
      order by su.id asc
      limit 1
    ) admin on true
    left join users sup on sup.unique_id = admin.user_id
    -- Industry Advisor = whoever accepted the request; null until accepted.
    left join users adv on adv.unique_id = fp.accepted_by
    left join lateral (
      select
        count(*) as total,
        count(*) filter (
          where fm.status in (${sql.join(
            COMPLETED_MILESTONE_STATUSES.map((s) => sql`${s}`),
            sql`, `
          )})
        ) as completed
      from fyp_milestones fm
      where fm.space_id = fp.space_id
    ) milestones on true
    order by fp.space_name asc
  `)

  return rows as unknown as RawFypDashboardRow[]
}

export async function GetFypDashboardStats(
  filters: FypDashboardStatsFilters = {}
): Promise<RawFypDashboardStats> {
  const { communityId } = filters

  const rows = await db.execute(sql`
    with latest_request as (
      select distinct on (r.space_id)
        r.space_id,
        r.status as request_status
      from advisor_requests r
      order by r.space_id, r.created_at desc
    ),
    scoped as (
      select lr.space_id, lr.request_status
      from latest_request lr
      inner join spaces s on s.id = lr.space_id
      left join channels ch on ch.channel_id = s.channel_id
      where 1 = 1
        ${communityId ? sql`and ch.community_id = ${communityId}` : sql``}
    )
    select
      count(*) as total_projects,
      count(*) filter (
        where scoped.request_status = ${AdvisorRequestStatus.ACCEPTED}
      ) as advisor_assigned,
      count(*) filter (
        where scoped.request_status in (${sql.join(
          [
            AdvisorRequestStatus.PENDING,
            AdvisorRequestStatus.AWAITING_APPROVAL
          ].map((s) => sql`${s}`),
          sql`, `
        )})
      ) as pending_requests,
      count(*) filter (
        where scoped.request_status != ${AdvisorRequestStatus.ACCEPTED}
      ) as without_advisor,
      (
        -- Projects with at least one milestone whose deadline has passed
        -- without being marked done — counted separately from the CTE
        -- above since it's a distinct space_id count over a different
        -- table, not a filter over scoped itself.
        select count(distinct fm.space_id)
        from fyp_milestones fm
        inner join scoped on scoped.space_id = fm.space_id
        where fm.end_date is not null
          and fm.end_date <> ''
          and fm.end_date::date < current_date
          and fm.status not in (${sql.join(
            COMPLETED_MILESTONE_STATUSES.map((s) => sql`${s}`),
            sql`, `
          )})
      ) as milestones_overdue
    from scoped
  `)

  return rows[0] as unknown as RawFypDashboardStats
}
