"use client"

import { Award } from "lucide-react"
import { useAtomValue } from "jotai"
import { AnalyticsPage, SnapshotLoading } from "./AnalyticsPage"
import { adminAnalyticsStore } from "@/src/store/adminAnalytics/adminAnalyticsStore"
import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/src/lib/utils"
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
import { getInitials } from "./format"

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

  return (
    <AnalyticsPage
      title="Mentor leaderboard"
      description="Mentors ranked by total sessions delivered."
    >
      <Card className="min-w-0">
        <CardHeader className="p-4 sm:p-5 border-b">
          <CardTitle className="text-sm">Mentor leaderboard</CardTitle>
          <CardDescription>Ranked by total sessions delivered</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {mentorship === null ? (
            <div className="m-4 sm:m-5 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <span>Couldn&apos;t load the mentor leaderboard.</span>
              {/* Not implemented: no refetch action exists yet, so Retry is a visual placeholder per the ticket's message spec. */}
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : rankedMentors.length === 0 ? (
            <div className="m-4 sm:m-5 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No mentoring sessions have been delivered yet.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[28rem] text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="text-left px-3 sm:px-5 py-3 font-medium w-14 sm:w-16">
                      Rank
                    </th>
                    <th className="text-left px-3 sm:px-5 py-3 font-medium">
                      Mentor
                    </th>
                    <th className="text-right px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                      Sessions
                    </th>
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
                          <p className="font-medium whitespace-nowrap">
                            {m.info.user_name}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-5 py-4 text-right font-semibold tabular-nums">
                        {m.sessions.completed.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AnalyticsPage>
  )
}
