export type MentorListStatusFilter = "total" | "active" | "verified"

export interface MentorListFilters {
  status: MentorListStatusFilter
  search?: string
}

export interface RawMentorListRow {
  user_id: string
  first_name: string
  last_name: string
  email: string
  linkedin_url: string | null
  total_completed_sessions: number | string | null
  total_count: number | string
}

export interface MentorListItem {
  id: string
  name: string
  email: string
  linkedinUrl: string | null
  sessionsCompleted: number
}

export type SessionListStatusFilter = "completed" | "pending" | "rejected"

export interface SessionListFilters {
  status?: SessionListStatusFilter
  search?: string
}

export interface RawSessionListRow {
  id: number
  session_date: string
  start_time: string
  end_time: string
  session_type: string
  topic: string
  status: SessionListStatusFilter
  mentor_id: string
  mentor_first_name: string
  mentor_last_name: string
  mentor_email: string
  mentee_id: string
  mentee_first_name: string
  mentee_last_name: string
  mentee_email: string
  mentor_rating: number | null
  mentee_rating: number | null
  total_count: number | string
}

export interface SessionPartyInfo {
  id: string
  name: string
  email: string
}

export interface SessionListItem {
  id: number
  date: string
  startTime: string
  endTime: string
  mentor: SessionPartyInfo
  mentee: SessionPartyInfo
  topic: string
  status: SessionListStatusFilter
  ratings: {
    mentor: number | null
    mentee: number | null
  }
}

export interface SessionFeedbackEntry {
  rating: number
  comment: string | null
}

export interface SessionDetail extends SessionListItem {
  durationMinutes: number
  sessionType: string
  mentorProfessionalTitle: string | null
  mentorCompany: string | null
  mentorSessionsCompleted: number
  feedback: {
    mentorToMentee: SessionFeedbackEntry | null
    menteeToMentor: SessionFeedbackEntry | null
  }
}

export interface RawAvailabilitySlotRow {
  id: number
  mentor_first_name: string
  mentor_last_name: string
  mentor_email: string
  date: string
  start_time: string
  end_time: string
  session_type: string
  repeat_type: string
  total_count: number | string
}

export interface AvailabilitySlotItem {
  id: number
  mentorName: string
  mentorEmail: string
  date: string
  startTime: string
  endTime: string
  sessionType: string
  repeatType: string
}
