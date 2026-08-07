import moment from "moment-timezone"

export type EngagementStatus = "upcoming" | "open" | "overdue" | "completed"

export function deriveEngagementStatus(
  e: Pick<
    Engagement,
    | "sessionDate"
    | "startTime"
    | "endTime"
    | "isViewerConfirmed"
    | "feedbackSubmittedByViewer"
  >
): EngagementStatus {
  const now = moment()
  const start = moment(`${e.sessionDate} ${e.startTime}`, "YYYY-MM-DD HH:mm")
  const end = moment(`${e.sessionDate} ${e.endTime}`, "YYYY-MM-DD HH:mm")
  if (start.isAfter(now)) return "upcoming"
  if (end.isAfter(now)) return "open"
  return e.isViewerConfirmed && e.feedbackSubmittedByViewer
    ? "completed"
    : "overdue"
}

export interface FeedbackItem {
  id: number
  rating: number
  comment: string | null
  visibility: "public" | "private"
  submittedBy: {
    id: string
    name: string
    initials: string
    role: string
    avatarUrl?: string
  }
  recipientId: string | null
  isOwnFeedback: boolean
  createdAt: string
}

export interface Engagement {
  id: number
  topic: string
  description: string
  sessionDate: string // "YYYY-MM-DD"
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  sessionType: "1:1" | "group"
  status: EngagementStatus
  counterpart: {
    name: string
    role: string
    initials: string
    avatarUrl?: string
  }
  spaceId?: string
  spaceName?: string
  spaceSlug?: string
  spaceCreatedBy?: string
  isSpaceArchived?: boolean
  isMentor: boolean
  isViewerConfirmed: boolean
  feedbackSubmittedByViewer: boolean
  // Group sessions (mentor view only): collapsed from N session_request rows
  attendeeCount?: number
  groupSessionRequestIds?: number[]
}
