import { z } from "zod"
import { UsersReportSchema } from "./users.reporting-schema"
import { CommunitiesReportSchema } from "./communities.reporting-schema"
import { MentorshipReportSchema } from "./mentorship.reporting-schema"
import { PostsReportSchema } from "./posts.reporting-schema"
import { RewardsReportSchema } from "./rewards.reporting-schema"
import { EventsReportSchema } from "./events.reporting-schema"

/**
 * Source of truth for the admin reporting contract (dashboard_schema.json).
 * Each module's schema lives in its own `<module>.reporting-schema.ts` file;
 * this file composes them into the root contract and is the one every other
 * file in the reporting feature imports from.
 */

export * from "./utilities.reporting-schema"
export * from "./users.reporting-schema"
export * from "./communities.reporting-schema"
export * from "./mentorship.reporting-schema"
export * from "./posts.reporting-schema"
export * from "./rewards.reporting-schema"
export * from "./events.reporting-schema"

/** A fully-successful report, every module populated. Used to validate a single module's own output before it's merged into a snapshot. */
export const AdminReportSnapshotSchema = z.object({
  users: UsersReportSchema,
  communities: CommunitiesReportSchema,
  mentorship: MentorshipReportSchema,
  posts: PostsReportSchema,
  rewards: RewardsReportSchema,
  events: EventsReportSchema
})

/**
 * What actually gets persisted. Any module can independently fail during
 * collection (see BuildAdminReportSnapshot), in which case its whole key is
 * null rather than a half-populated object — this schema reflects that a
 * stored snapshot is never guaranteed fully complete.
 */
export const PersistedReportSnapshotSchema = z.object({
  users: UsersReportSchema.nullable(),
  communities: CommunitiesReportSchema.nullable(),
  mentorship: MentorshipReportSchema.nullable(),
  posts: PostsReportSchema.nullable(),
  rewards: RewardsReportSchema.nullable(),
  events: EventsReportSchema.nullable()
})

export type AdminReportSnapshot = z.infer<typeof AdminReportSnapshotSchema>
export type PersistedReportSnapshot = z.infer<
  typeof PersistedReportSnapshotSchema
>
