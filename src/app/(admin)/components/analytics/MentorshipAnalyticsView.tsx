"use client"

import {
  Award,
  CalendarCheck,
  Clock,
  Download,
  GraduationCap,
  MessageSquareText,
  ShieldCheck,
  UserCheck
} from "lucide-react"
import { useAtomValue } from "jotai"
import { AnalyticsPage, SnapshotLoading } from "./AnalyticsPage"
import { adminAnalyticsStore } from "@/src/store/adminAnalytics/adminAnalyticsStore"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/src/lib/utils"
import { downloadCsv } from "./csv"
import { PieDonutChart } from "./PieDonutChart"
import { KpiCard } from "./KpiCard"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import {
  AVATAR_CLASSES,
  RANK_BADGE_CLASSES
} from "../../admin/analytics/_data/constants"
import { formatPercent, getInitials } from "./format"

export default function MentorshipAnalyticsView() {
  const snapshot = useAtomValue(adminAnalyticsStore.snapshot)
  const isLoading = useAtomValue(adminAnalyticsStore.LoadingSnapshot)
  const mentorship = snapshot?.mentorship ?? null

  if (isLoading) return <SnapshotLoading />

  // Already ranked by sessions delivered (completed), zero-session mentors
  // excluded, desc, top 10 — see GetMentorRankingRaw.
  const mentors = mentorship?.ranking.users ?? []

  // Standard competition ranking (1, 1, 3, …): tied mentors share a rank, so
  // the badge check (rank === 1) is correct even when multiple mentors tie
  // for first.
  let lastValue: number | null = null
  let lastRank = 0
  const rankedMentors = mentors.map((m, i) => {
    const value = m.sessions.completed
    const rank = value === lastValue ? lastRank : i + 1
    lastValue = value
    lastRank = rank
    return { ...m, rank }
  })

  const pctOfMentors = (n: number) =>
    `${formatPercent(n, mentorship?.total ?? 0)} of mentors`

  const exportMentorLeaderboardCsv = () => {
    downloadCsv(
      `mentor-leaderboard-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Rank",
        "Mentor",
        "Email",
        "Sessions delivered",
        "Total sessions",
        "Rejected",
        "Feedback"
      ],
      rankedMentors.map((m) => [
        m.rank,
        m.info.user_name,
        m.info.email,
        m.sessions.completed,
        m.sessions.total,
        m.sessions.rejected,
        m.feedback.total
      ])
    )
  }

  const kpis = mentorship
    ? [
        {
          label: "Total mentors",
          value: mentorship.total.toLocaleString(),
          sub: "Registered with the Mentor role",
          icon: GraduationCap
        },
        {
          label: "Active mentors",
          value: mentorship.active.toLocaleString(),
          sub: pctOfMentors(mentorship.active),
          icon: UserCheck
        },
        {
          label: "Verified mentors",
          value: mentorship.verified.toLocaleString(),
          sub: pctOfMentors(mentorship.verified),
          icon: ShieldCheck
        },
        {
          label: "Sessions completed",
          value: mentorship.sessions.completed.toLocaleString(),
          sub: "Delivered by mentors, all time",
          icon: CalendarCheck
        }
      ]
    : []

  const sessionStats = mentorship
    ? [
        {
          label: "Completed",
          count: mentorship.sessions.completed,
          bg: "bg-emerald-500",
          stroke: "text-emerald-500"
        },
        {
          label: "Rejected",
          count: mentorship.sessions.rejected,
          bg: "bg-orange-400",
          stroke: "text-orange-400"
        },
        {
          label: "Pending",
          count: mentorship.sessions.pending,
          bg: "bg-blue-500",
          stroke: "text-blue-500"
        }
      ]
    : []

  return (
    <AnalyticsPage
      title="Mentorship analytics"
      description="Mentors, sessions, availability and feedback across the mentorship marketplace."
    >
      {mentorship && <KpiCard columns={4} items={kpis} />}

      {mentorship && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 [&>*]:min-w-0">
          {/* Sessions donut */}
          <Card>
            <CardHeader className="p-4 sm:p-5 pb-0">
              <CardTitle className="text-sm">Sessions</CardTitle>
              <CardDescription>All session requests by status</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-4">
              <div className="flex flex-wrap items-center justify-center gap-6">
                <PieDonutChart
                  className="self-center"
                  centerValue={mentorship.sessions.total}
                  centerLabel="sessions"
                  segments={sessionStats.map((s) => ({
                    label: s.label,
                    count: s.count,
                    share: formatPercent(s.count, mentorship.sessions.total),
                    bg: s.bg,
                    text: s.stroke
                  }))}
                />
                <div className="flex flex-col gap-2 flex-1 basis-48 min-w-0">
                  {[
                    ...sessionStats,
                    { label: "Total", count: mentorship.sessions.total, bg: "" }
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between gap-2 text-sm border-b last:border-0 pb-2 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {s.bg ? (
                          <span
                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.bg}`}
                          />
                        ) : (
                          <span className="w-2.5 h-2.5" />
                        )}
                        <span
                          className={`truncate ${s.bg ? "" : "font-semibold"}`}
                        >
                          {s.label}
                        </span>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-3">
                        <span className="font-semibold w-14 text-right tabular-nums">
                          {s.count.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {formatPercent(s.count, mentorship.sessions.total)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Availability */}
            <Card>
              <CardHeader className="p-4 sm:p-5 pb-0 flex flex-row items-start justify-between gap-2 space-y-0">
                <div className="min-w-0">
                  <CardTitle className="text-sm">Availability</CardTitle>
                  <CardDescription>
                    Mentor time slots open for booking
                  </CardDescription>
                </div>
                <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </span>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-4">
                <Card className="min-w-0 rounded-lg border-0 bg-muted/40 p-3 shadow-none">
                  <CardDescription className="text-xs">
                    Total slots
                  </CardDescription>
                  <CardTitle className="text-xl sm:text-2xl leading-7 sm:leading-8 tracking-normal font-bold mt-0.5 [overflow-wrap:anywhere]">
                    {mentorship.availability.total_slots.toLocaleString()}
                  </CardTitle>
                </Card>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <CardHeader className="p-4 sm:p-5 pb-0">
                <CardTitle className="text-sm">Feedback</CardTitle>
                <CardDescription>
                  Mentee feedback after sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 pt-4">
                <div className="rounded-lg bg-muted/40 p-4 flex items-center gap-4">
                  <span className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <MessageSquareText className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Feedback received
                    </p>
                    <p className="text-2xl font-bold">
                      {mentorship.feedback.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Card className="min-w-0">
        <CardHeader className="p-4 sm:p-5 border-b flex flex-col sm:flex-row items-start justify-between gap-3 space-y-0">
          <div className="min-w-0">
            <CardTitle className="text-sm">Mentor leaderboard</CardTitle>
            <CardDescription>
              Ranked by sessions delivered (completed)
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 flex-shrink-0"
            onClick={exportMentorLeaderboardCsv}
            disabled={rankedMentors.length === 0}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {mentorship === null ? (
            <div className="m-4 sm:m-5 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No data found
            </div>
          ) : rankedMentors.length === 0 ? (
            <div className="m-4 sm:m-5 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No mentoring sessions have been delivered yet.
            </div>
          ) : (
            <>
              {/* Spotlight on the #1-ranked mentor */}
              <div className="mx-3 sm:mx-5 mt-4 sm:mt-5 mb-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4 flex flex-wrap items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-14 h-14 rounded-full ${AVATAR_CLASSES[0]} font-bold text-base flex items-center justify-center border-2 border-amber-300`}
                  >
                    {getInitials(rankedMentors[0].info.user_name)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <Award className="w-3 h-3 text-white" />
                  </span>
                </div>
                <div className="flex-1 basis-40 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold">
                    Top mentor by sessions delivered
                  </p>
                  <p className="font-bold text-base break-words">
                    {rankedMentors[0].info.user_name}
                  </p>
                  <p className="text-xs text-muted-foreground break-words">
                    {rankedMentors[0].info.email}
                  </p>
                </div>
                <div className="flex flex-1 basis-72 items-end gap-6 justify-around sm:justify-end">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                      {rankedMentors[0].sessions.completed.toLocaleString()}
                    </p>
                    <p className="text-xs font-medium">Sessions delivered</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-muted-foreground tabular-nums">
                      {rankedMentors[0].sessions.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total sessions
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-muted-foreground tabular-nums">
                      {rankedMentors[0].feedback.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Feedback</p>
                  </div>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[40rem] text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-t mt-2">
                      <th className="text-left px-3 sm:px-5 py-3 font-medium w-14 sm:w-16">
                        Rank
                      </th>
                      <th className="text-left px-3 sm:px-5 py-3 font-medium">
                        Mentor
                      </th>
                      {[
                        "Sessions delivered",
                        "Total sessions",
                        "Rejected",
                        "Feedback"
                      ].map((col) => (
                        <th
                          key={col}
                          className="text-center px-3 sm:px-5 py-3 font-medium whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rankedMentors.map((m) => (
                      <tr
                        key={m.info.email}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 sm:px-5 py-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "w-7 h-7 p-0 rounded-full flex-shrink-0 justify-center text-sm",
                              RANK_BADGE_CLASSES[m.rank] ??
                                "border-transparent text-muted-foreground font-medium"
                            )}
                          >
                            {m.rank}
                          </Badge>
                        </td>
                        <td className="px-3 sm:px-5 py-4">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="relative flex-shrink-0">
                              <span
                                className={`w-8 h-8 rounded-full ${AVATAR_CLASSES[(m.rank - 1) % AVATAR_CLASSES.length]} text-[11px] font-bold flex items-center justify-center`}
                              >
                                {getInitials(m.info.user_name)}
                              </span>
                              {m.rank === 1 && (
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                                  <Award className="w-2.5 h-2.5 text-white" />
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium whitespace-nowrap">
                                {m.info.user_name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {m.info.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-5 py-4 text-center font-semibold tabular-nums">
                          {m.sessions.completed.toLocaleString()}
                        </td>
                        <td className="px-3 sm:px-5 py-4 text-center tabular-nums">
                          {m.sessions.total.toLocaleString()}
                        </td>
                        <td className="px-3 sm:px-5 py-4 text-center text-muted-foreground tabular-nums">
                          {m.sessions.rejected.toLocaleString()}
                        </td>
                        <td className="px-3 sm:px-5 py-4 text-center text-muted-foreground tabular-nums">
                          {m.feedback.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AnalyticsPage>
  )
}
