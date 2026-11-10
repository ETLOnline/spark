import { sql } from "drizzle-orm"
import { db } from "../../.."
import {
  RawAdvisorTotalsRow,
  RawFypProjectTotalsRow
} from "@/src/types/Reporting/raw-rows.reporting-types"
import { AdvisorRequestStatus } from "@/src/types/AdvisorRequest/AdvisorRequest"
import { MilestoneStatus } from "@/src/types/Milestone/Milestone"
import { permissions } from "@/src/utils/constants"

/**
 * An advisor is any user who holds the "receive advisor request" permission
 * through any of their roles, whatever the role is (industry partner,
 * mentor, student…). Same namespace/action the advisor-request flow uses to
 * pick eligible advisors (GetEligibleAdvisorsForDomain).
 */
export const ADVISOR_PERMISSION = {
  namespace: "advisory",
  action: permissions.advisory.canReceiveAdvisorRequest
} as const

/** Distinct users holding the advisor permission → (user_id). */
export const advisorUsersCte = sql`
  select distinct ur.user_id
  from permissions p
  inner join role_permissions rp on rp.permission_id = p.id
  inner join user_roles ur on ur.role_id = rp.role_id
  where p.namespace = ${ADVISOR_PERMISSION.namespace}
    and p.action = ${ADVISOR_PERMISSION.action}
`

// An FYP project is a space that has FYP rows (advisor requests, milestones).
// spaces."is_FYP_enable" is NOT filtered on: it only toggles FYP features in
// the UI and can be switched off later, and the faculty FYP dashboard
// (GetFypDashboardProjects) doesn't filter on it either.

/**
 * Each FYP space's last milestone → (space_id, status, updated_at, created_at). "Last" is
 * the highest order_index, the same order the milestone list uses (newest
 * created breaks ties). A space with no milestones has no row here.
 */
export const lastMilestoneCte = sql`
  select distinct on (m.space_id)
    m.space_id,
    m.status,
    m.updated_at,
    m.created_at
  from fyp_milestones m
  order by m.space_id, m.order_index desc, m.created_at desc
`

/**
 * Each FYP space's assigned advisor → (space_id, accepted_by). Only the
 * space's latest advisor request counts (a space can be re-requested after
 * a rejection/expiry), and only when that request was accepted.
 */
export const assignedAdvisorCte = sql`
  select space_id, accepted_by
  from (
    select distinct on (ar.space_id)
      ar.space_id,
      ar.accepted_by,
      ar.status
    from advisor_requests ar
    order by ar.space_id, ar.created_at desc
  ) latest
  where latest.status = ${AdvisorRequestStatus.ACCEPTED}
    and latest.accepted_by is not null
`

/**
 * total    = users with the advisor role
 * verified = of those, profile.verified = true
 * active   = of those, assigned to >= 1 FYP space whose last milestone is not
 *            verified yet (an ongoing project; no milestones counts as ongoing)
 */
export async function GetAdvisorTotalsRaw(): Promise<RawAdvisorTotalsRow> {
  const rows = await db.execute(sql`
    with advisors as (${advisorUsersCte}),
    last_milestone as (${lastMilestoneCte}),
    assigned as (${assignedAdvisorCte}),
    active_advisors as (
      select distinct a.accepted_by as user_id
      from assigned a
      left join last_milestone lm on lm.space_id = a.space_id
      where lm.status is distinct from ${MilestoneStatus.VERIFIED}
    )
    select
      count(*) as total,
      count(*) filter (where aa.user_id is not null) as active,
      count(*) filter (where p.verified = true) as verified
    from advisors adv
    left join profile p on p.user_id = adv.user_id
    left join active_advisors aa on aa.user_id = adv.user_id
  `)
  return rows[0] as unknown as RawAdvisorTotalsRow
}

/** FYP projects (spaces) whose last milestone is done and verified. */
export async function GetFypProjectTotalsRaw(): Promise<RawFypProjectTotalsRow> {
  const rows = await db.execute(sql`
    with last_milestone as (${lastMilestoneCte})
    select count(*) filter (where status = ${MilestoneStatus.VERIFIED}) as completed
    from last_milestone
  `)
  return rows[0] as unknown as RawFypProjectTotalsRow
}
