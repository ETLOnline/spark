"use client"

import { useState } from "react"
import { Network, MessageSquare } from "lucide-react"
import { AnalyticsPage } from "@/src/components/Admin/Analytics/AnalyticsPage"
import { KpiCard } from "@/src/components/Admin/Analytics/KpiCard"
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
import {
  COMMUNITIES_TABLE,
  COMMUNITIES_KPIS,
  RANK_BADGE_CLASSES
} from "../_data/constants"

const PAGE_SIZE = 8
const TOTAL = COMMUNITIES_KPIS.total

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CommunitiesAnalyticsPage() {
  const [mode, setMode] = useState<"members" | "posts">("members")
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(TOTAL / PAGE_SIZE)
  const pageData = COMMUNITIES_TABLE.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )
  const globalOffset = (page - 1) * PAGE_SIZE

  const sorted =
    mode === "members"
      ? pageData
      : [...pageData].sort((a, b) => b.posts - a.posts)

  const getValue = (c: (typeof COMMUNITIES_TABLE)[0]) =>
    mode === "members" ? c.members : c.posts
  const maxVal = Math.max(...COMMUNITIES_TABLE.map(getValue))
  const subtitle =
    mode === "members"
      ? "Ranked by total members in the community"
      : "Ranked by total posts in the community"
  const primaryCol = mode === "members" ? "Members" : "Total posts"
  const secondCol = mode === "members" ? "Posts" : "Members"

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
            value: COMMUNITIES_KPIS.total.toLocaleString(),
            sub: "Cumulative, all time",
            icon: Network
          },
          {
            label: "Posts",
            value: COMMUNITIES_KPIS.posts.toLocaleString(),
            sub: "Across all communities",
            icon: MessageSquare
          }
        ]}
      />

      {/* Top communities table */}
      {/* On tall tablet/desktop screens (iPad Pro 13, Surface Pro 10) the card fills the remaining height
          instead of leaving a large empty area below it; rows share the extra space */}
      <Card className="min-w-0 flex flex-col md:flex-1">
        <CardHeader className="p-4 sm:p-5 border-b flex flex-col sm:flex-row items-start justify-between gap-3 space-y-0">
          <div className="min-w-0">
            <CardTitle className="text-sm">Top communities</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </div>
          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v as typeof mode)
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
          {/* Table scrolls inside this wrapper on narrow screens instead of widening the page */}
          <div className="w-full flex-1 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm md:h-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b">
                  <th className="text-left px-3 sm:px-5 py-3 font-medium w-14 sm:w-16">
                    Rank
                  </th>
                  <th className="text-left px-3 sm:px-5 py-3 font-medium">
                    Community
                  </th>
                  <th className="text-right px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                    {primaryCol}
                  </th>
                  <th className="text-right px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                    {secondCol}
                  </th>
                  <th className="text-left px-3 sm:px-5 py-3 font-medium w-28 sm:w-44 whitespace-nowrap">
                    Relative to #1
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, i) => {
                  const rank = globalOffset + i + 1
                  const pv = getValue(c)
                  const sv = mode === "members" ? c.posts : c.members
                  return (
                    <tr
                      key={c.name}
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
                            {c.initials}
                          </span>
                          <div className="min-w-0 max-w-[14rem] sm:max-w-none">
                            <p className="font-medium break-words">{c.name}</p>
                            <p className="text-xs text-muted-foreground break-words">
                              {c.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-5 py-3 text-right font-semibold tabular-nums">
                        {pv.toLocaleString()}
                      </td>
                      <td className="px-3 sm:px-5 py-3 text-right text-muted-foreground tabular-nums">
                        {sv.toLocaleString()}
                      </td>
                      <td className="px-3 sm:px-5 py-3">
                        <Progress
                          value={(pv / maxVal) * 100}
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
              Showing {globalOffset + 1}–{Math.min(page * PAGE_SIZE, TOTAL)} of{" "}
              {TOTAL.toLocaleString()} communities
            </span>
            <div className="sm:ml-auto">
              <PaginationComponent
                pagination={{
                  total: TOTAL,
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
