"use client"

import { useSearchParams } from "next/navigation"
import { useAtomValue } from "jotai"
import {
  AnalyticsPage,
  SnapshotLoading,
  SnapshotUnavailable
} from "../AnalyticsPage"
import {
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  UserCheck
} from "lucide-react"
import { KpiCard } from "../KpiCard"
import { formatPercent } from "../format"
import { AdvisorsTable } from "./AdvisorsTable"
import { ADVISOR_ROUTES } from "./constants"
import { adminAnalyticsStore } from "@/src/store/adminAnalytics/adminAnalyticsStore"
import { AdvisorFilter } from "@/src/types/Advisors/AdminAdvisors"
import { isAdvisorFilter } from "@/src/utils/adminAdvisors"

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
        <KpiCard
          columns={4}
          items={[
            {
              label: "Total Advisors",
              value: advisors.total.toLocaleString(),
              sub: "Registered as FYP advisors",
              icon: GraduationCap,
              href: ADVISOR_ROUTES.filtered("all"),
              active: filter === "all"
            },
            {
              label: "Active Advisors",
              value: advisors.active.toLocaleString(),
              sub: `${formatPercent(advisors.active, advisors.total)} of advisors`,
              description: "Advisors on at least one ongoing project.",
              icon: UserCheck,
              href: ADVISOR_ROUTES.filtered("active"),
              active: filter === "active"
            },
            {
              label: "Verified Advisors",
              value: advisors.verified.toLocaleString(),
              sub: `${formatPercent(advisors.verified, advisors.total)} of advisors`,
              description: "Advisors with a verified profile.",
              icon: ShieldCheck,
              href: ADVISOR_ROUTES.filtered("verified"),
              active: filter === "verified"
            },
            {
              label: "Projects Completed",
              value: advisors.projects.completed.toLocaleString(),
              sub: "Last milestone done and verified",
              description:
                "FYP projects whose last milestone is completed and verified.",
              icon: CheckCircle2,
              href: ADVISOR_ROUTES.projects
            }
          ]}
        />
      ) : (
        <SnapshotUnavailable />
      )}
      {/* Remount on filter change so the search box resets with the URL. */}
      <AdvisorsTable key={filter} filter={filter} search={search} page={page} />
    </AnalyticsPage>
  )
}
