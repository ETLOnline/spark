"use client"

import { useState } from "react"
import { Trophy, Medal, Coins, Activity } from "lucide-react"
import { AnalyticsPage } from "./AnalyticsPage"
import { KpiCard } from "./KpiCard"
import { Progress } from "@/src/components/ui/progress"
import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/src/lib/utils"
import PaginationComponent from "@/src/components/common/Pagination"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import {
  RP_ACTIONS,
  SC_ACTIONS,
  ALL_EARNERS,
  ACTION_COLORS,
  LEADERBOARDS_KPIS,
  RP_SUMMARY,
  SC_SUMMARY,
  RANK_BADGE_CLASSES
} from "../../admin/analytics/_data/constants"

const PAGE_SIZE = 4
type TabMode = "rp" | "sc"

const KPIS = [
  {
    label: "Total rewards issued",
    value: LEADERBOARDS_KPIS.total_rewards.toLocaleString(),
    sub: "RP + SC combined",
    icon: Trophy
  },
  {
    label: "Reputation Points",
    value: LEADERBOARDS_KPIS.rp_total.toLocaleString(),
    sub: `RP issued · ${LEADERBOARDS_KPIS.rp_actions.toLocaleString()} actions`,
    icon: Medal
  },
  {
    label: "Spark Credits",
    value: LEADERBOARDS_KPIS.sc_total.toLocaleString(),
    sub: `SC issued · ${LEADERBOARDS_KPIS.sc_actions.toLocaleString()} actions`,
    icon: Coins
  },
  {
    label: "Rewarded actions",
    value: LEADERBOARDS_KPIS.total_actions.toLocaleString(),
    sub: "RP + SC actions",
    icon: Activity
  }
]

export default function LeaderboardsView() {
  const [tab, setTab] = useState<TabMode>("rp")
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(ALL_EARNERS.length / PAGE_SIZE)
  const pageEarners = ALL_EARNERS.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )
  const globalOffset = (page - 1) * PAGE_SIZE

  const actions = tab === "rp" ? RP_ACTIONS : SC_ACTIONS
  const maxCount = actions[0].count
  const summaryLabel = tab === "rp" ? "Reputation Points" : "Spark Credits"

  return (
    <AnalyticsPage
      title="Rewards & leaderboards"
      description="Reputation Points and Spark Credits issued, the actions that earned them, and the top earners."
    >
      <KpiCard columns={4} items={KPIS} />

      {/* RP / SC switch */}
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as TabMode)
          setPage(1)
        }}
      >
        <TabsList className="max-w-full justify-start overflow-x-auto hide-scrollbar">
          <TabsTrigger value="rp" className="gap-2">
            <Medal className="w-4 h-4" />
            Reputation Points
          </TabsTrigger>
          <TabsTrigger value="sc" className="gap-2">
            <Coins className="w-4 h-4" />
            Spark Credits
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Summary + Actions by rule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 [&>*]:min-w-0">
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-0">
            <CardTitle className="text-sm">{summaryLabel} summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-4">
            <div className="grid grid-cols-2 gap-3">
              {(tab === "rp" ? RP_SUMMARY : SC_SUMMARY).map((s) => (
                <Card
                  key={s.label}
                  className="min-w-0 rounded-lg border-0 bg-muted/40 p-3 shadow-none"
                >
                  <CardDescription className="text-xs [overflow-wrap:anywhere]">
                    {s.label}
                  </CardDescription>
                  <CardTitle className="text-xl sm:text-2xl leading-7 sm:leading-8 tracking-normal font-bold mt-0.5 [overflow-wrap:anywhere]">
                    {s.value}
                  </CardTitle>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-5 pb-0 flex flex-col sm:flex-row items-start justify-between gap-1 sm:gap-3 space-y-0">
            <CardTitle className="text-sm">Actions by rule</CardTitle>
            <span className="text-xs text-muted-foreground">
              Times each rule awarded {tab === "rp" ? "RP" : "SC"}
            </span>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-4">
            <div className="flex flex-col gap-3">
              {actions.map((a) => (
                <div
                  key={a.key}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-1.5"
                >
                  <div className="w-full sm:w-36 flex-shrink-0 min-w-0">
                    <p className="text-xs font-medium leading-none [overflow-wrap:anywhere]">
                      {a.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5 [overflow-wrap:anywhere]">
                      {a.key}
                    </p>
                  </div>
                  <Progress
                    value={(a.count / maxCount) * 100}
                    className="flex-1 min-w-0 bg-muted"
                    indicatorClassName="bg-emerald-500 rounded-full transition-none"
                  />
                  <span className="text-sm font-semibold w-14 text-right flex-shrink-0 tabular-nums">
                    {a.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground w-9 text-right flex-shrink-0">
                    {a.pct}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top earners */}
      <Card className="min-w-0">
        <CardHeader className="p-4 sm:p-5 border-b">
          <CardTitle className="text-sm">Top {summaryLabel} earners</CardTitle>
          <CardDescription className="text-xs">
            Users ranked by total {tab === "rp" ? "RP" : "SC"} earned, with
            their current level and the actions that earned it.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="hidden lg:grid lg:grid-cols-[3rem_minmax(0,1fr)_auto_auto_auto] gap-x-4 items-center px-5 py-3 border-b text-xs text-muted-foreground font-medium">
            <span>Rank</span>
            <span>User</span>
            <span className="w-28 text-center">Level</span>
            <span className="w-24 text-right">
              Total {tab === "rp" ? "RP" : "SC"}
            </span>
            <span className="w-16 text-right">Actions</span>
          </div>

          <div className="divide-y">
            {pageEarners.map((e) => (
              <div key={e.rank} className="p-3 sm:p-5 flex flex-col gap-3">
                <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 gap-y-3 lg:grid-cols-[3rem_minmax(0,1fr)_auto_auto_auto] lg:gap-x-4 items-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "w-7 h-7 p-0 rounded-full flex-shrink-0 justify-center text-sm",
                      RANK_BADGE_CLASSES[e.rank] ??
                        "border-transparent text-muted-foreground font-medium"
                    )}
                  >
                    {e.rank}
                  </Badge>
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-10 h-10 rounded-full ${e.avatarBg} text-sm font-bold flex items-center justify-center flex-shrink-0`}
                    >
                      {e.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold truncate" title={e.name}>
                        {e.name}
                      </p>
                      <p
                        className="text-xs text-muted-foreground truncate"
                        title={e.email}
                      >
                        {e.email}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-between gap-3 lg:contents">
                    <span className="min-w-0 lg:w-28 lg:text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium">
                        {e.level}
                      </span>
                    </span>
                    <div className="ml-auto lg:ml-0 w-24 text-right">
                      <p className="text-xl font-bold [overflow-wrap:anywhere]">
                        {e.rp.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        RP earned
                      </p>
                    </div>
                    <div className="w-16 text-right">
                      <p className="text-xl font-bold">{e.actions}</p>
                      <p className="text-[10px] text-muted-foreground">
                        actions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ml-0 lg:ml-[calc(3rem+1rem)] min-w-0 rounded-lg border bg-muted/20 p-3 flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Action types
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {e.breakdown.length} types · {e.actions} actions
                    </span>
                  </div>
                  <div className="flex h-3 rounded-md overflow-hidden gap-px">
                    {e.breakdown.map((b) => (
                      <div
                        key={b.type}
                        className={ACTION_COLORS[b.type] ?? "bg-slate-400"}
                        style={{ width: `${b.pct}%` }}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-1 text-xs">
                    {e.breakdown.map((b) => (
                      <div
                        key={b.type}
                        className="flex min-w-0 items-center gap-1.5"
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${ACTION_COLORS[b.type] ?? "bg-slate-400"}`}
                        />
                        <span className="text-muted-foreground truncate">
                          {b.type}
                        </span>
                        <span className="font-semibold ml-auto flex-shrink-0">
                          {b.count}
                        </span>
                        <span className="text-muted-foreground flex-shrink-0">
                          {b.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-5 py-3 border-t">
            <span className="text-xs text-muted-foreground text-center sm:text-left">
              Showing {globalOffset + 1}–
              {Math.min(page * PAGE_SIZE, ALL_EARNERS.length)} of{" "}
              {ALL_EARNERS.length.toLocaleString()} earners
            </span>
            <div className="sm:ml-auto">
              <PaginationComponent
                pagination={{
                  total: ALL_EARNERS.length,
                  page,
                  limit: PAGE_SIZE,
                  totalPages
                }}
                onPageChange={setPage}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </AnalyticsPage>
  )
}
