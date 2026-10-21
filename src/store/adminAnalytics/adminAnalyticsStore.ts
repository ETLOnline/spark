import { atom } from "jotai"
import { PersistedReportSnapshot } from "@/src/types/Reporting/Reporting.schema"

// Fetched once by the (admin) layout and read by every analytics page.
const snapshot = atom<PersistedReportSnapshot | null>(null)
const LoadingSnapshot = atom<boolean>(true)

export const adminAnalyticsStore = {
  snapshot,
  LoadingSnapshot
}
