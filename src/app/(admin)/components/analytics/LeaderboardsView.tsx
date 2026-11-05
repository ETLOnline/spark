"use client"

import { useState } from "react"
import { Medal, Coins, Activity, Trophy } from "lucide-react"
import { useAtomValue } from "jotai"
import {
  AnalyticsPage,
  SnapshotLoading,
  SnapshotUnavailable
} from "./AnalyticsPage"
import { adminAnalyticsStore } from "@/src/store/adminAnalytics/adminAnalyticsStore"
import { KpiCard } from "./KpiCard"
import { RewardTypePanel } from "./RewardTypePanel"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"

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

export default function LeaderboardsView() {
  const snapshot = useAtomValue(adminAnalyticsStore.snapshot)
  const isLoading = useAtomValue(adminAnalyticsStore.LoadingSnapshot)
  const rewards = snapshot?.rewards ?? null
  const [tab, setTab] = useState<TabMode>("rp")

  if (isLoading) return <SnapshotLoading />

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
      label: "Total rewards issued",
      value: (rp_points.total + sc_points.total).toLocaleString(),
      sub: "RP + SC combined",
      icon: Trophy
    },
    {
      label: "Total RP Issued",
      value: rp_points.total.toLocaleString(),
      sub: `${rp_points.actions.total.toLocaleString()} rewarded actions`,
      description:
        "Cumulative Reputation Points awarded to all users since launch.",
      icon: Medal
    },
    {
      label: "Spark Credits",
      value: sc_points.total.toLocaleString(),
      sub: `SC issued · ${sc_points.actions.total.toLocaleString()} actions`,
      icon: Coins
    },
    {
      label: "Rewarded actions",
      value: rewards.total.toLocaleString(),
      sub: "RP + SC actions",
      icon: Activity
    }
  ]

  return (
    <AnalyticsPage
      title="Rewards & leaderboards"
      description="Reputation Points and Spark Credits issued, the actions that earned them, and the top earners."
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
