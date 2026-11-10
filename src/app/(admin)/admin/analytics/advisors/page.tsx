import { Suspense } from "react"
import AdvisorsAnalyticsView from "../../../components/analytics/advisors/AdvisorsAnalyticsView"
import { SnapshotLoading } from "../../../components/analytics/AnalyticsPage"

export default function AdvisorsAnalyticsPage() {
  return (
    <Suspense fallback={<SnapshotLoading />}>
      <AdvisorsAnalyticsView />
    </Suspense>
  )
}
