"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { UsersReport } from "@/src/types/Reporting/Reporting.schema"
import { PieDonutChart } from "./PieDonutChart"
import {
  SERIES_BG_CLASSES,
  SERIES_STROKE_CLASSES
} from "../../admin/analytics/_data/constants"
import { humanizeKey, toExactPercentages } from "./format"

interface UserSegmentCardProps {
  users: UsersReport | null
  error: boolean
}

/** Pie chart of the user base by GLOBAL role, with a legend/count list beside it. Used on both the Overview page and the Users reporting page. */
export function UserSegmentCard({ users, error }: UserSegmentCardProps) {
  // users.roles is already scoped to role_type = GLOBAL at the query level
  // (see GetUserRoleBreakdownRaw) — identity-level roles like Student/Mentor,
  // not scoped ones like Channel Viewer. Render whatever comes back rather
  // than assuming a fixed set of names, so this stays correct as roles change.
  const segments = Object.entries(users?.roles ?? {}).map(
    ([name, stats], i) => ({
      segment: humanizeKey(name),
      count: stats.total,
      bg: SERIES_BG_CLASSES[i % SERIES_BG_CLASSES.length],
      text: SERIES_STROKE_CLASSES[i % SERIES_STROKE_CLASSES.length]
    })
  )
  const total = segments.reduce((sum, s) => sum + s.count, 0)
  const percentages = toExactPercentages(segments.map((s) => s.count))

  return (
    <Card className="w-full min-w-0">
      <CardHeader className="p-4 sm:p-5 pb-0">
        <CardTitle className="text-sm">User segmentation</CardTitle>
        <CardDescription>
          Current share of the user base by role
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-4">
        {error ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No data found
          </div>
        ) : total === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No user data available yet.
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <PieDonutChart
              className="self-center"
              centerValue={total}
              centerLabel="users"
              segments={segments.map((s, i) => ({
                label: s.segment,
                count: s.count,
                share: `${percentages[i]}%`,
                bg: s.bg,
                text: s.text
              }))}
            />

            <div className="flex flex-col gap-0.5 flex-1 basis-56 text-sm min-w-0">
              <div className="flex items-center justify-between pb-1 border-b mb-1">
                <span className="text-xs text-muted-foreground flex-1">
                  Segment
                </span>
                <span className="text-xs text-muted-foreground w-14 text-right">
                  Users
                </span>
                <span className="text-xs text-muted-foreground w-14 text-right">
                  Share
                </span>
              </div>
              {segments.map((s, i) => (
                <div
                  key={s.segment}
                  className="flex items-center justify-between py-1.5 border-b last:border-0"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.bg}`}
                    />
                    <span className="truncate">{s.segment}</span>
                  </div>
                  <span className="font-semibold w-14 text-right flex-shrink-0 tabular-nums">
                    {s.count.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground w-14 text-right flex-shrink-0">
                    {percentages[i]}%
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
