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
