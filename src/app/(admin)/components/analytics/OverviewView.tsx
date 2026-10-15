"use client"

import { Users, Network, GraduationCap, Medal, Coins } from "lucide-react"
import { AnalyticsPage, SnapshotUnavailable } from "./AnalyticsPage"
import { DonutChart } from "./DonutChart"
import { KpiCard } from "./KpiCard"
import { RankList } from "./RankList"
import { TopCommunitiesCard } from "./TopCommunitiesCard"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import {
  CommunitiesReport,
  PersistedReportSnapshot,
  UsersReport
} from "@/src/types/Reporting/Reporting.schema"
import {
  SERIES_BG_CLASSES,
  SERIES_STROKE_CLASSES
} from "../../admin/analytics/_data/constants"
import {
  formatCount,
  formatPercent,
  getInitials,
  humanizeKey,
  toPercent
} from "./format"

const TOP_LIST_SIZE = 5

function UserSegmentCard({ users }: { users: UsersReport | null }) {
  const segments = users
    ? Object.entries(users.roles).map(([role, stats], i) => ({
        role,
        users: stats.total,
        bg: SERIES_BG_CLASSES[i % SERIES_BG_CLASSES.length],
        stroke: SERIES_STROKE_CLASSES[i % SERIES_STROKE_CLASSES.length]
      }))
    : []

  return (
    <Card className="w-full min-w-0">
      <CardHeader className="p-4 sm:p-5 pb-0">
        <CardTitle className="text-sm">User segmentation</CardTitle>
        <CardDescription>
          Current share of the user base by role
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-4">
        {!users ? (
          <SnapshotUnavailable />
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <DonutChart
              className="flex-shrink-0 self-center"
              svgClassName="w-28 h-28 sm:w-24 sm:h-24 -rotate-90"
              radius={28}
              strokeWidth={14}
              segments={segments.map((s) => ({
                key: s.role,
                value: toPercent(s.users, users.total) ?? 0,
                className: s.stroke
              }))}
            >
              <span className="text-sm font-bold">
                {users.total.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground">users</span>
            </DonutChart>

            <div className="flex flex-col gap-0.5 flex-1 basis-56 text-sm min-w-0">
              <div className="flex items-center justify-between pb-1 border-b mb-1">
                <span className="text-xs text-muted-foreground flex-1">
                  Role
                </span>
                <span className="text-xs text-muted-foreground w-14 text-right">
                  Users
                </span>
                <span className="text-xs text-muted-foreground w-14 text-right">
                  Share
                </span>
              </div>
              {segments.map((s) => (
                <div
                  key={s.role}
                  className="flex items-center justify-between py-1.5 border-b last:border-0"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.bg}`}
                    />
                    <span className="truncate">{humanizeKey(s.role)}</span>
                  </div>
                  <span className="font-semibold w-14 text-right flex-shrink-0 tabular-nums">
                    {s.users.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground w-14 text-right flex-shrink-0">
                    {formatPercent(s.users, users.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CommunityPerformanceCard({
  communities
}: {
  communities: CommunitiesReport | null
}) {
  const stats = [
    { label: "Communities created", value: communities?.total },
    { label: "Posts", value: communities?.channels.spaces.posts.total }
  ]

  return (
    <Card className="w-full min-w-0">
      <CardHeader className="p-4 sm:p-5 pb-0">
        <CardTitle className="text-sm">Community performance</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <Card
              key={s.label}
              className="min-w-0 rounded-lg border-0 bg-muted/40 p-3 shadow-none"
            >
              <CardDescription className="text-xs">{s.label}</CardDescription>
              <CardTitle className="text-xl sm:text-2xl leading-7 sm:leading-8 tracking-normal font-bold mt-0.5 [overflow-wrap:anywhere]">
                {formatCount(s.value)}
              </CardTitle>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Posts are counted across every community.
        </p>
      </CardContent>
    </Card>
  )
}

export default function OverviewView({
  snapshot
}: {
  snapshot: PersistedReportSnapshot | null
}) {
  const header = {
    title: "Analytics overview",
    description:
      "Platform-wide KPIs across users, communities, mentorship and rewards."
  }

  if (!snapshot) {
    return (
      <AnalyticsPage
        className="px-1 sm:px-4 lg:px-6 py-4 sm:py-6 pb-10"
        {...header}
      >
        <SnapshotUnavailable />
      </AnalyticsPage>
    )
  }

  const { users, communities, mentorship, rewards } = snapshot

  const kpis = [
    {
      label: "Total users",
      value: formatCount(users?.total),
      sub: "Registered across all roles",
      icon: Users
    },
    {
      label: "Communities",
      value: formatCount(communities?.total),
      sub: "Live on the platform",
      icon: Network
    },
    {
      label: "Active mentors",
      value: formatCount(mentorship?.active),
      sub: "Available or engaged on the marketplace",
      icon: GraduationCap
    },
    {
      label: "Total RP",
      value: formatCount(rewards?.types.rp_points.total),
      sub: "Reputation Points held by users",
      icon: Medal
    },
    {
      label: "SC in circulation",
      value: formatCount(rewards?.types.sc_points.total),
      sub: "Spark Credits held by users",
      icon: Coins
    }
  ]

  const topMentors = (mentorship?.ranking.users ?? [])
    .slice(0, TOP_LIST_SIZE)
    .map((u) => ({
      initials: getInitials(u.info.user_name),
      name: u.info.user_name,
      value: u.sessions.total,
      avatarColor: "bg-violet-100 text-violet-700"
    }))

  const mostEngaged = (rewards?.types.sc_points.ranking.users ?? [])
    .slice(0, TOP_LIST_SIZE)
    .map((u) => ({
      initials: getInitials(u.info.user_name),
      name: u.info.user_name,
      value: u.info.total,
      avatarColor: "bg-emerald-100 text-emerald-700"
    }))

  return (
    <AnalyticsPage
      className="px-1 sm:px-4 lg:px-6 py-4 sm:py-6 pb-10"
      {...header}
    >
      <KpiCard items={kpis} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 [&>*]:min-w-0">
        <UserSegmentCard users={users} />
        {communities ? (
          <TopCommunitiesCard ranking={communities.ranking} />
        ) : (
          <SnapshotUnavailable />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 [&>*]:min-w-0">
        <CommunityPerformanceCard communities={communities} />
        <RankList
          title="Top mentors"
          subtitle="Total session requests"
          items={topMentors}
          valueLabel="Sessions"
          linkHref="/admin/analytics/mentorship"
          linkLabel="View mentor leaderboard →"
        />
        <div className="min-w-0 lg:col-span-2 xl:col-span-1">
          <RankList
            title="Most engaged"
            subtitle="Current SC balance"
            items={mostEngaged}
            valueLabel="SC held"
            linkHref="/admin/analytics/leaderboards"
            linkLabel="View leaderboards →"
            className="w-full"
          />
        </div>
      </div>
    </AnalyticsPage>
  )
}
