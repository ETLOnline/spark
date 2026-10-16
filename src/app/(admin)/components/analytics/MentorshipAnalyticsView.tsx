"use client"

import { useState } from "react"
import {
  GraduationCap,
  UserCheck,
  ShieldCheck,
  CalendarCheck,
  Award,
  MessageSquareText
} from "lucide-react"
import { useAtomValue } from "jotai"
import {
  AnalyticsPage,
  SnapshotLoading,
  SnapshotUnavailable
} from "./AnalyticsPage"
import { adminAnalyticsStore } from "@/src/store/adminAnalytics/adminAnalyticsStore"
import { DonutChart } from "./DonutChart"
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
import {
  AVATAR_CLASSES,
  RANK_BADGE_CLASSES
} from "../../admin/analytics/_data/constants"
import { formatPercent, getInitials, toPercent } from "./format"

const PAGE_SIZE = 8

export default function MentorshipAnalyticsView() {
  const snapshot = useAtomValue(adminAnalyticsStore.snapshot)
  const isLoading = useAtomValue(adminAnalyticsStore.LoadingSnapshot)
  const mentorship = snapshot?.mentorship ?? null
  const [page, setPage] = useState(1)

  if (isLoading) return <SnapshotLoading />

  if (!mentorship) {
    return (
      <AnalyticsPage title="Mentorship analytics">
        <SnapshotUnavailable />
      </AnalyticsPage>
    )
  }

  const { sessions, availability, feedback } = mentorship
  const pctOfMentors = (n: number) =>
    `${formatPercent(n, mentorship.total)} of mentors`

  const kpis = [
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
      value: sessions.completed.toLocaleString(),
      sub: "Delivered by mentors, all time",
      icon: CalendarCheck
    }
  ]

  const sessionStats = [
    {
      label: "Completed",
      count: sessions.completed,
      color: "bg-emerald-500",
      stroke: "text-emerald-500"
    },
    {
      label: "Rejected",
      count: sessions.rejected,
      color: "bg-red-400",
      stroke: "text-red-400"
    },
    {
      label: "Pending",
      count: sessions.pending,
      color: "bg-amber-400",
      stroke: "text-amber-400"
    }
  ]

  // Already ranked by total sessions (desc) in the snapshot.
  const mentors = mentorship.ranking.users
  const totalPages = Math.ceil(mentors.length / PAGE_SIZE)
  const globalOffset = (page - 1) * PAGE_SIZE
  const pageMentors = mentors.slice(globalOffset, page * PAGE_SIZE)
  const topMentor = mentors[0]

  return (
    <AnalyticsPage
      title="Mentorship analytics"
      description="Mentors, sessions, availability and feedback across the mentorship marketplace."
    >
      <KpiCard columns={4} items={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 [&>*]:min-w-0">
        {/* Sessions donut */}
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-0">
            <CardTitle className="text-sm">Sessions</CardTitle>
            <CardDescription>All session requests by status</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-4">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <DonutChart
                className="flex-shrink-0"
                svgClassName="w-24 h-24"
                size={96}
                radius={36}
                strokeWidth={12}
                trackClassName="text-muted/30"
                unit={2.262}
                // gap={0}
                startOffset={0}
                segmentRotation={-90}
                segments={sessionStats.map((s) => ({
                  key: s.label,
                  value:
                    sessions.total > 0 ? (s.count / sessions.total) * 100 : 0,
                  className: s.stroke
                }))}
              >
                <span className="text-lg font-bold leading-none">
                  {sessions.total.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  sessions
                </span>
              </DonutChart>
              <div className="flex flex-col gap-2 flex-1 basis-48 min-w-0">
                {[
                  ...sessionStats,
                  { label: "Total", count: sessions.total, color: "" }
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between gap-2 text-sm border-b last:border-0 pb-2 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {s.color ? (
                        <span
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.color}`}
                        />
                      ) : (
                        <span className="w-2.5 h-2.5" />
                      )}
                      <span
                        className={`truncate ${s.color ? "" : "font-semibold"}`}
                      >
                        {s.label}
                      </span>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <span className="font-semibold w-14 text-right tabular-nums">
                        {s.count.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {formatPercent(s.count, sessions.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-0">
            <CardTitle className="text-sm">Availability</CardTitle>
            <CardDescription>
              Mentor time slots open for booking
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="min-w-0 rounded-lg border-0 bg-muted/40 p-3 shadow-none">
                <CardDescription className="text-xs">
                  Active slots
                </CardDescription>
                <CardTitle className="text-xl sm:text-2xl leading-7 sm:leading-8 tracking-normal font-bold mt-0.5 [overflow-wrap:anywhere]">
                  {availability.active_slots.toLocaleString()}
                </CardTitle>
              </Card>
              <Card className="min-w-0 rounded-lg border-0 bg-muted/40 p-3 shadow-none">
                <CardDescription className="text-xs">
                  Total slots
                </CardDescription>
                <CardTitle className="text-xl sm:text-2xl leading-7 sm:leading-8 tracking-normal font-bold mt-0.5 [overflow-wrap:anywhere]">
                  {availability.total_slots.toLocaleString()}
                </CardTitle>
              </Card>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Active share</span>
                <span className="font-medium">
                  {formatPercent(
                    availability.active_slots,
                    availability.total_slots
                  )}
                </span>
              </div>
              <Progress
                value={
                  toPercent(
                    availability.active_slots,
                    availability.total_slots
                  ) ?? 0
                }
                className="bg-muted"
                indicatorClassName="bg-emerald-500 rounded-full transition-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader className="p-4 sm:p-5 pb-0">
            <CardTitle className="text-sm">Feedback</CardTitle>
            <CardDescription>Mentee feedback after sessions</CardDescription>
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
                  {feedback.total.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mentor ranking */}
      <Card className="min-w-0">
        <CardHeader className="p-4 sm:p-5 border-b">
          <CardTitle className="text-sm">Mentor ranking</CardTitle>
          <CardDescription>Ranked by total session requests</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {!topMentor ? (
            <SnapshotUnavailable className="m-4 sm:m-5" />
          ) : (
            <>
              <div className="mx-3 sm:mx-5 mt-4 sm:mt-5 mb-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4 flex flex-wrap items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-14 h-14 rounded-full ${AVATAR_CLASSES[0]} font-bold text-base flex items-center justify-center border-2 border-amber-300`}
                  >
                    {getInitials(topMentor.info.user_name)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <Award className="w-3 h-3 text-white" />
                  </span>
                </div>
                <div className="flex-1 basis-40 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold">
                    Most sessions mentor
                  </p>
                  <p className="font-bold text-base break-words">
                    {topMentor.info.user_name}
                  </p>
                  <p className="text-xs text-muted-foreground break-words">
                    {topMentor.info.email}
                  </p>
                </div>
                <div className="flex flex-1 basis-60 items-center gap-6 justify-around sm:justify-end">
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {topMentor.sessions.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      total sessions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {topMentor.sessions.completed.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      completed · {topMentor.feedback.total.toLocaleString()}{" "}
                      feedback
                    </p>
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
                        "Total sessions",
                        "Completed",
                        "Rejected",
                        "Feedback"
                      ].map((col) => (
                        <th
                          key={col}
                          className="text-right px-3 sm:px-5 py-3 font-medium whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageMentors.map((m, i) => {
                      const rank = globalOffset + i + 1
                      return (
                        <tr
                          key={m.info.email}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-3 sm:px-5 py-4">
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
                          <td className="px-3 sm:px-5 py-4">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <span
                                className={`w-8 h-8 rounded-full ${AVATAR_CLASSES[(rank - 1) % AVATAR_CLASSES.length]} text-[11px] font-bold flex items-center justify-center flex-shrink-0`}
                              >
                                {getInitials(m.info.user_name)}
                              </span>
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
                          <td className="px-3 sm:px-5 py-4 text-right font-semibold tabular-nums">
                            {m.sessions.total.toLocaleString()}
                          </td>
                          <td className="px-3 sm:px-5 py-4 text-right tabular-nums">
                            {m.sessions.completed.toLocaleString()}
                          </td>
                          <td className="px-3 sm:px-5 py-4 text-right text-muted-foreground tabular-nums">
                            {m.sessions.rejected.toLocaleString()}
                          </td>
                          <td className="px-3 sm:px-5 py-4 text-right text-muted-foreground tabular-nums">
                            {m.feedback.total.toLocaleString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-5 py-3 border-t">
                <span className="text-xs text-muted-foreground text-center sm:text-left">
                  Showing {globalOffset + 1}–
                  {Math.min(page * PAGE_SIZE, mentors.length)} of top{" "}
                  {mentors.length.toLocaleString()} mentors
                </span>
                {totalPages > 1 && (
                  <div className="sm:ml-auto">
                    <PaginationComponent
                      pagination={{
                        total: mentors.length,
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
