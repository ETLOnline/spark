import UsersAnalyticsView from "../../../components/analytics/UsersAnalyticsView"
import { GetReportSnapshotAction } from "@/src/server-actions/Reporting/Reporting"

export default async function UsersAnalyticsPage() {
  const { data } = await GetReportSnapshotAction()
  return <UsersAnalyticsView users={data?.snapshot.users ?? null} />
}
