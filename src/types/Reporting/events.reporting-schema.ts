import { z } from "zod"

export const EventHostRankingEntrySchema = z.object({
  host_id: z.string(),
  user_name: z.string(),
  email: z.string(),
  total_events: z.number()
})

export const EventTagRankingEntrySchema = z.object({
  tag: z.string(),
  count: z.number()
})

export const EventsReportSchema = z.object({
  total: z.number(),
  // Events are fully platform-wide — no community_id/space_id exists on the
  // events table at all, confirmed against schema.ts.
  type: z.object({
    upcoming: z.number(),
    completed: z.number(),
    registrations: z.number()
  }),
  hosts: z.object({
    total: z.number(),
    ranking: z.array(EventHostRankingEntrySchema)
  }),
  tags: z.object({
    total: z.number(),
    ranking: z.array(EventTagRankingEntrySchema)
  })
})

export type EventsReport = z.infer<typeof EventsReportSchema>
