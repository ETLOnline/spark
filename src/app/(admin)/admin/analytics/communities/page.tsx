import CommunitiesAnalyticsView from "../../../components/analytics/CommunitiesAnalyticsView"
import { GetReportSnapshotAction } from "@/src/server-actions/Reporting/Reporting"

export default async function CommunitiesAnalyticsPage() {
  const { data } = await GetReportSnapshotAction()
  return (
    <CommunitiesAnalyticsView
      communities={data?.snapshot.communities ?? null}
    />
  )
}
