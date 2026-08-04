import moment from "moment-timezone"

export type EngagementStatus = "upcoming" | "overdue" | "completed"

export function deriveEngagementStatus(
  e: Pick<
    Engagement,
    | "sessionDate"
    | "endTime"
    | "isViewerConfirmed"
    | "feedbackSubmittedByViewer"
  >
): EngagementStatus {
  const end = moment(`${e.sessionDate} ${e.endTime}`, "YYYY-MM-DD HH:mm")
  if (end.isAfter(moment())) return "upcoming"
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
