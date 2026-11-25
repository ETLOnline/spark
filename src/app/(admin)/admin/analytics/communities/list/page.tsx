import { Suspense } from "react"
import AdminCommunitiesList from "../../../../components/analytics/AdminCommunitiesList"
import { SnapshotLoading } from "../../../../components/analytics/AnalyticsPage"

export default function AdminCommunitiesListPage() {
  return (
    <Suspense fallback={<SnapshotLoading />}>
      <AdminCommunitiesList />
    </Suspense>
  )
}
