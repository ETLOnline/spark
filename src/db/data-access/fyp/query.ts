import { sql } from "drizzle-orm"
import { db } from "../.."
import { AdvisorRequestStatus } from "@/src/types/AdvisorRequest/AdvisorRequest"
import { MilestoneStatus } from "@/src/types/Milestone/Milestone"
import {
  FypDashboardFilters,
  FypDashboardStatsFilters,
  FypPlatformStatsFilters,
  FypSpacesFilters,
  RawFypDashboardRow,
  RawFypDashboardStats,
  RawFypPlatformStats,
  RawFypProjectDetail,
  RawFypSpaceRow,
  RawFypUniversityOverviewRow
} from "@/src/types/Fyp/Fyp"

const COMPLETED_MILESTONE_STATUSES = [
  MilestoneStatus.COMPLETED_PENDING_VERIFICATION,
  MilestoneStatus.VERIFIED
]

/**
 * Shared search condition over the `fyp_spaces`/`enriched` CTEs (aliased
 * `e`), used by GetFypSpaces and GetFypPlatformStats so the project list and its
 * summary stats never disagree on what matches a search term. Matches
 * first/last name individually (so "Umer" or "Ali" alone still work) AND
 * the concatenated full name (so "Umer Ali" matches too — neither
 * advisor_first_name nor advisor_last_name alone contains the full
 * two-word string).
 */
const buildFypSearchCondition = (searchTerm?: string) => {
  const q = searchTerm?.trim() ? `%${searchTerm.trim()}%` : null
  if (!q) return sql``

  return sql`and (
    e.space_name ilike ${q}
    or e.advisor_first_name ilike ${q}
    or e.advisor_last_name ilike ${q}
    or (trim(e.advisor_first_name) || ' ' || trim(e.advisor_last_name)) ilike ${q}
    or e.tech_stack ilike ${q}
  )`
}

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

/**
 * One row per FYP-enabled space (spaces."is_FYP_enable" = true), whether or
 * not it has ever raised an advisor request. The latest request, when there
 * is one, supplies domain/tech stack/team/advisor. Backs every space-driven
 * FYP figure: running/completed counts, students engaged, the
 * per-university directory and the completed listing.
 *
 * A space is "completed" when its last milestone (highest order_index, newest
 * created breaks ties — same order as lastMilestoneCte in
 * reporting/advisors) is VERIFIED, regardless of any advisor request. Every
 * other FYP-enabled space is running. academic_year falls back to the
 * space's own created_at when it has no request.
 */
const fypSpacesCte = sql`
  fyp_spaces as (
    select
      s.id as space_id,
      s.space_slug,
      s.space_name,
      ch.channel_slug,
      ch.community_id,
      comm.title as community_title,
      r.id as request_id,
      r.status as request_status,
      r.domain_tag_id,
      r.accepted_by,
      r.tech_stack,
      r.group_members,
      t.name as domain,
      adv.first_name as advisor_first_name,
      adv.last_name as advisor_last_name,
      coalesce(jsonb_array_length(r.group_members), 0) as team_size,
      ${academicYearCase("y")} as academic_year,
      (lm.status = ${MilestoneStatus.VERIFIED}) is true as is_completed
    from spaces s
    inner join channels ch on ch.channel_id = s.channel_id
    left join communities comm on comm.id = ch.community_id
    -- A space can be re-requested after a rejection/expiry; keep only its
    -- most recent request so the space appears once.
    left join lateral (
      select ar.*
      from advisor_requests ar
      where ar.space_id = s.id
      order by ar.created_at desc
      limit 1
    ) r on true
    cross join lateral (
      select coalesce(r.created_at, s.created_at) as created_at
    ) y
    left join tags t on t.id = r.domain_tag_id
    -- Industry Advisor = whoever accepted the request; null until accepted.
    left join users adv on adv.unique_id = r.accepted_by
    left join lateral (
      select fm.status
      from fyp_milestones fm
      where fm.space_id = s.id
      order by fm.order_index desc, fm.created_at desc
      limit 1
    ) lm on true
    where s."is_FYP_enable" = true
  )
`

export async function GetFypUniversitiesOverview(
  filters: { academicYear?: string } = {}
): Promise<RawFypUniversityOverviewRow[]> {
  const { academicYear } = filters

  const rows = await db.execute(sql`
    with ${fypEnrichedCte}, ${fypSpacesCte},
    per_space_university as (
      select
        community_id,
        count(*) filter (where not is_completed) as running_count,
        count(*) filter (where is_completed) as completed_count,
        coalesce(sum(team_size), 0) as students_engaged
      from fyp_spaces
      where community_id is not null
        ${academicYear ? sql`and academic_year = ${academicYear}` : sql``}
      group by community_id
    ),
    per_request_university as (
      select
        community_id,
        count(distinct accepted_by) filter (where bucket = 'running')
          as advisors_count
      from enriched
      where community_id is not null
        ${academicYear ? sql`and academic_year = ${academicYear}` : sql``}
      group by community_id
    ),
    domain_counts as (
      select community_id, domain, count(*) as cnt
      from fyp_spaces
      where not is_completed and domain is not null
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
      coalesce(ps.running_count, 0) as running_count,
      coalesce(ps.completed_count, 0) as completed_count,
      coalesce(ps.students_engaged, 0) as students_engaged,
      coalesce(pr.advisors_count, 0) as advisors_count,
      td.domain as top_domain,
      coalesce(td.cnt, 0) as top_domain_count
    from communities c
    left join per_space_university ps on ps.community_id = c.id
    left join per_request_university pr on pr.community_id = c.id
    left join top_domain td on td.community_id = c.id
    where c."is_FYP_enable" = true
    order by coalesce(ps.running_count, 0) desc, c.title asc
  `)

  return rows as unknown as RawFypUniversityOverviewRow[]
}

export async function GetFypPlatformStats(
  filters: FypPlatformStatsFilters = {}
): Promise<RawFypPlatformStats> {
  const { communityId, academicYear, domainTagId, searchTerm } = filters

  const scopeConditions = sql`
    ${communityId ? sql`and e.community_id = ${communityId}` : sql``}
    ${academicYear ? sql`and e.academic_year = ${academicYear}` : sql``}
    ${domainTagId ? sql`and e.domain_tag_id = ${domainTagId}` : sql``}
    ${buildFypSearchCondition(searchTerm)}
  `

  const rows = await db.execute(sql`
    with ${fypEnrichedCte}, ${fypSpacesCte},
    scoped_spaces as (
      select * from fyp_spaces e where 1 = 1 ${scopeConditions}
    ),
    scoped_requests as (
      select * from enriched e where 1 = 1 ${scopeConditions}
    )
    select
      (
        select count(distinct community_id) filter (where not is_completed)
        from scoped_spaces
      ) as universities_count,
      (
        select count(*) filter (where not is_completed) from scoped_spaces
      ) as running_count,
      (
        select count(*) filter (where is_completed) from scoped_spaces
      ) as completed_count,
      (
        select coalesce(sum(team_size), 0) from scoped_spaces
      ) as students_engaged,
      -- Teams behind students_engaged: spaces with at least one listed
      -- student, so spaces with no request don't drag the average to 0.
      (
        select count(*) filter (where team_size > 0) from scoped_spaces
      ) as teams_count,
      (
        select count(distinct accepted_by) filter (where bucket = 'running')
        from scoped_requests
      ) as advisors_count
  `)

  return rows[0] as unknown as RawFypPlatformStats
}

export async function GetFypAcademicYears(): Promise<string[]> {
  const rows = await db.execute(sql`
    -- Spaces count toward a year by their request date, else their own
    -- created_at (see fypSpacesCte), so offer both.
    select distinct ${academicYearCase("r")} as academic_year
    from (
      select created_at from advisor_requests
      union all
      select created_at from spaces where "is_FYP_enable" = true
    ) r
    order by academic_year desc
  `)

  return (rows as unknown as { academic_year: string }[]).map(
    (r) => r.academic_year
  )
}

/**
 * Driven by the space, so a project with no advisor request still resolves
 * (request fields null). bucket follows the fypSpacesCte rule: completed
 * when the last milestone is VERIFIED, otherwise running.
 */
export async function GetFypProjectDetail(
  spaceId: string
): Promise<RawFypProjectDetail | null> {
  const rows = await db.execute(sql`
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
      case
        when lm.status = ${MilestoneStatus.VERIFIED} then 'completed'
        else 'running'
      end as bucket
    from spaces s
    left join channels ch on ch.channel_id = s.channel_id
    left join communities c on c.id = ch.community_id
    left join lateral (
      select ar.*
      from advisor_requests ar
      where ar.space_id = s.id
      order by ar.created_at desc
      limit 1
    ) r on true
    left join tags t on t.id = r.domain_tag_id
    left join lateral (
      select su.user_id
      from space_users su
      where su.space_id = s.id and su.role = 'Space Admin'
      order by su.id asc
      limit 1
    ) admin on true
    left join users sup on sup.unique_id = admin.user_id
    left join users adv on adv.unique_id = r.accepted_by
    left join lateral (
      select fm.status
      from fyp_milestones fm
      where fm.space_id = s.id
      order by fm.order_index desc, fm.created_at desc
      limit 1
    ) lm on true
    where s.id = ${spaceId}
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

/**
 * FYP directory driven by spaces rather than advisor requests: every
 * FYP-enabled space (fypSpacesCte), whether or not it has ever raised an
 * advisor request. Request fields stay null when it hasn't. Backs the
 * per-university directory (communityId set) and the platform-wide completed
 * listing (status "completed").
 */
export async function GetFypSpaces(
  filters: FypSpacesFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<RawFypSpaceRow[]> {
  const { communityId, domainTagId, searchTerm, status } = filters
  const offset = (page - 1) * limit

  const rows = await db.execute(sql`
    with ${fypSpacesCte}
    select
      e.space_id,
      e.space_slug,
      e.channel_slug,
      e.space_name as project_name,
      e.community_id,
      e.community_title,
      e.domain,
      e.tech_stack,
      e.group_members,
      e.advisor_first_name,
      e.advisor_last_name,
      e.request_id,
      e.request_status,
      e.is_completed,
      count(*) over () as total_count
    from fyp_spaces e
    where 1 = 1
      ${communityId ? sql`and e.community_id = ${communityId}` : sql``}
      ${domainTagId ? sql`and e.domain_tag_id = ${domainTagId}` : sql``}
      ${status === "completed" ? sql`and e.is_completed` : sql``}
      ${status === "running" ? sql`and not e.is_completed` : sql``}
      ${buildFypSearchCondition(searchTerm)}
    order by e.space_name asc
    limit ${limit} offset ${offset}
  `)

  return rows as unknown as RawFypSpaceRow[]
}
