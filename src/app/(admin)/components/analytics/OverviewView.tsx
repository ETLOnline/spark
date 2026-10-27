"use client"

import { Users, Network, GraduationCap, Medal, Coins } from "lucide-react"
import { useAtomValue } from "jotai"
import {
  AnalyticsPage,
  SnapshotLoading,
  SnapshotUnavailable
} from "./AnalyticsPage"
import { adminAnalyticsStore } from "@/src/store/adminAnalytics/adminAnalyticsStore"
import { KpiCard } from "./KpiCard"
import { RankList } from "./RankList"
import { TopCommunitiesCard } from "./TopCommunitiesCard"
import { UserSegmentCard } from "./UserSegmentCard"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { CommunitiesReport } from "@/src/types/Reporting/Reporting.schema"
import { formatCompactCount, formatCount, getInitials } from "./format"

const TOP_LIST_SIZE = 5

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

export default function OverviewView() {
  const snapshot = useAtomValue(adminAnalyticsStore.snapshot)
  const isLoading = useAtomValue(adminAnalyticsStore.LoadingSnapshot)
  const header = {
    title: "Analytics overview",
    description:
      "Platform-wide KPIs across users, communities, mentorship and rewards."
  }

  if (isLoading) return <SnapshotLoading />

  // Every section below treats a missing snapshot the same as every module
  // inside it being null, so both render their own "couldn't load" state.
  const { users, communities, mentorship, rewards } = snapshot ?? {
    users: null,
    communities: null,
    mentorship: null,
    rewards: null
  }

  const totalUsers = formatCompactCount(users?.total)
  const totalCommunities = formatCompactCount(communities?.total)
  const activeMentors = formatCompactCount(mentorship?.active)
  const totalRP = formatCompactCount(rewards?.types.rp_points.total)
  const totalSC = formatCompactCount(rewards?.types.sc_points.total)

  // No error state — a null module (collection failed when the snapshot was
  // built) just shows "0" like a real zero would, same as everything else.
  const kpis = [
    {
      label: "Total Users",
      value: totalUsers?.compact ?? "0",
      fullValue: totalUsers?.full,
      description: "Cumulative registered users across all roles.",
      icon: Users
    },
    {
      label: "Communities",
      value: totalCommunities?.compact ?? "0",
      fullValue: totalCommunities?.full,
      description: "Total Communities live on the platform.",
      icon: Network
    },
    {
      label: "Active Mentors",
      value: activeMentors?.compact ?? "0",
      fullValue: activeMentors?.full,
      description: "Mentors currently available or engaged on the marketplace.",
      icon: GraduationCap
    },
    {
      label: "Total RP Issued",
      value: totalRP?.compact ?? "0",
      fullValue: totalRP?.full,
      description: "Cumulative Reward Points issued platform-wide.",
      icon: Medal
    },
    {
      label: "Total SC Circulation",
      value: totalSC?.compact ?? "0",
      fullValue: totalSC?.full,
      description: "Spark Coins currently in circulation across users.",
      icon: Coins
    }
  ]

  const topMentors = (mentorship?.ranking.users ?? [])
    .slice(0, TOP_LIST_SIZE)
    .map((u) => ({
      initials: getInitials(u.info.user_name),
      name: u.info.user_name,
      value: u.sessions.completed,
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
      <section className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h2 className="text-sm font-semibold">Platform Overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Platform scale and economy health at a glance.
          </p>
        </div>
        <KpiCard items={kpis} />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 [&>*]:min-w-0">
        <UserSegmentCard users={users} error={users === null} />
        <TopCommunitiesCard
          ranking={communities?.ranking ?? { by_members: [], by_posts: [] }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 [&>*]:min-w-0">
        <CommunityPerformanceCard communities={communities} />
        <RankList
          title="Top mentors"
          subtitle="Total sessions delivered"
          items={topMentors}
          valueLabel="Completed"
          linkHref="/admin/analytics/mentorship"
          linkLabel="View mentor leaderboard →"
        />
        <div className="min-w-0 lg:col-span-2 xl:col-span-1">
          <RankList
            title="Most engaged"
            subtitle="Current SC balance"
            items={mostEngaged}
            valueLabel="Current SC Balance"
            linkHref="/admin/analytics/leaderboards"
            linkLabel="View leaderboards →"
            className="w-full"
          />
        </div>
      </div>
    </AnalyticsPage>
  )
}
