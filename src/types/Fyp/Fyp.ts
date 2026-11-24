import { AdvisorRequestStatus } from "@/src/types/AdvisorRequest/AdvisorRequest"

export interface FypDashboardFilters {
  communityId?: string
  searchTerm?: string
  domainTagId?: number
  status?: AdvisorRequestStatus
}

export interface RawFypDashboardRow {
  space_id: string
  space_slug: string
  channel_slug: string | null
  project_name: string
  domain: string | null
  supervisor_first_name: string | null
  supervisor_last_name: string | null
  advisor_first_name: string | null
  advisor_last_name: string | null
  request_id: string
  request_status: AdvisorRequestStatus
  total_count: number | string
  milestones_total: number | string
  milestones_completed: number | string
}

export interface FypDashboardProject {
  space_id: string
  space_slug: string
  channel_slug: string | null
  project_name: string
  domain: string | null
  university_supervisor: string | null
  industry_advisor: string | null
  request_id: string
  request_status: AdvisorRequestStatus
  milestones_completed: number
  milestones_total: number
}

export interface FypDashboardStatsFilters {
  communityId?: string
}

export interface RawFypDashboardStats {
  total_projects: number | string
  advisor_assigned: number | string
  pending_requests: number | string
  without_advisor: number | string
  milestones_overdue: number | string
}

export interface FypDashboardStats {
  totalProjects: number
  advisorAssigned: number
  pendingRequests: number
  withoutAdvisor: number
  milestonesOverdue: number
}

// ── Platform-wide FYP overview (Super Admin) ────────────────────────────────
// Distinct from the single-community types above — these back the
// /admin/analytics/fyp pages, which aggregate across every FYP-enabled
// community ("university").

/**
 * Neither value is a stored DB status — both are derived from the latest
 * advisor_requests row per space: "completed" = accepted AND every milestone
 * is specifically VERIFIED (at least one must exist) — a milestone that's
 * merely "completed_pending_verification" doesn't count, since nobody has
 * actually signed off on it yet. "running" = accepted and not completed.
 * Pending/rejected/expired/awaiting-approval requests fall into neither bucket.
 */
export type FypBucket = "running" | "completed"

export interface FypCommonFilters {
  academicYear?: string
  communityId?: string
}

export interface RawFypUniversityOverviewRow {
  community_id: string
  community_title: string
  community_slug: string
  running_count: number | string
  completed_count: number | string
  students_engaged: number | string
  advisors_count: number | string
  top_domain: string | null
  top_domain_count: number | string
}

export interface FypUniversityOverview {
  communityId: string
  title: string
  slug: string
  runningCount: number
  completedCount: number
  studentsEngaged: number
  advisorsCount: number
  topDomain: string | null
  topDomainCount: number
}

export interface FypPlatformStatsFilters extends FypCommonFilters {
  domainTagId?: number
  bucket?: FypBucket
  searchTerm?: string
}

export interface RawFypPlatformStats {
  universities_count: number | string
  running_count: number | string
  completed_count: number | string
  students_engaged: number | string
  teams_count: number | string
  advisors_count: number | string
}

export interface FypPlatformStats {
  universitiesCount: number
  runningCount: number
  completedCount: number
  studentsEngaged: number
  avgStudentsPerTeam: number
  advisorsCount: number
  avgFypsPerAdvisor: number
}

export interface FypSpacesFilters {
  communityId?: string
  domainTagId?: number
  searchTerm?: string
  status?: FypBucket
}

/** One FYP-enabled space; request fields are null when it has none. */
export interface RawFypSpaceRow {
  space_id: string
  space_slug: string
  channel_slug: string
  project_name: string
  community_id: string
  community_title: string | null
  domain: string | null
  tech_stack: string | null
  group_members: { name: string; registration_number: string }[] | null
  advisor_first_name: string | null
  advisor_last_name: string | null
  request_id: string | null
  request_status: AdvisorRequestStatus | null
  is_completed: boolean
  total_count: number | string
}

export interface FypSpace {
  spaceId: string
  spaceSlug: string
  channelSlug: string
  projectName: string
  universityId: string
  universityTitle: string | null
  domain: string | null
  techStack: string[]
  teamSize: number
  industryAdvisor: string | null
  requestId: string | null
  requestStatus: AdvisorRequestStatus | null
  status: FypBucket
}

export interface RawFypProjectDetail {
  space_id: string
  space_slug: string
  channel_slug: string | null
  project_name: string
  community_title: string | null
  domain: string | null
  tech_stack: string | null
  group_members: { name: string; registration_number: string }[] | null
  supervisor_first_name: string | null
  supervisor_last_name: string | null
  advisor_id: string | null
  advisor_first_name: string | null
  advisor_last_name: string | null
  request_status: AdvisorRequestStatus | null
  bucket: FypBucket
  abstract: string | null
  problem_statement: string | null
  proposal_link: string | null
}

export interface FypProjectDetail {
  spaceId: string
  spaceSlug: string
  channelSlug: string | null
  projectName: string
  universityTitle: string | null
  domain: string | null
  techStack: string[]
  teamMembers: { name: string; registrationNumber: string }[]
  universitySupervisor: string | null
  industryAdvisor: string | null
  industryAdvisorId: string | null
  requestStatus: AdvisorRequestStatus | null
  bucket: FypBucket
  abstract: string | null
  problemStatement: string | null
  proposalLink: string | null
}
