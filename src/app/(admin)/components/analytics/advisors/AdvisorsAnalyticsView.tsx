"use client"

import { useSearchParams } from "next/navigation"
import { useAtomValue } from "jotai"
import {
  AnalyticsPage,
  SnapshotLoading,
  SnapshotUnavailable
} from "../AnalyticsPage"
import { AdvisorKpiCards } from "./AdvisorKpiCards"
import { AdvisorsTable } from "./AdvisorsTable"
import { adminAnalyticsStore } from "@/src/store/adminAnalytics/adminAnalyticsStore"
import {
  AdvisorFilter,
  isAdvisorFilter
} from "@/src/types/Advisors/AdminAdvisors"

export default function AdvisorsAnalyticsView() {
  const snapshot = useAtomValue(adminAnalyticsStore.snapshot)
  const isLoading = useAtomValue(adminAnalyticsStore.LoadingSnapshot)
  // Snapshots saved before the advisors module existed have no key at all.
  const advisors = snapshot?.advisors ?? null

  const searchParams = useSearchParams()
  const filterParam = searchParams.get("filter")
  const filter: AdvisorFilter = isAdvisorFilter(filterParam)
    ? filterParam
    : "all"
  const search = searchParams.get("search") ?? ""
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  if (isLoading) return <SnapshotLoading />

  return (
    <AnalyticsPage
      title="Advisor analytics"
      description="FYP industry advisors and the projects they supervise. Pick a card to filter the advisors below."
    >
      {advisors ? (
        <AdvisorKpiCards
          active={filter}
          counts={{
            total: advisors.total,
            active: advisors.active,
            verified: advisors.verified,
            projectsCompleted: advisors.projects.completed
          }}
        />
      ) : (
        <SnapshotUnavailable />
      )}
      {/* Remount on filter change so the search box resets with the URL. */}
      <AdvisorsTable key={filter} filter={filter} search={search} page={page} />
    </AnalyticsPage>
  )
}
