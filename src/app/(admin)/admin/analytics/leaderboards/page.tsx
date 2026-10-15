import LeaderboardsView from "../../../components/analytics/LeaderboardsView"
import { GetReportSnapshotAction } from "@/src/server-actions/Reporting/Reporting"

export default async function LeaderboardsPage() {
  const { data } = await GetReportSnapshotAction()
  return <LeaderboardsView rewards={data?.snapshot.rewards ?? null} />
}
