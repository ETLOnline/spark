import { z } from "zod"

/**
 * Fields with no backing data in the current schema (no activity/presence
 * tracking on `users`) are typed `.nullable()` and must be populated with
 * `null`, never `0` — `0` would falsely claim a real measurement was taken.
 */

export const RoleStatBlockSchema = z.object({
  total: z.number(),
  active: z.number().nullable(),
  verified: z.number(),
  completed_profiles: z.number(),
  online: z.number().nullable()
})

/** One point on a new-user trend line. date is always "YYYY-MM-DD". */
export const NewUsersTrendEntrySchema = z.object({
  date: z.string(),
  count: z.number()
})

export const UsersReportSchema = z.object({
  total: z.number(),
  active: z.number().nullable(),
  inactive: z.number().nullable(),
  verified: z.number(),
  completed_profiles: z.number(),
  online: z.number().nullable(),
  // Keyed dynamically by roles.name (e.g. "Mentor", "Super_Admin") — not a
  // fixed set of keys, the contract's "Mentor" example is illustrative only.
  roles: z.record(z.string(), RoleStatBlockSchema),
  trends: z.object({
    new_users: z.object({
      daily: z.array(NewUsersTrendEntrySchema),
      weekly: z.array(NewUsersTrendEntrySchema),
      monthly: z.array(NewUsersTrendEntrySchema),
      yearly: z.array(NewUsersTrendEntrySchema)
    })
  })
})

export type UsersReport = z.infer<typeof UsersReportSchema>
