"use client"

import { useState } from "react"
import { Medal, Coins, Activity } from "lucide-react"
import { AnalyticsPage, SnapshotUnavailable } from "./AnalyticsPage"
import { KpiCard } from "./KpiCard"
import { RewardTypePanel } from "./RewardTypePanel"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { RewardsReport } from "@/src/types/Reporting/Reporting.schema"

type TabMode = "rp" | "sc"

const TABS = {
  rp: {
    key: "rp_points",
    label: "Reputation Points",
    short: "RP",
    icon: Medal
  },
  sc: { key: "sc_points", label: "Spark Credits", short: "SC", icon: Coins }
} as const

export default function LeaderboardsView({
  rewards
}: {
  rewards: RewardsReport | null
}) {
  const [tab, setTab] = useState<TabMode>("rp")

  if (!rewards) {
    return (
      <AnalyticsPage title="Rewards & leaderboards">
        <SnapshotUnavailable />
      </AnalyticsPage>
    )
  }

  const { rp_points, sc_points } = rewards.types
  const active = TABS[tab]

  const kpis = [
    {
      label: "Rewarded actions",
      value: rewards.total.toLocaleString(),
      sub: "RP + SC ledger transactions",
      icon: Activity
    },
    {
      label: "Reputation Points",
      value: rp_points.total.toLocaleString(),
      sub: `RP held · ${rp_points.actions.total.toLocaleString()} actions`,
      icon: Medal
    },
    {
      label: "Spark Credits",
      value: sc_points.total.toLocaleString(),
      sub: `SC held · ${sc_points.actions.total.toLocaleString()} actions`,
      icon: Coins
    }
  ]

  return (
    <AnalyticsPage
      title="Rewards & leaderboards"
      description="Reputation Points and Spark Credits held, the actions that earned them, and the top earners."
    >
      <KpiCard items={kpis} />

      {/* RP / SC switch */}
      <Tabs value={tab} onValueChange={(value) => setTab(value as TabMode)}>
        <TabsList className="max-w-full justify-start overflow-x-auto hide-scrollbar">
          {(Object.keys(TABS) as TabMode[]).map((mode) => {
            const { label, icon: Icon } = TABS[mode]
            return (
              <TabsTrigger key={mode} value={mode} className="gap-2">
                <Icon className="w-4 h-4" />
                {label}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* Same panel for both tabs; `key` resets its pagination on tab change. */}
      <RewardTypePanel
        key={tab}
        block={rewards.types[active.key]}
        label={active.label}
        short={active.short}
      />
    </AnalyticsPage>
  )
}
