"use server"

import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { FormatUserName, isSuperAdmin } from "@/src/utils/helpers"
import {
  GetAdminAdvisorsList,
  GetAdminCompletedFypProjects,
  GetAdminFypFeedback,
  GetAdminFypMilestones,
  GetAdminFypProject
} from "@/src/db/data-access/advisors/query"
import {
  AdminAdvisorRow,
  AdminClosureRating,
  AdminCompletedProjectRow,
  AdminFypProjectDetails,
  AdminProjectMilestone,
  AdvisorFilter,
  isAdvisorFilter,
  PaginatedResult
} from "@/src/types/Advisors/AdminAdvisors"
import { MilestoneStatus } from "@/src/types/Milestone/Milestone"

// Read-only data behind the advisor KPI cards on /admin/analytics/advisors.

const PAGE_SIZE_MAX = 50

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// Only super admins can see advisor analytics.
const getSuperAdmin = async () => {
  const user = await AuthUserAction()
  if (!user || !(await isSuperAdmin(user))) {
    throw new Error("Forbidden", { cause: 403 })
  }
  return user
}

const fullName = (first: string | null, last: string | null) =>
  FormatUserName(first ?? "", last ?? "")

/** DB timestamps are stored as text (e.g. "2026-09-17 19:10:53.5+05"); returns ISO or null. */
const toIso = (value: Date | string | null | undefined) => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const normalizePaging = (page: number, limit: number) => ({
  page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
  limit:
    Number.isFinite(limit) && limit >= 1
      ? Math.min(Math.floor(limit), PAGE_SIZE_MAX)
      : 10
})

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

// ─── Advisors list ───────────────────────────────────────────────────────────

export const GetAdminAdvisorsListAction = CreateServerAction(
  true,
  async (input: {
    filter: AdvisorFilter
    search?: string
    page: number
    limit: number
  }): Promise<ActionResult<PaginatedResult<AdminAdvisorRow>>> => {
    try {
      await getSuperAdmin()
      const filter = isAdvisorFilter(input.filter) ? input.filter : "all"
      const { page, limit } = normalizePaging(input.page, input.limit)

      const { advisors, pagination } = await GetAdminAdvisorsList({
        filter,
        search: input.search,
        page,
        limit
      })

      return {
        success: true,
        data: {
          rows: advisors.map((r) => ({
            id: r.id,
            name: fullName(r.firstName, r.lastName) || r.email,
            email: r.email,
            linkedinUrl: r.linkedinUrl,
            domains: r.domains,
            activeProjects: Number(r.activeProjects),
            completedProjects: Number(r.completedProjects)
          })),
          pagination
        }
      }
    } catch (error) {
      console.error("Error in GetAdminAdvisorsListAction:", error)
      return {
        success: false,
        error: errorMessage(error, "Failed to fetch advisors")
      }
    }
  }
)

// ─── Completed projects ──────────────────────────────────────────────────────

export const GetAdminCompletedProjectsAction = CreateServerAction(
  true,
  async (input: {
    search?: string
    page: number
    limit: number
  }): Promise<ActionResult<PaginatedResult<AdminCompletedProjectRow>>> => {
    try {
      await getSuperAdmin()
      const { page, limit } = normalizePaging(input.page, input.limit)

      const { projects, pagination } = await GetAdminCompletedFypProjects({
        search: input.search,
        page,
        limit
      })

      return {
        success: true,
        data: {
          rows: projects.map((r) => ({
            spaceId: r.spaceId,
            title: r.requestTitle ?? r.spaceName,
            advisorName:
              fullName(r.advisorFirstName, r.advisorLastName) || null,
            students: (r.groupMembers ?? []).map((m) => m.name),
            communityName: r.communityName,
            channelName: r.channelName,
            spaceName: r.spaceName,
            completedAt: toIso(r.completedAt) ?? ""
          })),
          pagination
        }
      }
    } catch (error) {
      console.error("Error in GetAdminCompletedProjectsAction:", error)
      return {
        success: false,
        error: errorMessage(error, "Failed to fetch completed projects")
      }
    }
  }
)

// ─── Project details ─────────────────────────────────────────────────────────

export const GetAdminFypProjectDetailsAction = CreateServerAction(
  true,
  async (
    spaceId: string
  ): Promise<ActionResult<AdminFypProjectDetails | null>> => {
    try {
      await getSuperAdmin()

      const [project, milestoneRows, feedbackRows] = await Promise.all([
        GetAdminFypProject(spaceId),
        GetAdminFypMilestones(spaceId),
        GetAdminFypFeedback(spaceId)
      ])

      if (!project) return { success: true, data: null }

      const milestones: AdminProjectMilestone[] = milestoneRows.map((m) => ({
        id: m.id,
        name: m.name,
        status: m.status as MilestoneStatus,
        startDate: m.start_date,
        endDate: m.end_date,
        files: m.artifacts
          .map((a) => {
            const type =
              a.type as AdminProjectMilestone["files"][number]["type"]
            return type === "link"
              ? { id: a.id, type, name: a.url ?? "Link", url: a.url ?? "" }
              : {
                  id: a.id,
                  type,
                  name: a.file?.file_name ?? "File",
                  url: a.file?.file_path ?? ""
                }
          })
          .filter((f) => f.url)
      }))

      const toRating = (
        f: (typeof feedbackRows)[number]
      ): AdminClosureRating => ({
        submittedBy:
          fullName(
            f.submittedBy?.first_name ?? null,
            f.submittedBy?.last_name ?? null
          ) || "Unknown user",
        rating: f.partner_rating,
        submittedAt: toIso(f.created_at) ?? ""
      })

      // Advisor = the assigned advisor's submission; everyone else is a student.
      const { advisor } = project
      const advisorRow = advisor
        ? feedbackRows.find((f) => f.submitted_by === advisor.id)
        : undefined

      // Milestones are in display order, so the last one decides completion.
      const lastMilestone = milestoneRows.at(-1)
      const studentRows = feedbackRows.filter((f) => f !== advisorRow)

      const data: AdminFypProjectDetails = {
        spaceId: project.spaceId,
        title: project.requestTitle ?? project.spaceName,
        domain: project.domain,
        communityName: project.communityName,
        channelName: project.channelName,
        spaceName: project.spaceName,
        completedAt:
          lastMilestone?.status === MilestoneStatus.VERIFIED
            ? toIso(lastMilestone.updated_at ?? lastMilestone.created_at)
            : null,
        advisor: advisor
          ? {
              id: advisor.id,
              name:
                fullName(advisor.firstName, advisor.lastName) ||
                advisor.email ||
                "Unknown advisor",
              email: advisor.email ?? "",
              linkedinUrl: advisor.linkedinUrl,
              domains: advisor.domains
            }
          : null,
        students: (project.groupMembers ?? []).map((m) => ({
          name: m.name,
          registrationNumber: m.registration_number
        })),
        milestones,
        advisorFeedback: advisorRow ? toRating(advisorRow) : null,
        studentFeedback: studentRows.map(toRating)
      }

      return { success: true, data }
    } catch (error) {
      console.error("Error in GetAdminFypProjectDetailsAction:", error)
      return {
        success: false,
        error: errorMessage(error, "Failed to fetch project details")
      }
    }
  }
)
