"use client"

import { useState } from "react"
import {
  Star,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  CalendarCheck,
  Award
} from "lucide-react"
import { AnalyticsPage } from "@/src/components/Admin/Analytics/AnalyticsPage"
import { DonutChart } from "@/src/components/Admin/Analytics/DonutChart"
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
  SESSION_STATS,
  ALL_MENTORS,
  MENTORSHIP_KPIS,
  MENTORSHIP_AVAILABILITY,
  MENTORSHIP_FEEDBACK,
  RANK_BADGE_CLASSES
} from "../_data/constants"

const PAGE_SIZE = 8

type SortMode = "rating" | "sessions"

const SESSION_STROKES: Record<string, string> = {
  Completed: "#10b981",
  Rejected: "#f87171",
  Pending: "#fbbf24"
}

const pctOfMentors = (n: number) =>
  `${((n / MENTORSHIP_KPIS.total) * 100).toFixed(1)}% of mentors`

const KPIS = [
  {
    label: "Total mentors",
    value: MENTORSHIP_KPIS.total.toLocaleString(),
    sub: "Registered with the Mentor role",
    icon: GraduationCap
  },
  {
    label: "Active mentors",
    value: MENTORSHIP_KPIS.active.toLocaleString(),
    sub: pctOfMentors(MENTORSHIP_KPIS.active),
    icon: UserCheck
  },
  {
    label: "Verified mentors",
    value: MENTORSHIP_KPIS.verified.toLocaleString(),
    sub: pctOfMentors(MENTORSHIP_KPIS.verified),
    icon: ShieldCheck
  },
  {
    label: "Sessions completed",
    value: MENTORSHIP_KPIS.sessions_completed.toLocaleString(),
    sub: "Delivered by mentors, all time",
    icon: CalendarCheck
  }
]

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-end">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
      <span className="font-semibold">{value}</span>
    </div>
  )
}

export default function MentorshipAnalyticsPage() {
  const [page, setPage] = useState(1)
  const [sortMode, setSortMode] = useState<SortMode>("rating")

  const sorted = [...ALL_MENTORS].sort((a, b) =>
    sortMode === "rating" ? b.rating - a.rating : b.sessions - a.sessions
  )

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const mentors = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const globalOffset = (page - 1) * PAGE_SIZE
  const topMentor = sorted[0]

  return (
    <AnalyticsPage
      title="Mentorship analytics"
      description="Mentors, sessions, availability and feedback across the mentorship marketplace."
    >
      <KpiCard columns={4} items={KPIS} />

      {/* Sessions + Availability + Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 [&>*]:min-w-0">
        {/* Sessions donut */}
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-0">
            <CardTitle className="text-sm">Sessions</CardTitle>
            <CardDescription>All session requests by status</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-4">
            {/* Wraps the legend under the donut whenever the card itself is narrow */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              <DonutChart
                className="flex-shrink-0"
                svgClassName="w-24 h-24"
                size={96}
                radius={36}
                strokeWidth={12}
                trackClassName="text-muted/30"
                unit={2.262}
                gap="full"
                startOffset={25}
                segmentRotation={-90}
                segments={SESSION_STATS.map((s) => ({
                  key: s.label,
                  value: s.pct,
                  color: SESSION_STROKES[s.label]
                }))}
              >
                <span className="text-lg font-bold leading-none">
                  {SESSION_STATS.reduce(
                    (s, r) => s + r.count,
                    0
                  ).toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  sessions
                </span>
              </DonutChart>
              {/* Legend */}
              <div className="flex flex-col gap-2 flex-1 basis-48 min-w-0">
                {[
                  ...SESSION_STATS,
                  { label: "Total", count: 6180, pct: 100, color: "" }
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
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {s.pct}%
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
                  {MENTORSHIP_AVAILABILITY.active_slots.toLocaleString()}
                </CardTitle>
              </Card>
              <Card className="min-w-0 rounded-lg border-0 bg-muted/40 p-3 shadow-none">
                <CardDescription className="text-xs">
                  Total slots
                </CardDescription>
                <CardTitle className="text-xl sm:text-2xl leading-7 sm:leading-8 tracking-normal font-bold mt-0.5 [overflow-wrap:anywhere]">
                  {MENTORSHIP_AVAILABILITY.total_slots.toLocaleString()}
                </CardTitle>
              </Card>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Active share</span>
                <span className="font-medium">
                  {MENTORSHIP_AVAILABILITY.active_pct}%
                </span>
              </div>
              <Progress
                value={MENTORSHIP_AVAILABILITY.active_pct}
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
            <CardDescription>Mentee ratings after sessions</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Rating */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-bold">
                    {MENTORSHIP_FEEDBACK.avg_rating}
                  </span>
                  <span className="text-muted-foreground mb-1">/ 5</span>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.floor(MENTORSHIP_FEEDBACK.avg_rating) ? "fill-amber-400 text-amber-400" : "fill-amber-200 text-amber-200"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Average rating</p>
              </div>
              {/* Feedback count box */}
              <div className="flex-1 basis-40 min-w-0 rounded-lg bg-muted/40 p-3 flex flex-col gap-0.5">
                <p className="text-xs text-muted-foreground">
                  Feedback received
                </p>
                <p className="text-2xl font-bold">
                  {MENTORSHIP_FEEDBACK.total.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {MENTORSHIP_FEEDBACK.pct_of_completed}% of completed sessions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mentor ranking */}
      <Card className="min-w-0">
        <CardHeader className="p-4 sm:p-5 border-b flex flex-col sm:flex-row items-start justify-between gap-3 space-y-0">
          <div className="min-w-0">
            <CardTitle className="text-sm">Mentor ranking</CardTitle>
            <CardDescription>
              {sortMode === "rating"
                ? "Ranked by average mentee rating"
                : "Ranked by completed sessions"}
            </CardDescription>
          </div>
          <Tabs
            value={sortMode}
            onValueChange={(v) => {
              setSortMode(v as SortMode)
              setPage(1)
            }}
          >
            <TabsList className="h-8 flex-shrink-0">
              <TabsTrigger value="sessions" className="text-xs">
                Completed sessions
              </TabsTrigger>
              <TabsTrigger value="rating" className="text-xs">
                Rating
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-0">
          {/* Highest rated / most sessions highlight */}
          <div className="mx-3 sm:mx-5 mt-4 sm:mt-5 mb-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4 flex flex-wrap items-center gap-4">
            <div className="relative flex-shrink-0">
              <div
                className={`w-14 h-14 rounded-full ${topMentor.avatarBg} font-bold text-base flex items-center justify-center border-2 border-amber-300`}
              >
                {topMentor.initials}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                <Award className="w-3 h-3 text-white" />
              </span>
            </div>
            <div className="flex-1 basis-40 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold">
                {sortMode === "rating"
                  ? "Highest rated mentor"
                  : "Most sessions mentor"}
              </p>
              <p className="font-bold text-base break-words">
                {topMentor.name}
              </p>
            </div>
            {/* Stats on right — drop onto their own row when the card is narrow (e.g. iPad Mini with sidebar) */}
            <div className="flex flex-1 basis-60 items-center gap-6 justify-around sm:justify-end">
              <div className="text-right">
                <p className="text-2xl font-bold">{topMentor.sessions}</p>
                <p className="text-xs text-muted-foreground">
                  completed sessions
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{topMentor.rating}</p>
                <p className="text-xs text-muted-foreground">
                  avg rating · {topMentor.reviews} reviews
                </p>
              </div>
            </div>
          </div>

          {/* Same pattern as the Top communities table: fixed minimum width, scrolls inside the card */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-t mt-2">
                  <th className="text-left px-3 sm:px-5 py-3 font-medium w-14 sm:w-16">
                    Rank
                  </th>
                  <th className="text-left px-3 sm:px-5 py-3 font-medium">
                    Mentor
                  </th>
                  <th className="text-right px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                    Completed sessions
                  </th>
                  <th className="text-right px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                    Average rating
                  </th>
                  <th className="text-right px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                    Reviews
                  </th>
                </tr>
              </thead>
              <tbody>
                {mentors.map((m, i) => {
                  const rank = globalOffset + i + 1
                  return (
                    <tr
                      key={m.name}
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
                            className={`w-8 h-8 rounded-full ${m.avatarBg} text-[11px] font-bold flex items-center justify-center flex-shrink-0`}
                          >
                            {m.initials}
                          </span>
                          <span className="font-medium whitespace-nowrap">
                            {m.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-5 py-4 text-right tabular-nums">
                        {m.sessions}
                      </td>
                      <td className="px-3 sm:px-5 py-4 text-right">
                        <StarRating value={m.rating} />
                      </td>
                      <td className="px-3 sm:px-5 py-4 text-right text-muted-foreground tabular-nums">
                        {m.reviews}
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
              {Math.min(page * PAGE_SIZE, ALL_MENTORS.length)} of{" "}
              {ALL_MENTORS.length.toLocaleString()} active mentors
            </span>
            <div className="sm:ml-auto">
              <PaginationComponent
                pagination={{
                  total: ALL_MENTORS.length,
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
