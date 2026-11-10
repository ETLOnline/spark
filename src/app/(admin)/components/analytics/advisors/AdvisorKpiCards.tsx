"use client"

import {
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  UserCheck
} from "lucide-react"
import { KpiCard } from "../KpiCard"
import { formatPercent } from "../format"
import { ADVISOR_ROUTES } from "./constants"
import {
  AdvisorCounts,
  AdvisorFilter
} from "@/src/types/Advisors/AdminAdvisors"

interface AdvisorKpiCardsProps {
  counts: AdvisorCounts
  /** Card to highlight: an advisor filter, or "projects" for Projects Completed. */
  active?: AdvisorFilter | "projects"
}

/** The four clickable advisor KPI cards, shared by the overview and drill-down pages. */
export function AdvisorKpiCards({ counts, active }: AdvisorKpiCardsProps) {
  const pctOfAdvisors = (n: number) =>
    `${formatPercent(n, counts.total)} of advisors`

  return (
    <KpiCard
      columns={4}
      items={[
        {
          label: "Total Advisors",
          value: counts.total.toLocaleString(),
          sub: "Registered as FYP advisors",
          icon: GraduationCap,
          href: ADVISOR_ROUTES.filtered("all"),
          active: active === "all"
        },
        {
          label: "Active Advisors",
          value: counts.active.toLocaleString(),
          sub: pctOfAdvisors(counts.active),
          description: "Advisors on at least one ongoing project.",
          icon: UserCheck,
          href: ADVISOR_ROUTES.filtered("active"),
          active: active === "active"
        },
        {
          label: "Verified Advisors",
          value: counts.verified.toLocaleString(),
          sub: pctOfAdvisors(counts.verified),
          description: "Advisors with a verified profile.",
          icon: ShieldCheck,
          href: ADVISOR_ROUTES.filtered("verified"),
          active: active === "verified"
        },
        {
          label: "Projects Completed",
          value: counts.projectsCompleted.toLocaleString(),
          sub: "Last milestone done and verified",
          description:
            "FYP projects whose last milestone is completed and verified.",
          icon: CheckCircle2,
          href: ADVISOR_ROUTES.projects,
          active: active === "projects"
        }
      ]}
    />
  )
}
