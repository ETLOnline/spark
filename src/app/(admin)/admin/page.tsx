import OverviewView from "../components/analytics/OverviewView"
import { GetReportSnapshotAction } from "@/src/server-actions/Reporting/Reporting"

export default async function AdminDashboard() {
  const { data } = await GetReportSnapshotAction()
  return <OverviewView snapshot={data?.snapshot ?? null} />
}
