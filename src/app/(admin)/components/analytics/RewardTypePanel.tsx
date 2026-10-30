"use client"

import { useState } from "react"
import { Download, Info } from "lucide-react"
import { SnapshotUnavailable } from "./AnalyticsPage"
import { Button } from "@/src/components/ui/button"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import { downloadCsv } from "./csv"
import { RewardTypeBlock } from "@/src/types/Reporting/Reporting.schema"
import {
  AVATAR_CLASSES,
  RANK_BADGE_CLASSES,
  SERIES_BG_CLASSES
} from "../../admin/analytics/_data/constants"
import { formatPercent, getInitials, humanizeKey, toPercent } from "./format"

const PAGE_SIZE = 4

/** Label followed by an info icon whose tooltip explains the value. */
function LabelWithTip({
  label,
  tip,
  className
}: {
  label: string
  tip: string
  className?: string
}) {
  return (
    <span className={cn("flex items-center gap-1", className)}>
      {label}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3 h-3 flex-shrink-0 cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-56 font-normal">
            {tip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  )
}

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

  const isRP = short === "RP"
  // RP is never spent, so a user's RP is their cumulative Reputation Score —
  // not a "balance". SC is spendable, so balance is the right word there.
  const scoreLabel = isRP ? "Reputation Score" : `Current ${short} Balance`

  const summary = [
    {
      label: isRP ? "Total RP Issued" : `${short} held by users`,
      value: block.total.toLocaleString(),
      tip: isRP
        ? "Cumulative Reputation Points awarded to all users since launch."
        : `Total ${short} currently held by all users.`
    },
    {
      label: "Rewarded actions",
      value: block.actions.total.toLocaleString(),
      tip: `Total number of times an action was rewarded with ${short}.`
    }
  ]

  const rules = Object.entries(block.actions.rules)
    .map(([key, rule]) => ({ key, count: rule.total }))
    .sort((a, b) => b.count - a.count)
  const topRuleCount = rules[0]?.count ?? 0

  // Already ranked by total (desc) in the snapshot.
  const earners = block.ranking.users
  const totalPages = Math.ceil(earners.length / PAGE_SIZE)
  const globalOffset = (page - 1) * PAGE_SIZE
  const pageEarners = earners.slice(globalOffset, page * PAGE_SIZE)

  const exportEarnersCsv = () => {
    // Union of every action type across all earners, not just the first
    // row's — different users trigger different action types, so the column
    // set has to cover everyone. A user who never did a given action gets an
    // explicit 0 for it rather than a missing/blank cell.
    const actionTypeSet = new Set<string>()
    for (const e of earners) {
      for (const a of e.actions.type) actionTypeSet.add(a.action_type)
    }
    const actionTypes = Array.from(actionTypeSet).sort()

    downloadCsv(
      `top-${short.toLowerCase()}-earners-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Rank",
        "Name",
        "Email",
        "Level",
        scoreLabel,
        "Total actions",
        ...actionTypes.map(humanizeKey)
      ],
      earners.map((e, i) => {
        const countByType = new Map(
          e.actions.type.map((a) => [a.action_type, a.count])
        )
        return [
          i + 1,
          e.info.user_name,
          e.info.email,
          e.level ? `L${e.level.level_id} · ${e.level.level_name}` : "No level",
          e.info.total,
          e.actions.total,
          ...actionTypes.map((t) => countByType.get(t) ?? 0)
        ]
      })
    )
  }

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
                    <LabelWithTip label={s.label} tip={s.tip} />
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
        <CardHeader className="p-4 sm:p-5 border-b flex flex-col sm:flex-row items-start justify-between gap-3 space-y-0">
          <div className="min-w-0">
            <CardTitle className="text-sm">Top {label} earners</CardTitle>
            <CardDescription className="text-xs">
              {isRP
                ? "Users ranked by cumulative Reputation Score, with their level and the actions that earned it."
                : `Users ranked by current ${short} balance, with their level and the actions that earned it.`}
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 flex-shrink-0"
            onClick={exportEarnersCsv}
            disabled={earners.length === 0}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
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
                <span className="w-24 text-right">{scoreLabel}</span>
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
                              {scoreLabel}
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
                          <TooltipProvider delayDuration={0}>
                            <div className="flex h-3 rounded-md overflow-hidden gap-px">
                              {e.actions.type.map((b, idx) => (
                                <Tooltip key={b.action_type}>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={
                                        SERIES_BG_CLASSES[
                                          idx % SERIES_BG_CLASSES.length
                                        ]
                                      }
                                      style={{
                                        width: `${toPercent(b.count, e.actions.total) ?? 0}%`
                                      }}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent className="text-xs flex items-center gap-1.5">
                                    <span
                                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${SERIES_BG_CLASSES[idx % SERIES_BG_CLASSES.length]}`}
                                    />
                                    <span>
                                      <span className="font-medium">
                                        {humanizeKey(b.action_type)}
                                      </span>
                                      : {b.count.toLocaleString()}{" "}
                                      {b.count === 1 ? "action" : "actions"} (
                                      {formatPercent(b.count, e.actions.total)})
                                    </span>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </TooltipProvider>
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
