"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Download, Network, MessageSquare } from "lucide-react"
import { CommunitiesReport } from "@/src/types/Reporting/Reporting.schema"
import { useAtomValue } from "jotai"
import {
  AnalyticsPage,
  SnapshotLoading,
  SnapshotUnavailable
} from "./AnalyticsPage"
import { adminAnalyticsStore } from "@/src/store/adminAnalytics/adminAnalyticsStore"
import { Button, buttonVariants } from "@/src/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/src/components/ui/table"
import { KpiCard } from "./KpiCard"
import { Progress } from "@/src/components/ui/progress"
import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/src/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { downloadCsv } from "./csv"
import { RANK_BADGE_CLASSES } from "../../admin/analytics/_data/constants"
import { formatCount, getInitials, toPercent } from "./format"
import {
  AdminNames,
  FypBadge,
  VISIBILITY_LABEL,
  VisibilityBadge
} from "./CommunityCells"

export const ADMIN_COMMUNITIES_LIST_URL = "/admin/analytics/communities/list"

const TOP_LIST_SIZE = 10
type RankMode = "members" | "posts"

type CommunityRankingEntry = Pick<
  CommunitiesReport["ranking"]["by_members"][number],
  | "community_id"
  | "title"
  | "slug"
  | "visibility"
  | "admin_names"
  | "fyp_enabled"
>

interface CommunityRankingRow {
  id: string
  title: string
  value: number
  slug?: string
  visibility?: "public" | "private"
  adminNames?: string[]
  fypEnabled?: boolean
}

function CommunityName({ title, slug }: { title: string; slug?: string }) {
  const content = (
    <div className="flex min-w-0 items-center gap-3">
      <span className="w-8 h-8 rounded-lg bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
        {getInitials(title)}
      </span>
      <p className="font-medium break-words min-w-0 max-w-[14rem] sm:max-w-none">
        {title}
      </p>
    </div>
  )

  if (!slug) return content

  return (
    <Link
      href={`/communities/${slug}`}
      className="block rounded-md hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </Link>
  )
}

export default function CommunitiesAnalyticsView() {
  const snapshot = useAtomValue(adminAnalyticsStore.snapshot)
  const isLoading = useAtomValue(adminAnalyticsStore.LoadingSnapshot)
  const communities = snapshot?.communities ?? null
  const [mode, setMode] = useState<RankMode>("members")

  if (isLoading) return <SnapshotLoading />

  // Backend orders by value desc but has no secondary sort, so ties can come
  // back in any order — re-sort here with an alphabetical tiebreak to satisfy
  // "ties share the same rank, ordered alphabetically".
  const toRow = (
    c: CommunityRankingEntry,
    value: number
  ): CommunityRankingRow => ({
    id: c.community_id,
    title: c.title,
    value,
    slug: c.slug,
    visibility: c.visibility,
    adminNames: c.admin_names,
    fypEnabled: c.fyp_enabled
  })

  const ranking = (
    mode === "members"
      ? (communities?.ranking.by_members ?? []).map((c) =>
          toRow(c, c.total_members)
        )
      : (communities?.ranking.by_posts ?? []).map((c) =>
          toRow(c, c.total_posts)
        )
  ).sort((a, b) => b.value - a.value || a.title.localeCompare(b.title))

  const total = ranking.length
  const topValue = ranking[0]?.value ?? 0

  // Standard competition ranking (1, 2, 2, 4): equal values share a rank,
  // and the next distinct value's rank accounts for the tied rows before it.
  let lastValue: number | null = null
  let lastRank = 0
  const pageData = ranking.slice(0, TOP_LIST_SIZE).map((c, i) => {
    const rank = c.value === lastValue ? lastRank : i + 1
    lastValue = c.value
    lastRank = rank
    return { ...c, rank }
  })

  const subtitle =
    mode === "members"
      ? "Ranked by total members. Click a community to open its page."
      : "Ranked by total posts. Click a community to open its page."
  const valueCol = mode === "members" ? "Members" : "Total posts"

  const exportTopCommunitiesCsv = () => {
    downloadCsv(
      `top-communities-${mode}-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Rank",
        "Community",
        "Visibility",
        "Community admin",
        "FYP enabled",
        valueCol
      ],
      pageData.map((c) => [
        c.rank,
        c.title,
        c.visibility ? VISIBILITY_LABEL[c.visibility] : "",
        c.adminNames?.join("; ") ?? "",
        c.fypEnabled === undefined ? "" : c.fypEnabled ? "Yes" : "No",
        c.value
      ])
    )
  }

  return (
    <AnalyticsPage
      className="flex-1"
      title="Community analytics"
      description="How communities are growing and where the conversation happens."
    >
      {communities === null ? (
        <SnapshotUnavailable />
      ) : (
        <>
          <section className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Community performance</h2>
              {/* Plain Link: our Button renders extra children, which breaks asChild */}
              <Link
                href={ADMIN_COMMUNITIES_LIST_URL}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5"
                )}
              >
                View all communities
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <KpiCard
              columns={2}
              items={[
                {
                  label: "Communities Created",
                  value: formatCount(communities.total),
                  sub: `${communities.public.toLocaleString()} public · ${communities.private.toLocaleString()} private`,
                  icon: Network
                },
                {
                  label: "Posts",
                  value: formatCount(communities.channels.spaces.posts.total),
                  sub: "Across all communities",
                  icon: MessageSquare
                }
              ]}
            />
          </section>

          <Card className="min-w-0 flex flex-col md:flex-1">
            <CardHeader className="p-4 sm:p-5 border-b flex flex-col sm:flex-row items-start justify-between gap-3 space-y-0">
              <div className="min-w-0">
                <CardTitle className="text-sm">Top communities</CardTitle>
                <CardDescription>{subtitle}</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Tabs
                  value={mode}
                  onValueChange={(v) => setMode(v as RankMode)}
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="members" className="text-xs">
                      Users
                    </TabsTrigger>
                    <TabsTrigger value="posts" className="text-xs">
                      Total Posts
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={exportTopCommunitiesCsv}
                  disabled={total === 0}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-1 flex-col">
              {total === 0 ? (
                <SnapshotUnavailable className="m-4 sm:m-5" />
              ) : (
                <>
                  <div className="w-full flex-1 overflow-x-auto">
                    <Table className="w-full min-w-[56rem] text-sm">
                      <TableHeader>
                        <TableRow className="text-xs text-muted-foreground border-b hover:bg-transparent">
                          <TableHead className="text-left px-3 sm:px-5 py-3 font-medium w-14 sm:w-16">
                            Rank
                          </TableHead>
                          <TableHead className="text-left px-3 sm:px-5 py-3 font-medium">
                            Community
                          </TableHead>
                          <TableHead className="text-left px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                            Visibility
                          </TableHead>
                          <TableHead className="text-left px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                            Community admin
                          </TableHead>
                          <TableHead className="text-left px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                            FYP enabled
                          </TableHead>
                          <TableHead className="text-right px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                            {valueCol}
                          </TableHead>
                          <TableHead className="text-left px-3 sm:px-5 py-3 font-medium w-28 sm:w-44 whitespace-nowrap">
                            Relative to #1
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pageData.map((c) => {
                          return (
                            <TableRow
                              key={c.id}
                              className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                            >
                              <TableCell className="px-3 sm:px-5 py-3">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "w-7 h-7 p-0 rounded-full flex-shrink-0 justify-center text-sm",
                                    RANK_BADGE_CLASSES[c.rank] ??
                                      "border-transparent text-muted-foreground font-medium"
                                  )}
                                >
                                  {c.rank}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-3 sm:px-5 py-3">
                                <CommunityName title={c.title} slug={c.slug} />
                              </TableCell>
                              <TableCell className="px-3 sm:px-5 py-3">
                                <VisibilityBadge visibility={c.visibility} />
                              </TableCell>
                              <TableCell className="px-3 sm:px-5 py-3 whitespace-nowrap">
                                <AdminNames names={c.adminNames} />
                              </TableCell>
                              <TableCell className="px-3 sm:px-5 py-3">
                                <FypBadge enabled={c.fypEnabled} />
                              </TableCell>
                              <TableCell className="px-3 sm:px-5 py-3 text-right font-semibold tabular-nums">
                                {c.value.toLocaleString()}
                              </TableCell>
                              <TableCell className="px-3 sm:px-5 py-3">
                                <Progress
                                  value={toPercent(c.value, topValue) ?? 0}
                                  className="bg-muted"
                                  indicatorClassName="rounded-full duration-300"
                                />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="px-3 sm:px-5 py-3 border-t">
                    <span className="text-xs text-muted-foreground">
                      Showing top {pageData.length} of {total.toLocaleString()}{" "}
                      communities
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </AnalyticsPage>
  )
}
