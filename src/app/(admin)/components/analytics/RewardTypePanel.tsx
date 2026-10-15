"use client"

import { useState } from "react"
import { SnapshotUnavailable } from "./AnalyticsPage"
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
import { RewardTypeBlock } from "@/src/types/Reporting/Reporting.schema"
import {
  AVATAR_CLASSES,
  RANK_BADGE_CLASSES,
  SERIES_BG_CLASSES
} from "../../admin/analytics/_data/constants"
import { formatPercent, getInitials, humanizeKey, toPercent } from "./format"

const PAGE_SIZE = 4

interface RewardTypePanelProps {
  /** rp_points or sc_points block from the snapshot */
  block: RewardTypeBlock
  /** e.g. "Reputation Points" */
  label: string
  /** e.g. "RP" */
  short: string
}

/**
 * Body of one rewards tab (RP or SC): summary, actions by rule and top
 * earners. Same component for both tabs — only the block passed in changes.
 */
export function RewardTypePanel({ block, label, short }: RewardTypePanelProps) {
  const [page, setPage] = useState(1)

  const summary = [
    { label: `${short} held by users`, value: block.total.toLocaleString() },
    {
      label: "Rewarded actions",
      value: block.actions.total.toLocaleString()
    }
  ]

  const rules = Object.entries(block.actions.rules)
    .map(([key, rule]) => ({ key, count: rule.total }))
    .sort((a, b) => b.count - a.count)
  const topRuleCount = rules[0]?.count ?? 0

  // Already ranked by balance (desc) in the snapshot.
  const earners = block.ranking.users
  const totalPages = Math.ceil(earners.length / PAGE_SIZE)
  const globalOffset = (page - 1) * PAGE_SIZE
  const pageEarners = earners.slice(globalOffset, page * PAGE_SIZE)

  return (
    <>
      {/* Summary + Actions by rule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 [&>*]:min-w-0">
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-0">
            <CardTitle className="text-sm">{label} summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-4">
            <div className="grid grid-cols-2 gap-3">
              {summary.map((s) => (
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
              Times each rule awarded {short}
            </span>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-4">
            {rules.length === 0 ? (
              <SnapshotUnavailable />
            ) : (
              <div className="flex flex-col gap-3">
                {rules.map((a) => (
                  <div
                    key={a.key}
                    className="flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-1.5"
                  >
                    <div className="w-full sm:w-36 flex-shrink-0 min-w-0">
                      <p className="text-xs font-medium leading-none [overflow-wrap:anywhere]">
                        {humanizeKey(a.key)}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5 [overflow-wrap:anywhere]">
                        {a.key}
                      </p>
                    </div>
                    <Progress
                      value={toPercent(a.count, topRuleCount) ?? 0}
                      className="flex-1 min-w-0 bg-muted"
                      indicatorClassName="bg-emerald-500 rounded-full transition-none"
                    />
                    <span className="text-sm font-semibold w-14 text-right flex-shrink-0 tabular-nums">
                      {a.count.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground w-12 text-right flex-shrink-0">
                      {formatPercent(a.count, block.actions.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top earners */}
      <Card className="min-w-0">
        <CardHeader className="p-4 sm:p-5 border-b">
          <CardTitle className="text-sm">Top {label} earners</CardTitle>
          <CardDescription className="text-xs">
            Users ranked by current {short} balance, with their level and the
            actions that earned it.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {earners.length === 0 ? (
            <SnapshotUnavailable className="m-4 sm:m-5" />
          ) : (
            <>
              <div className="hidden lg:grid lg:grid-cols-[3rem_minmax(0,1fr)_auto_auto_auto] gap-x-4 items-center px-5 py-3 border-b text-xs text-muted-foreground font-medium">
                <span>Rank</span>
                <span>User</span>
                <span className="w-28 text-center">Level</span>
                <span className="w-24 text-right">Total {short}</span>
                <span className="w-16 text-right">Actions</span>
              </div>

              <div className="divide-y">
                {pageEarners.map((e, i) => {
                  const rank = globalOffset + i + 1
                  return (
                    <div
                      key={e.info.email}
                      className="p-3 sm:p-5 flex flex-col gap-3"
                    >
                      <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 gap-y-3 lg:grid-cols-[3rem_minmax(0,1fr)_auto_auto_auto] lg:gap-x-4 items-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "w-7 h-7 p-0 rounded-full flex-shrink-0 justify-center text-sm",
                            RANK_BADGE_CLASSES[rank] ??
                              "border-transparent text-muted-foreground font-medium"
                          )}
                        >
                          {rank}
                        </Badge>
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-10 h-10 rounded-full ${AVATAR_CLASSES[(rank - 1) % AVATAR_CLASSES.length]} text-sm font-bold flex items-center justify-center flex-shrink-0`}
                          >
                            {getInitials(e.info.user_name)}
                          </span>
                          <div className="min-w-0">
                            <p
                              className="font-semibold truncate"
                              title={e.info.user_name}
                            >
                              {e.info.user_name}
                            </p>
                            <p
                              className="text-xs text-muted-foreground truncate"
                              title={e.info.email}
                            >
                              {e.info.email}
                            </p>
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center justify-between gap-3 lg:contents">
                          <span className="min-w-0 lg:w-28 lg:text-center">
                            <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium">
                              {e.level
                                ? `L${e.level.level_id}·${e.level.level_name}`
                                : "No level"}
                            </span>
                          </span>
                          <div className="ml-auto lg:ml-0 w-24 text-right">
                            <p className="text-xl font-bold [overflow-wrap:anywhere]">
                              {e.info.total.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {short} held
                            </p>
                          </div>
                          <div className="w-16 text-right">
                            <p className="text-xl font-bold">
                              {e.actions.total.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              actions
                            </p>
                          </div>
                        </div>
                      </div>

                      {e.actions.type.length > 0 && (
                        <div className="ml-0 lg:ml-[calc(3rem+1rem)] min-w-0 rounded-lg border bg-muted/20 p-3 flex flex-col gap-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                              Action types
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {e.actions.type.length} types ·{" "}
                              {e.actions.total.toLocaleString()} actions
                            </span>
                          </div>
                          <div className="flex h-3 rounded-md overflow-hidden gap-px">
                            {e.actions.type.map((b, idx) => (
                              <div
                                key={b.action_type}
                                className={
                                  SERIES_BG_CLASSES[
                                    idx % SERIES_BG_CLASSES.length
                                  ]
                                }
                                style={{
                                  width: `${toPercent(b.count, e.actions.total) ?? 0}%`
                                }}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-1 text-xs">
                            {e.actions.type.map((b, idx) => (
                              <div
                                key={b.action_type}
                                className="flex min-w-0 items-center gap-1.5"
                              >
                                <span
                                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${SERIES_BG_CLASSES[idx % SERIES_BG_CLASSES.length]}`}
                                />
                                <span className="text-muted-foreground truncate">
                                  {humanizeKey(b.action_type)}
                                </span>
                                <span className="font-semibold ml-auto flex-shrink-0">
                                  {b.count.toLocaleString()}
                                </span>
                                <span className="text-muted-foreground flex-shrink-0">
                                  {formatPercent(b.count, e.actions.total)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-5 py-3 border-t">
                <span className="text-xs text-muted-foreground text-center sm:text-left">
                  Showing {globalOffset + 1}–
                  {Math.min(page * PAGE_SIZE, earners.length)} of top{" "}
                  {earners.length.toLocaleString()} earners
                </span>
                {totalPages > 1 && (
                  <div className="sm:ml-auto">
                    <PaginationComponent
                      pagination={{
                        total: earners.length,
                        page,
                        limit: PAGE_SIZE,
                        totalPages
                      }}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
