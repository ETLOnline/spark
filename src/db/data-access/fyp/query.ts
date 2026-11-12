import { sql } from "drizzle-orm"
import { db } from "../.."
import { AdvisorRequestStatus } from "@/src/types/AdvisorRequest/AdvisorRequest"
import { MilestoneStatus } from "@/src/types/Milestone/Milestone"
import {
  FypDashboardFilters,
  FypDashboardStatsFilters,
  FypDirectoryFilters,
  FypPlatformStatsFilters,
  RawFypDashboardRow,
  RawFypDashboardStats,
  RawFypDirectoryRow,
  RawFypPlatformStats,
  RawFypProjectDetail,
  RawFypUniversityOverviewRow
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
      
        select count(*)
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

// ── Platform-wide FYP overview (Super Admin) ────────────────────────────────
// Live queries backing /admin/analytics/fyp/**. Independent of the two
// functions above (which stay scoped to the single-community Faculty
// Dashboard) — these aggregate across every FYP-enabled community.

/** "r" is whatever alias advisor_requests is given at each call site. */
const academicYearCase = (alias: string) =>
  sql.raw(`
    case
      when extract(month from ${alias}.created_at::timestamp) >= 8
        then extract(year from ${alias}.created_at::timestamp)::int::text || '-' ||
          lpad(((extract(year from ${alias}.created_at::timestamp)::int + 1) % 100)::text, 2, '0')
      else (extract(year from ${alias}.created_at::timestamp)::int - 1)::text || '-' ||
        lpad((extract(year from ${alias}.created_at::timestamp)::int % 100)::text, 2, '0')
    end
  `)

/**
 * One row per space's latest advisor_requests row, enriched with its
 * computed academic_year, team_size, milestone totals, derived bucket
 * ("running" | "completed" | null — see FypBucket), domain name, and
 * university-supervisor/industry-advisor names. Shared base for the three
 * aggregation queries below so "running"/"completed" can never drift between
 * the KPI cards, the universities table, and the directory.
 */
const fypEnrichedCte = sql`
  project_buckets as (
    select
      r.id as request_id,
      r.space_id,
      r.status as request_status,
      r.domain_tag_id,
      r.accepted_by,
      r.tech_stack,
      r.group_members,
      ${academicYearCase("r")} as academic_year,
      coalesce(jsonb_array_length(r.group_members), 0) as team_size,
      s.space_slug,
      s.space_name,
      ch.channel_slug,
      ch.community_id,
      coalesce(ms.total, 0) as milestones_total,
      coalesce(ms.completed, 0) as milestones_completed,
      case
        when r.status = ${AdvisorRequestStatus.ACCEPTED}
          and coalesce(ms.total, 0) > 0 and ms.total = ms.verified
          then 'completed'
        when r.status = ${AdvisorRequestStatus.ACCEPTED} then 'running'
        else null
      end as bucket
    from (
      select distinct on (space_id) *
      from advisor_requests
      order by space_id, created_at desc
    ) r
    inner join spaces s on s.id = r.space_id
    left join channels ch on ch.channel_id = s.channel_id
    left join lateral (
      select
        count(*) as total,
        count(*) filter (
          where fm.status in (${sql.join(
            COMPLETED_MILESTONE_STATUSES.map((s) => sql`${s}`),
            sql`, `
          )})
        ) as completed,
        -- The project only counts as "completed" once every milestone is
        -- actually VERIFIED — "completed_pending_verification" means
        -- submitted but not yet signed off, so it's still "running".
        count(*) filter (
          where fm.status = ${MilestoneStatus.VERIFIED}
        ) as verified
      from fyp_milestones fm
      where fm.space_id = r.space_id
    ) ms on true
  ),
  enriched as (
    select
      pb.*,
      comm.title as community_title,
      t.name as domain,
      sup.first_name as supervisor_first_name,
      sup.last_name as supervisor_last_name,
      adv.first_name as advisor_first_name,
      adv.last_name as advisor_last_name
    from project_buckets pb
    left join communities comm on comm.id = pb.community_id
    left join tags t on t.id = pb.domain_tag_id
    -- University Supervisor = the first "Space Admin" added to the space.
    left join lateral (
      select su.user_id
      from space_users su
      where su.space_id = pb.space_id and su.role = 'Space Admin'
      order by su.id asc
      limit 1
    ) admin on true
    left join users sup on sup.unique_id = admin.user_id
    -- Industry Advisor = whoever accepted the request; null until accepted.
    left join users adv on adv.unique_id = pb.accepted_by
  )
`

export async function GetFypUniversitiesOverview(
  filters: { academicYear?: string } = {}
): Promise<RawFypUniversityOverviewRow[]> {
  const { academicYear } = filters

  const rows = await db.execute(sql`
    with ${fypEnrichedCte},
    per_university as (
      select
        community_id,
        count(*) filter (where bucket = 'running') as running_count,
        count(*) filter (where bucket = 'completed') as completed_count,
        coalesce(
          sum(team_size) filter (where bucket in ('running', 'completed')),
          0
        ) as students_engaged,
        count(distinct accepted_by) filter (where bucket = 'running')
          as advisors_count
      from enriched
      where community_id is not null
        ${academicYear ? sql`and academic_year = ${academicYear}` : sql``}
      group by community_id
    ),
    domain_counts as (
      select community_id, domain, count(*) as cnt
      from enriched
      where bucket = 'running' and domain is not null
        ${academicYear ? sql`and academic_year = ${academicYear}` : sql``}
      group by community_id, domain
    ),
    top_domain as (
      select distinct on (community_id) community_id, domain, cnt
      from domain_counts
      order by community_id, cnt desc
    )
    select
      c.id as community_id,
      c.title as community_title,
      c.slug as community_slug,
      coalesce(pu.running_count, 0) as running_count,
      coalesce(pu.completed_count, 0) as completed_count,
      coalesce(pu.students_engaged, 0) as students_engaged,
      coalesce(pu.advisors_count, 0) as advisors_count,
      td.domain as top_domain,
      coalesce(td.cnt, 0) as top_domain_count
    from communities c
    left join per_university pu on pu.community_id = c.id
    left join top_domain td on td.community_id = c.id
    where c."is_FYP_enable" = true
    order by coalesce(pu.running_count, 0) desc, c.title asc
  `)

  return rows as unknown as RawFypUniversityOverviewRow[]
}

export async function GetFypPlatformStats(
  filters: FypPlatformStatsFilters = {}
): Promise<RawFypPlatformStats> {
  const { communityId, academicYear, domainTagId, searchTerm } = filters
  const q = searchTerm?.trim() ? `%${searchTerm.trim()}%` : null

  const rows = await db.execute(sql`
    with ${fypEnrichedCte},
    scoped as (
      select *
      from enriched e
      where 1 = 1
        ${communityId ? sql`and e.community_id = ${communityId}` : sql``}
        ${academicYear ? sql`and e.academic_year = ${academicYear}` : sql``}
        ${domainTagId ? sql`and e.domain_tag_id = ${domainTagId}` : sql``}
        ${
          q
            ? sql`and (
                e.space_name ilike ${q}
                or e.advisor_first_name ilike ${q}
                or e.advisor_last_name ilike ${q}
                or e.tech_stack ilike ${q}
              )`
            : sql``
        }
    )
    select
      count(distinct community_id) filter (where bucket = 'running')
        as universities_count,
      count(*) filter (where bucket = 'running') as running_count,
      count(*) filter (where bucket = 'completed') as completed_count,
      coalesce(sum(team_size) filter (where bucket = 'running'), 0)
        as students_engaged,
      count(distinct accepted_by) filter (where bucket = 'running')
        as advisors_count
    from scoped
  `)

  return rows[0] as unknown as RawFypPlatformStats
}

export async function GetFypDirectory(
  filters: FypDirectoryFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<RawFypDirectoryRow[]> {
  const { communityId, academicYear, domainTagId, bucket, searchTerm } = filters
  const offset = (page - 1) * limit
  const q = searchTerm?.trim() ? `%${searchTerm.trim()}%` : null

  const rows = await db.execute(sql`
    with ${fypEnrichedCte},
    filtered as (
      select *, count(*) over () as total_count
      from enriched e
      where 1 = 1
        ${communityId ? sql`and e.community_id = ${communityId}` : sql``}
        ${academicYear ? sql`and e.academic_year = ${academicYear}` : sql``}
        ${domainTagId ? sql`and e.domain_tag_id = ${domainTagId}` : sql``}
        ${bucket ? sql`and e.bucket = ${bucket}` : sql`and e.bucket is not null`}
        ${
          q
            ? sql`and (
                e.space_name ilike ${q}
                or e.advisor_first_name ilike ${q}
                or e.advisor_last_name ilike ${q}
                or e.tech_stack ilike ${q}
              )`
            : sql``
        }
      order by e.space_name asc
      limit ${limit} offset ${offset}
    )
    select
      space_id,
      space_slug,
      channel_slug,
      space_name as project_name,
      community_id,
      community_title,
      domain,
      tech_stack,
      group_members,
      supervisor_first_name,
      supervisor_last_name,
      advisor_first_name,
      advisor_last_name,
      request_id,
      request_status,
      bucket,
      milestones_total,
      milestones_completed,
      total_count
    from filtered
  `)

  return rows as unknown as RawFypDirectoryRow[]
}

export async function GetFypAcademicYears(): Promise<string[]> {
  const rows = await db.execute(sql`
    select distinct ${academicYearCase("r")} as academic_year
    from advisor_requests r
    order by academic_year desc
  `)

  return (rows as unknown as { academic_year: string }[]).map(
    (r) => r.academic_year
  )
}

export async function GetFypProjectDetail(
  spaceId: string
): Promise<RawFypProjectDetail | null> {
  const rows = await db.execute(sql`
    with latest as (
      select distinct on (space_id) *
      from advisor_requests
      where space_id = ${spaceId}
      order by space_id, created_at desc
    )
    select
      s.id as space_id,
      s.space_slug,
      s.space_name as project_name,
      ch.channel_slug,
      c.title as community_title,
      t.name as domain,
      r.tech_stack,
      r.group_members,
      r.abstract,
      r.problem_statement,
      r.proposal_link,
      r.status as request_status,
      r.accepted_by as advisor_id,
      sup.first_name as supervisor_first_name,
      sup.last_name as supervisor_last_name,
      adv.first_name as advisor_first_name,
      adv.last_name as advisor_last_name,
      coalesce(ms.total, 0) as milestones_total,
      coalesce(ms.completed, 0) as milestones_completed,
      case
        when r.status = ${AdvisorRequestStatus.ACCEPTED}
          and coalesce(ms.total, 0) > 0 and ms.total = ms.verified
          then 'completed'
        when r.status = ${AdvisorRequestStatus.ACCEPTED} then 'running'
        else null
      end as bucket
    from latest r
    inner join spaces s on s.id = r.space_id
    left join channels ch on ch.channel_id = s.channel_id
    left join communities c on c.id = ch.community_id
    left join tags t on t.id = r.domain_tag_id
    left join lateral (
      select su.user_id
      from space_users su
      where su.space_id = r.space_id and su.role = 'Space Admin'
      order by su.id asc
      limit 1
    ) admin on true
    left join users sup on sup.unique_id = admin.user_id
    left join users adv on adv.unique_id = r.accepted_by
    left join lateral (
      select
        count(*) as total,
        count(*) filter (
          where fm.status in (${sql.join(
            COMPLETED_MILESTONE_STATUSES.map((s) => sql`${s}`),
            sql`, `
          )})
        ) as completed,
        count(*) filter (
          where fm.status = ${MilestoneStatus.VERIFIED}
        ) as verified
      from fyp_milestones fm
      where fm.space_id = r.space_id
    ) ms on true
  `)

  return (rows[0] as unknown as RawFypProjectDetail) ?? null
}

/** Just the title, for the per-community FYP directory page's header. */
export async function GetFypCommunityTitle(
  communityId: string
): Promise<string | null> {
  const rows = await db.execute(sql`
    select title
    from communities
    where id = ${communityId}
    limit 1
  `)

  return (rows[0] as unknown as { title: string } | undefined)?.title ?? null
}
