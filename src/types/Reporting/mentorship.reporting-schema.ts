import { z } from "zod"
import { RankedUserInfoSchema } from "./utilities.reporting-schema"

export const MentorshipRankingUserSchema = z.object({
  info: RankedUserInfoSchema,
  sessions: z.object({
    total: z.number(),
    completed: z.number(),
    rejected: z.number()
  }),
  feedback: z.object({
    total: z.number()
  })
})

export const MentorshipReportSchema = z.object({
  // Mentor-role users: total headcount, is_mentor_active count, profile.verified
  // count. NOTE: is_mentor_active has no recency logic (title+company filled +
  // ever added >=1 availability slot, no date check) — see module code comment.
  total: z.number(),
  active: z.number(),
  verified: z.number(),
  availability: z.object({
    total_slots: z.number()
  }),
  sessions: z.object({
    total: z.number(),
    // "completed" comes from profile.total_completed_sessions (same counter
    // the public /mentors listing shows), not a session_requests.status
    // value. "pending" is derived (total - rejected - completed), so this is
    // an approximation, not an exact row-level breakdown.
    pending: z.number(),
    completed: z.number(),
    rejected: z.number()
  }),
  feedback: z.object({
    total: z.number()
  }),
  ranking: z.object({
    users: z.array(MentorshipRankingUserSchema)
  })
})

export type MentorshipReport = z.infer<typeof MentorshipReportSchema>
