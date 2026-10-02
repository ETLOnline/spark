"use server"

import { CreateServerAction } from ".."
import {
  GetFypDashboardProjects,
  GetFypDashboardStats
} from "@/src/db/data-access/fyp/query"
import {
  FypDashboardFilters,
  FypDashboardProject,
  FypDashboardStats,
  FypDashboardStatsFilters
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
