import { eq, sql } from "drizzle-orm"
import { db } from "../../.."
import { SelectSnapshot, snapshotsTable } from "../../../schema"
import { PersistedReportSnapshot } from "@/src/types/Reporting/Reporting.schema"

/** This feature's row kind in the shared `snapshots` table. */
export const ADMIN_REPORT_SNAPSHOT_TYPE = "admin_report"

/** `snapshots.snapshot` is untyped at the DB/table level (shared across future snapshot types) — narrowed to PersistedReportSnapshot here, specific to the "admin_report" row. */
export type SelectAdminReportSnapshot = Omit<SelectSnapshot, "snapshot"> & {
  snapshot: PersistedReportSnapshot
}

/**
 * One row for the whole app ("admin_report"), overwritten in place each time
 * the cron regenerates it — not a new row per run. `onConflictDoUpdate`
 * relies on `snapshots.type` being unique (see schema.ts).
 */
export async function SaveReportSnapshot(
  snapshot: PersistedReportSnapshot
): Promise<SelectAdminReportSnapshot> {
  try {
    const [row] = await db
      .insert(snapshotsTable)
      .values({ type: ADMIN_REPORT_SNAPSHOT_TYPE, snapshot })
      .onConflictDoUpdate({
        target: snapshotsTable.type,
        set: { snapshot, updated_at: sql`CURRENT_TIMESTAMP` }
      })
      .returning()
    return row as unknown as SelectAdminReportSnapshot
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function GetReportSnapshot(): Promise<
  SelectAdminReportSnapshot | undefined
> {
  try {
    const row = await db.query.snapshotsTable.findFirst({
      where: eq(snapshotsTable.type, ADMIN_REPORT_SNAPSHOT_TYPE)
    })
    return row as unknown as SelectAdminReportSnapshot | undefined
  } catch (error: any) {
    throw new Error(error.message)
  }
}
