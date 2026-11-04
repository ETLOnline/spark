import {
  GetUsersReportModuleAction,
  GetCommunitiesReportModuleAction,
  GetMentorshipReportModuleAction,
  GetPostsReportModuleAction,
  GetRewardsReportModuleAction,
  GetEventsReportModuleAction
} from "@/src/server-actions/Reporting/ReportModules"
import {
  PersistedReportSnapshot,
  PersistedReportSnapshotSchema
} from "@/src/types/Reporting/Reporting.schema"

export type ReportSnapshotStatus = "success" | "partial" | "failed"

export interface BuildAdminReportSnapshotResult {
  status: ReportSnapshotStatus
  snapshot: PersistedReportSnapshot
  moduleErrors: Record<string, string> | null
}

const MODULE_ACTIONS = {
  users: GetUsersReportModuleAction,
  communities: GetCommunitiesReportModuleAction,
  mentorship: GetMentorshipReportModuleAction,
  posts: GetPostsReportModuleAction,
  rewards: GetRewardsReportModuleAction,
  events: GetEventsReportModuleAction
} as const

type ModuleKey = keyof typeof MODULE_ACTIONS

/**
 * Assembles the full admin report by running all 6 module actions
 * independently.
 *
 * Uses Promise.all, not Promise.allSettled — each module action is itself a
 * CreateServerAction, and this codebase's convention is for an action to
 * catch its own errors and resolve with { success: false, error } rather
 * than reject (see ReportModules.ts). So failures show up as a resolved
 * `{ success: false }` value, not a rejected promise; checking `.success`
 * per result is what actually detects a failed module here.
 *
 * A failing module's key is set to `null` in the snapshot (never a
 * half-populated object with some real numbers and some silent zeros) and
 * its error is recorded separately in `moduleErrors` — this is what "a
 * failed module must not silently produce a misleading complete report"
 * means in practice here.
 */
export async function BuildAdminReportSnapshot(): Promise<BuildAdminReportSnapshotResult> {
  const keys = Object.keys(MODULE_ACTIONS) as ModuleKey[]
  const results = await Promise.all(keys.map((key) => MODULE_ACTIONS[key]()))

  const snapshot = {} as Record<ModuleKey, unknown>
  const moduleErrors: Record<string, string> = {}

  results.forEach((result, index) => {
    const key = keys[index]
    if (result.success) {
      snapshot[key] = result.data
    } else {
      snapshot[key] = null
      const error = (result as { success: false; error: unknown }).error
      moduleErrors[key] = error instanceof Error ? error.message : String(error)
    }
  })

  const parsed = PersistedReportSnapshotSchema.safeParse(snapshot)
  const hasModuleErrors = Object.keys(moduleErrors).length > 0

  if (!parsed.success) {
    // A module returned data that doesn't match its own schema — this is a
    // bug in a query module, not a transient failure, so the whole snapshot
    // is marked failed rather than silently persisting malformed data.
    moduleErrors.schema = parsed.error.message
    return {
      status: "failed",
      snapshot: {
        users: null,
        communities: null,
        mentorship: null,
        posts: null,
        rewards: null,
        events: null
      },
      moduleErrors
    }
  }

  const succeededCount = keys.length - Object.keys(moduleErrors).length
  const status: ReportSnapshotStatus =
    succeededCount === keys.length
      ? "success"
      : succeededCount === 0
        ? "failed"
        : "partial"

  return {
    status,
    snapshot: parsed.data,
    moduleErrors: hasModuleErrors ? moduleErrors : null
  }
}
