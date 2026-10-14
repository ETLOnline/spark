import {
  UsersReport,
  CommunitiesReport,
  MentorshipReport,
  PostsReport,
  RewardsReport,
  EventsReport
} from "./Reporting.schema"

/**
 * Shared raw-SQL-result row types for every reporting module's data-access
 * query. Centralized here (not inline per query.ts) so the same shape isn't
 * declared more than once. Wherever a raw row's fields are an exact 1:1
 * match for a slice of the real contract, the raw type is DERIVED from that
 * contract type via RawNumeric instead of being hand re-typed, so the two
 * can't drift out of sync.
 *
 * Postgres/node-postgres returns aggregate columns (count/sum) as strings,
 * not numbers — that's the one legitimate reason a raw row's shape differs
 * from its contract counterpart even when every field name matches.
 *
 * Where a raw row is flattened, prefixed, or uses different field names than
 * the contract (e.g. first_name/last_name instead of a combined user_name),
 * it's kept as its own plain interface — deriving it would be inaccurate,
 * not DRY.
 *
 * These are plain TypeScript shapes, not Zod schemas — they describe what
 * comes straight out of `db.execute(sql...)`, before it's mapped into the
 * validated contract (the `*.reporting-schema.ts` files in this folder).
 * They're never runtime-validated themselves; the mapped result is, once
 * it's shaped to match the real schema.
 */
export type RawNumeric<T> = {
  [K in keyof T]: T[K] extends number ? string | number : T[K]
}

/** Used everywhere a query selects a single bare `count(*) as total`. */
export interface RawTotal {
  total: string | number
}

// ─── Users ───────────────────────────────────────────────────────────────────

export type RawUserTotalsRow = RawNumeric<
  Pick<UsersReport, "total" | "verified" | "completed_profiles">
>

export type RawUserRoleRow = { role_name: string } & RawNumeric<
  Pick<
    UsersReport["roles"][string],
    "total" | "verified" | "completed_profiles"
  >
>

// ─── Communities ─────────────────────────────────────────────────────────────

export type RawCommunityTotalsRow = RawNumeric<
  Pick<CommunitiesReport, "total" | "public" | "private">
>

/** Generic {total, active} shape — reused for memberships, channel_users, and space_users, each a different path in the contract with the same shape. */
export interface RawCountActive {
  total: string | number
  active: string | number
}

/** Generic {total, published} shape — reused for channels and spaces. */
export interface RawCountPublished {
  total: string | number
  published: string | number
}

export type RawSpacePostsStatsRow = RawNumeric<
  CommunitiesReport["channels"]["spaces"]["posts"]
>

export type RawFileTypeRow = RawNumeric<
  CommunitiesReport["channels"]["spaces"]["files"]["types"][number]
>

/** Flattened/prefixed version of { total, tasks: { total } } — not 1:1 derivable. */
export interface RawProjectsStatsRow {
  total: string | number
  tasks_total: string | number
}

export type RawCategoryRow = { category_name: string } & RawNumeric<
  CommunitiesReport["categories"][string]
>

export type RawMemberRankingRow = RawNumeric<
  CommunitiesReport["ranking"]["by_members"][number]
>

export type RawPostRankingRow = RawNumeric<
  CommunitiesReport["ranking"]["by_posts"][number]
>

/** Flattened/prefixed version of CommunityStat's nested memberships/channels/posts — not 1:1 derivable. */
export interface RawCommunityStatRow {
  community_id: string
  title: string
  memberships_total: string | number
  memberships_active: string | number
  channels_total: string | number
  spaces_total: string | number
  posts_total: string | number
  posts_comments: string | number
  posts_likes: string | number
}

// ─── Mentorship ──────────────────────────────────────────────────────────────

export type RawMentorTotalsRow = RawNumeric<
  Pick<MentorshipReport, "total" | "active" | "verified">
>

export type RawAvailabilityRow = RawNumeric<MentorshipReport["availability"]>

export type RawSessionsRow = RawNumeric<MentorshipReport["sessions"]>

export type RawFeedbackRow = RawNumeric<MentorshipReport["feedback"]>

/** Flattened (sessions_total/sessions_completed/... as flat keys) + first_name/last_name instead of user_name — not 1:1 derivable. */
export interface RawMentorRankingRow {
  user_id: string
  first_name: string
  last_name: string
  email: string
  sessions_total: string | number
  sessions_completed: string | number
  sessions_rejected: string | number
  feedback_total: string | number
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export type RawGroupCountRow = RawNumeric<PostsReport["by_type"][number]>

export type RawHashtagTopRow = RawNumeric<
  PostsReport["hashtags"]["top"][number]
>

/** Flattened (likes_total/comments_total as flat keys, author fields separate) — not 1:1 derivable. */
export interface RawTopPostRow {
  post_id: string
  user_id: string
  first_name: string
  last_name: string
  likes_total: string | number
  comments_total: string | number
}

/** first_name/last_name instead of a single user_name — not 1:1 derivable. */
export interface RawTopCreatorRow {
  user_id: string
  first_name: string
  last_name: string
  email: string
  total_posts: string | number
}

// ─── Rewards ─────────────────────────────────────────────────────────────────

/** Resolves rewards_metadata.reward_id by its stable internal_name — see GetRewardIdsByInternalName in rewards/query.ts. */
export interface RawRewardIdRow {
  internal_name: string
  reward_id: number
}

/** `count` maps to the contract's `total` field under a renamed key — not 1:1 derivable. */
export interface RawRuleRow {
  action_type: string
  count: string | number
}

/** Heavily flattened/renamed vs. the nested ranking entry contract shape — not 1:1 derivable. */
export interface RawRankingRow {
  user_id: string
  first_name: string
  last_name: string
  email: string
  balance: string | number
  level_id: string | number | null
  level_name: string | null
  actions_total: string | number
  actions_by_type: { action_type: string; count: string | number }[] | null
}

// ─── Events ──────────────────────────────────────────────────────────────────

export type RawEventTypeRow = RawNumeric<
  Pick<EventsReport, "total"> &
    Pick<EventsReport["type"], "upcoming" | "completed">
>

/** first_name/last_name instead of a single user_name — not 1:1 derivable. */
export interface RawHostRankingRow {
  host_id: string
  first_name: string
  last_name: string
  email: string
  total_events: string | number
}

export type RawTagRankingRow = RawNumeric<
  EventsReport["tags"]["ranking"][number]
>
