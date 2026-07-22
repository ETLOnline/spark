export type EngagementStatus = "upcoming" | "overdue" | "completed"

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
  iViewerConfirmed: boolean
  feedbackSubmittedByViewer: boolean
}
