import MentorshipAnalyticsView from "../../../components/analytics/MentorshipAnalyticsView"
import { GetReportSnapshotAction } from "@/src/server-actions/Reporting/Reporting"

export default async function MentorshipAnalyticsPage() {
  const { data } = await GetReportSnapshotAction()
  return (
    <MentorshipAnalyticsView mentorship={data?.snapshot.mentorship ?? null} />
  )
}
