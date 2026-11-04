import { desc, eq } from "drizzle-orm"
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
 * Every cron run inserts a new "admin_report" row — a history of snapshots,
 * not one row overwritten in place. GetReportSnapshot always reads the most
 * recent one.
 */
export async function SaveReportSnapshot(
  snapshot: PersistedReportSnapshot
): Promise<SelectAdminReportSnapshot> {
  try {
    const [row] = await db
      .insert(snapshotsTable)
      .values({ type: ADMIN_REPORT_SNAPSHOT_TYPE, snapshot })
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
      where: eq(snapshotsTable.type, ADMIN_REPORT_SNAPSHOT_TYPE),
      orderBy: desc(snapshotsTable.created_at)
    })
    return row as unknown as SelectAdminReportSnapshot | undefined
  } catch (error: any) {
    throw new Error(error.message)
  }
}
