"use client"

import { useState } from "react"
import { Network, MessageSquare } from "lucide-react"
import { AnalyticsPage, SnapshotUnavailable } from "./AnalyticsPage"
import { KpiCard } from "./KpiCard"
import { Progress } from "@/src/components/ui/progress"
import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/src/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import PaginationComponent from "@/src/components/common/Pagination"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { CommunitiesReport } from "@/src/types/Reporting/Reporting.schema"
import { RANK_BADGE_CLASSES } from "../../admin/analytics/_data/constants"
import { getInitials, toPercent } from "./format"

const PAGE_SIZE = 8
type RankMode = "members" | "posts"

export default function CommunitiesAnalyticsView({
  communities
}: {
  communities: CommunitiesReport | null
}) {
  const [mode, setMode] = useState<RankMode>("members")
  const [page, setPage] = useState(1)

  if (!communities) {
    return (
      <AnalyticsPage title="Community analytics">
        <SnapshotUnavailable />
      </AnalyticsPage>
    )
  }

  // Both lists arrive already ranked (desc) from the snapshot.
  const ranking =
    mode === "members"
      ? communities.ranking.by_members.map((c) => ({
          id: c.community_id,
          title: c.title,
          value: c.total_members
        }))
      : communities.ranking.by_posts.map((c) => ({
          id: c.community_id,
          title: c.title,
          value: c.total_posts
        }))

  const total = ranking.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const globalOffset = (page - 1) * PAGE_SIZE
  const pageData = ranking.slice(globalOffset, page * PAGE_SIZE)
  const topValue = ranking[0]?.value ?? 0

  const subtitle =
    mode === "members"
      ? "Ranked by total members in the community"
      : "Ranked by total posts in the community"
  const valueCol = mode === "members" ? "Members" : "Total posts"

  return (
    <AnalyticsPage
      className="flex-1"
      title="Community analytics"
      description="How communities are growing and where the conversation happens."
    >
      <KpiCard
        columns={2}
        items={[
          {
            label: "Communities created",
            value: communities.total.toLocaleString(),
            sub: `${communities.public.toLocaleString()} public · ${communities.private.toLocaleString()} private`,
            icon: Network
          },
          {
            label: "Posts",
            value: communities.channels.spaces.posts.total.toLocaleString(),
            sub: "Across all communities",
            icon: MessageSquare
          }
        ]}
      />

      <Card className="min-w-0 flex flex-col md:flex-1">
        <CardHeader className="p-4 sm:p-5 border-b flex flex-col sm:flex-row items-start justify-between gap-3 space-y-0">
          <div className="min-w-0">
            <CardTitle className="text-sm">Top communities</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </div>
          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v as RankMode)
              setPage(1)
            }}
          >
            <TabsList className="h-8 flex-shrink-0">
              <TabsTrigger value="members" className="text-xs">
                Users
              </TabsTrigger>
              <TabsTrigger value="posts" className="text-xs">
                Total posts
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-0 flex flex-1 flex-col">
          {total === 0 ? (
            <SnapshotUnavailable className="m-4 sm:m-5" />
          ) : (
            <>
              <div className="w-full flex-1 overflow-x-auto">
                <table className="w-full min-w-[32rem] text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b">
                      <th className="text-left px-3 sm:px-5 py-3 font-medium w-14 sm:w-16">
                        Rank
                      </th>
                      <th className="text-left px-3 sm:px-5 py-3 font-medium">
                        Community
                      </th>
                      <th className="text-right px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                        {valueCol}
                      </th>
                      <th className="text-left px-3 sm:px-5 py-3 font-medium w-28 sm:w-44 whitespace-nowrap">
                        Relative to #1
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((c, i) => {
                      const rank = globalOffset + i + 1
                      return (
                        <tr
                          key={c.id}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-3 sm:px-5 py-3">
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
                          </td>
                          <td className="px-3 sm:px-5 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="w-8 h-8 rounded-lg bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                                {getInitials(c.title)}
                              </span>
                              <p className="font-medium break-words min-w-0 max-w-[14rem] sm:max-w-none">
                                {c.title}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 sm:px-5 py-3 text-right font-semibold tabular-nums">
                            {c.value.toLocaleString()}
                          </td>
                          <td className="px-3 sm:px-5 py-3">
                            <Progress
                              value={toPercent(c.value, topValue) ?? 0}
                              className="bg-muted"
                              indicatorClassName="rounded-full duration-300"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-5 py-3 border-t">
                <span className="text-xs text-muted-foreground text-center sm:text-left">
                  Showing {globalOffset + 1}–{Math.min(page * PAGE_SIZE, total)}{" "}
                  of top {total.toLocaleString()} communities
                </span>
                {totalPages > 1 && (
                  <div className="sm:ml-auto">
                    <PaginationComponent
                      pagination={{
                        total,
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
    </AnalyticsPage>
  )
}
