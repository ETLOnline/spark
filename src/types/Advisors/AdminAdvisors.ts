import { MilestoneStatus } from "@/src/types/Milestone/Milestone"
import { PaginationType } from "@/src/components/common/types/pagination.type"

/** Filter applied to the admin Advisors list; each maps to one KPI card. */
export const ADVISOR_FILTERS = ["all", "active", "verified"] as const
export type AdvisorFilter = (typeof ADVISOR_FILTERS)[number]

export const isAdvisorFilter = (value: unknown): value is AdvisorFilter =>
  typeof value === "string" &&
  (ADVISOR_FILTERS as readonly string[]).includes(value)

/** Headline counts behind the four advisor KPI cards. */
export type AdvisorCounts = {
  total: number
  active: number
  verified: number
  projectsCompleted: number
}

/** One row of the admin Advisors list. */
export type AdminAdvisorRow = {
  id: string
  name: string
  email: string
  linkedinUrl: string | null
  /** The advisor's domain tags. */
  domains: string[]
  activeProjects: number
  completedProjects: number
}

/** One row of the admin Projects Completed list. An FYP project is a space. */
export type AdminCompletedProjectRow = {
  spaceId: string
  title: string
  advisorName: string | null
  students: string[]
  communityName: string
  channelName: string
  spaceName: string
  /** ISO date the project's last milestone was verified. */
  completedAt: string
}

export type PaginatedResult<T> = {
  rows: T[]
  pagination: PaginationType
}

export type AdminProjectMilestone = {
  id: number
  name: string
  status: MilestoneStatus
  startDate: string | null
  endDate: string | null
  files: {
    id: number
    name: string
    url: string
    type: "image" | "file" | "link"
  }[]
}

/**
 * A closure feedback rating, as it is mirrored to profiles (recommendations):
 * who submitted it, the partner rating and when.
 */
export type AdminClosureRating = {
  submittedBy: string
  rating: number
  submittedAt: string
}

export type AdminFypProjectDetails = {
  spaceId: string
  title: string
  domain: string | null
  communityName: string
  channelName: string
  spaceName: string
  completedAt: string | null
  advisor: {
    id: string
    name: string
    email: string
    linkedinUrl: string | null
    domains: string[]
  } | null
  students: { name: string; registrationNumber: string }[]
  milestones: AdminProjectMilestone[]
  /** Rating the advisor gave the student group; null when not submitted. */
  advisorFeedback: AdminClosureRating | null
  /** One entry per group member; rating is null when they have not submitted. */
  studentFeedback: {
    studentName: string
    feedback: AdminClosureRating | null
  }[]
}
