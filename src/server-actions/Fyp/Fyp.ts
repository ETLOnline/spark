"use server"

import { CreateServerAction } from ".."
import {
  GetFypAcademicYears,
  GetFypCommunityTitle,
  GetFypDashboardProjects,
  GetFypDashboardStats,
  GetFypDirectory,
  GetFypPlatformStats,
  GetFypProjectDetail,
  GetFypUniversitiesOverview
} from "@/src/db/data-access/fyp/query"
import {
  FypDashboardFilters,
  FypDashboardProject,
  FypDashboardStats,
  FypDashboardStatsFilters,
  FypDirectoryFilters,
  FypDirectoryProject,
  FypPlatformStats,
  FypPlatformStatsFilters,
  FypProjectDetail,
  FypUniversityOverview
} from "@/src/types/Fyp/Fyp"

export const GetFypDashboardProjectsAction = CreateServerAction(
  true,
  async (
    filters: FypDashboardFilters = {},
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      const rows = await GetFypDashboardProjects(filters, page, limit)

      const projects: FypDashboardProject[] = rows.map((row) => ({
        space_id: row.space_id,
        space_slug: row.space_slug,
        channel_slug: row.channel_slug,
        project_name: row.project_name,
        domain: row.domain,
        university_supervisor: row.supervisor_first_name
          ? `${row.supervisor_first_name} ${row.supervisor_last_name}`.trim()
          : null,
        industry_advisor: row.advisor_first_name
          ? `${row.advisor_first_name} ${row.advisor_last_name}`.trim()
          : null,
        request_id: row.request_id,
        request_status: row.request_status,
        milestones_completed: Number(row.milestones_completed),
        milestones_total: Number(row.milestones_total)
      }))

      const total = rows.length > 0 ? Number(rows[0].total_count) : 0

      return {
        success: true,
        data: {
          projects,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching FYP dashboard projects:", error)
      return { success: false, error }
    }
  }
)

export const GetFypDashboardStatsAction = CreateServerAction(
  true,
  async (filters: FypDashboardStatsFilters = {}) => {
    try {
      const row = await GetFypDashboardStats(filters)

      const stats: FypDashboardStats = {
        totalProjects: Number(row.total_projects),
        advisorAssigned: Number(row.advisor_assigned),
        pendingRequests: Number(row.pending_requests),
        withoutAdvisor: Number(row.without_advisor),
        milestonesOverdue: Number(row.milestones_overdue)
      }

      return { success: true, data: stats }
    } catch (error) {
      console.error("Error fetching FYP dashboard stats:", error)
      return { success: false, error }
    }
  }
)

// ── Platform-wide FYP overview (Super Admin) ────────────────────────────────

const splitTechStack = (techStack: string | null): string[] =>
  techStack
    ? techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : []

const joinName = (first: string | null, last: string | null): string | null =>
  first ? `${first} ${last ?? ""}`.trim() : null

export const GetFypUniversitiesOverviewAction = CreateServerAction(
  true,
  async (filters: { academicYear?: string } = {}) => {
    try {
      const rows = await GetFypUniversitiesOverview(filters)

      const universities: FypUniversityOverview[] = rows.map((row) => ({
        communityId: row.community_id,
        title: row.community_title,
        slug: row.community_slug,
        runningCount: Number(row.running_count),
        completedCount: Number(row.completed_count),
        studentsEngaged: Number(row.students_engaged),
        advisorsCount: Number(row.advisors_count),
        topDomain: row.top_domain,
        topDomainCount: Number(row.top_domain_count)
      }))

      return { success: true, data: universities }
    } catch (error) {
      console.error("Error fetching FYP universities overview:", error)
      return { success: false, error }
    }
  }
)

export const GetFypPlatformStatsAction = CreateServerAction(
  true,
  async (filters: FypPlatformStatsFilters = {}) => {
    try {
      const row = await GetFypPlatformStats(filters)

      const runningCount = Number(row.running_count)
      const advisorsCount = Number(row.advisors_count)
      const studentsEngaged = Number(row.students_engaged)

      const stats: FypPlatformStats = {
        universitiesCount: Number(row.universities_count),
        runningCount,
        completedCount: Number(row.completed_count),
        studentsEngaged,
        avgStudentsPerTeam:
          runningCount > 0 ? studentsEngaged / runningCount : 0,
        advisorsCount,
        avgFypsPerAdvisor: advisorsCount > 0 ? runningCount / advisorsCount : 0
      }

      return { success: true, data: stats }
    } catch (error) {
      console.error("Error fetching FYP platform stats:", error)
      return { success: false, error }
    }
  }
)

export const GetFypDirectoryAction = CreateServerAction(
  true,
  async (
    filters: FypDirectoryFilters = {},
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      const rows = await GetFypDirectory(filters, page, limit)

      const projects: FypDirectoryProject[] = rows.map((row) => ({
        spaceId: row.space_id,
        spaceSlug: row.space_slug,
        channelSlug: row.channel_slug,
        projectName: row.project_name,
        universityId: row.community_id,
        universityTitle: row.community_title,
        domain: row.domain,
        techStack: splitTechStack(row.tech_stack),
        teamSize: row.group_members?.length ?? 0,
        universitySupervisor: joinName(
          row.supervisor_first_name,
          row.supervisor_last_name
        ),
        industryAdvisor: joinName(
          row.advisor_first_name,
          row.advisor_last_name
        ),
        requestId: row.request_id,
        requestStatus: row.request_status,
        bucket: row.bucket,
        milestonesCompleted: Number(row.milestones_completed),
        milestonesTotal: Number(row.milestones_total)
      }))

      const total = rows.length > 0 ? Number(rows[0].total_count) : 0

      return {
        success: true,
        data: {
          projects,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching FYP directory:", error)
      return { success: false, error }
    }
  }
)

export const GetFypAcademicYearsAction = CreateServerAction(true, async () => {
  try {
    const years = await GetFypAcademicYears()
    return { success: true, data: years }
  } catch (error) {
    console.error("Error fetching FYP academic years:", error)
    return { success: false, error }
  }
})

export const GetFypProjectDetailAction = CreateServerAction(
  true,
  async (spaceId: string) => {
    try {
      const row = await GetFypProjectDetail(spaceId)
      if (!row) return { success: false, error: "Project not found" }

      const detail: FypProjectDetail = {
        spaceId: row.space_id,
        spaceSlug: row.space_slug,
        channelSlug: row.channel_slug,
        projectName: row.project_name,
        universityTitle: row.community_title,
        domain: row.domain,
        techStack: splitTechStack(row.tech_stack),
        teamMembers: (row.group_members ?? []).map((m) => ({
          name: m.name,
          registrationNumber: m.registration_number
        })),
        universitySupervisor: joinName(
          row.supervisor_first_name,
          row.supervisor_last_name
        ),
        industryAdvisor: joinName(
          row.advisor_first_name,
          row.advisor_last_name
        ),
        industryAdvisorId: row.advisor_id,
        requestStatus: row.request_status,
        bucket: row.bucket,
        abstract: row.abstract,
        problemStatement: row.problem_statement,
        proposalLink: row.proposal_link
      }

      return { success: true, data: detail }
    } catch (error) {
      console.error("Error fetching FYP project detail:", error)
      return { success: false, error }
    }
  }
)

export const GetFypCommunityTitleAction = CreateServerAction(
  true,
  async (communityId: string) => {
    try {
      const title = await GetFypCommunityTitle(communityId)
      return { success: true, data: title }
    } catch (error) {
      console.error("Error fetching FYP community title:", error)
      return { success: false, error }
    }
  }
)
