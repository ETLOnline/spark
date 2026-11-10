import { Suspense } from "react"
import CompletedProjectsView from "../../../../components/analytics/advisors/CompletedProjectsView"
import { SnapshotLoading } from "../../../../components/analytics/AnalyticsPage"

export default function CompletedProjectsPage() {
  return (
    <Suspense fallback={<SnapshotLoading />}>
      <CompletedProjectsView />
    </Suspense>
  )
}
