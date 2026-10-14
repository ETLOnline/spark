"use server"

import { CreateServerAction } from ".."
import { BuildAdminReportSnapshot } from "@/src/services/reporting/BuildAdminReportSnapshot"
import {
  GetReportSnapshot,
  SaveReportSnapshot
} from "@/src/db/data-access/reporting/snapshot/query"

/**
 * Runs the full 6-module aggregation and overwrites the single admin_report
 * row. Triggered by the Azure cron webhook
 * (src/app/api/webhook/report-snapshot-cron) — no Clerk session exists when
 * a cron calls this, so auth is disabled here, matching the existing cron
 * actions (e.g. UpdateCommunityLeaderboardAction).
 *
 * If every module fails, nothing is saved — overwriting the one existing row
 * with all-null data would destroy the last good report for no reason.
 */
export const GenerateReportSnapshotAction = CreateServerAction(
  false,
  async () => {
    try {
      const result = await BuildAdminReportSnapshot()

      if (result.moduleErrors) {
        console.error(
          "Admin report snapshot module errors:",
          result.moduleErrors
        )
      }

      if (result.status === "failed") {
        return { success: false, error: "All report modules failed" }
      }

      const saved = await SaveReportSnapshot(result.snapshot)

      return { success: true, data: saved }
    } catch (error) {
      console.error("Error generating admin report snapshot:", error)
      return { success: false, error }
    }
  }
)

/**
 * Pure read, no computation. Role-gating (Super Admin only) is enforced on
 * the frontend when this is called, not here — see the (admin) layout's
 * existing client-side check.
 */
export const GetReportSnapshotAction = CreateServerAction(true, async () => {
  try {
    const data = await GetReportSnapshot()
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching admin report snapshot:", error)
    return { success: false, error }
  }
})
