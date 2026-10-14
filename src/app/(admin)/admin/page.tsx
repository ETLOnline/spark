"use client"

import { AnalyticsPage } from "@/src/components/Admin/Analytics/AnalyticsPage"
import { DonutChart } from "@/src/components/Admin/Analytics/DonutChart"
import { KpiCard } from "@/src/components/Admin/Analytics/KpiCard"
import { RankList } from "@/src/components/Admin/Analytics/RankList"
import { TopCommunitiesCard } from "@/src/components/Admin/Analytics/TopCommunitiesCard"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import {
  OVERVIEW_KPIS,
  USER_SEGMENTS,
  TOP_COMMUNITIES_DATA,
  TOP_MENTORS_DATA,
  MOST_ENGAGED_DATA,
  COMMUNITIES_KPIS
} from "./analytics/_data/constants"

const SEGMENT_STROKES = [
  "text-emerald-500",
  "text-blue-500",
  "text-amber-500",
  "text-violet-500",
  "text-slate-300",
  "text-pink-400"
]

// ── User segmentation ─────────────────────────────────────────────────────────

function UserSegmentCard() {
  return (
    <Card className="w-full min-w-0">
      <CardHeader className="p-4 sm:p-5 pb-0">
        <CardTitle className="text-sm">User segmentation</CardTitle>
        <CardDescription>
          Current share of the user base by role
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-4">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <DonutChart
            className="flex-shrink-0 self-center"
            svgClassName="w-28 h-28 sm:w-24 sm:h-24 -rotate-90"
            radius={28}
            strokeWidth={14}
            segments={USER_SEGMENTS.map((s, i) => ({
              key: s.role,
              value: s.share,
              className: SEGMENT_STROKES[i % SEGMENT_STROKES.length]
            }))}
          >
            <span className="text-sm font-bold">{OVERVIEW_KPIS[0].value}</span>
            <span className="text-[10px] text-muted-foreground">users</span>
          </DonutChart>

          <div className="flex flex-col gap-0.5 flex-1 basis-56 text-sm min-w-0">
            <div className="flex items-center justify-between pb-1 border-b mb-1">
              <span className="text-xs text-muted-foreground flex-1">Role</span>
              <span className="text-xs text-muted-foreground w-14 text-right">
                Users
              </span>
              <span className="text-xs text-muted-foreground w-12 text-right">
                Share
              </span>
            </div>
            {USER_SEGMENTS.map((s) => (
              <div
                key={s.role}
                className="flex items-center justify-between py-1.5 border-b last:border-0"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.color}`}
                  />
                  <span className="truncate">{s.role}</span>
                </div>
                <span className="font-semibold w-14 text-right flex-shrink-0 tabular-nums">
                  {s.users.toLocaleString()}
                </span>
                <span className="text-muted-foreground w-12 text-right flex-shrink-0">
                  {s.share}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Community performance ─────────────────────────────────────────────────────

function CommunityPerformanceCard() {
  return (
    <Card className="w-full min-w-0">
      <CardHeader className="p-4 sm:p-5 pb-0">
        <CardTitle className="text-sm">Community performance</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="min-w-0 rounded-lg border-0 bg-muted/40 p-3 shadow-none">
            <CardDescription className="text-xs">
              Communities created
            </CardDescription>
            <CardTitle className="text-xl sm:text-2xl leading-7 sm:leading-8 tracking-normal font-bold mt-0.5 [overflow-wrap:anywhere]">
              {COMMUNITIES_KPIS.total.toLocaleString()}
            </CardTitle>
          </Card>
          <Card className="min-w-0 rounded-lg border-0 bg-muted/40 p-3 shadow-none">
            <CardDescription className="text-xs">Posts</CardDescription>
            <CardTitle className="text-xl sm:text-2xl leading-7 sm:leading-8 tracking-normal font-bold mt-0.5 [overflow-wrap:anywhere]">
              {COMMUNITIES_KPIS.posts.toLocaleString()}
            </CardTitle>
          </Card>
        </div>
        <p className="text-xs text-muted-foreground">
          Posts are counted across every community.
        </p>
      </CardContent>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  return (
    <AnalyticsPage
      className="px-1 sm:px-4 lg:px-6 py-4 sm:py-6 pb-10"
      title="Analytics overview"
      description="Platform-wide KPIs across users, communities, mentorship and rewards."
    >
      <KpiCard items={OVERVIEW_KPIS} />

      {/* User segmentation + Top communities */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 [&>*]:min-w-0">
        <UserSegmentCard />
        <TopCommunitiesCard communities={TOP_COMMUNITIES_DATA} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 [&>*]:min-w-0">
        <CommunityPerformanceCard />
        <RankList
          title="Top mentors"
          subtitle="Sessions delivered"
          items={TOP_MENTORS_DATA}
          valueLabel="Sessions delivered"
          linkHref="/admin/analytics/users"
          linkLabel="View mentor leaderboard →"
        />
        <div className="min-w-0 lg:col-span-2 xl:col-span-1">
          <RankList
            title="Most engaged"
            subtitle="Total SC earned"
            items={MOST_ENGAGED_DATA}
            valueLabel="Total SC earned"
            linkHref="/admin/analytics/leaderboards"
            linkLabel="View leaderboards →"
            className="w-full"
          />
        </div>
      </div>
    </AnalyticsPage>
  )
}
