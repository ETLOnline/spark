"use client"

import { useState } from "react"
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  UserCog,
  CircleDot
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { AnalyticsPage, SnapshotUnavailable } from "./AnalyticsPage"
import { DonutChart } from "./DonutChart"
import { KpiCard } from "./KpiCard"
import { Progress } from "@/src/components/ui/progress"
import { UsersReport } from "@/src/types/Reporting/Reporting.schema"
import { formatCount, formatPercent, humanizeKey, toPercent } from "./format"

const ALL_ROLES = "all"

/** One row of user stats — the whole user base or a single role. Roles carry no `inactive` count. */
interface UserStats {
  total: number
  active: number | null
  inactive: number | null
  verified: number
  completed_profiles: number
  online: number | null
}

function AccountHealthCard({
  stats,
  label
}: {
  stats: UserStats
  label: string
}) {
  const metrics = [
    {
      label: "Active",
      users: stats.active,
      color: "bg-emerald-500"
    },
    {
      label: "Inactive",
      users: stats.inactive,
      color: "bg-amber-400"
    },
    {
      label: "Verified",
      users: stats.verified,
      color: "bg-blue-500"
    },
    {
      label: "Completed profiles",
      users: stats.completed_profiles,
      color: "bg-violet-500"
    },
    {
      label: "Online now",
      users: stats.online,
      color: "bg-primary"
    }
  ]

  return (
    <Card className="min-w-0">
      <CardHeader className="p-4 sm:p-5 pb-0">
        <CardTitle className="text-sm">Account health · {label}</CardTitle>
        <CardDescription>
          Share of {stats.total.toLocaleString()} users
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-4">
        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <DonutChart
              svgClassName="w-28 h-28 -rotate-90"
              radius={30}
              strokeWidth={14}
              trackClassName="text-muted"
              segments={[
                {
                  key: "active",
                  value: toPercent(stats.active, stats.total) ?? 0,
                  className: "text-emerald-500"
                },
                {
                  key: "inactive",
                  value: toPercent(stats.inactive, stats.total) ?? 0,
                  className: "text-amber-400"
                }
              ]}
            >
              <span className="text-base font-bold">
                {formatPercent(stats.active, stats.total)}
              </span>
              <span className="text-[10px] text-muted-foreground">active</span>
            </DonutChart>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Inactive
              </span>
            </div>
          </div>

          <div className="w-full lg:flex-1 min-w-0 overflow-x-auto">
            <table className="w-full min-w-[20rem] text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b">
                  <th className="text-left pb-2 font-medium">Metric</th>
                  <th className="text-right pb-2 font-medium w-20">Users</th>
                  <th className="text-right pb-2 font-medium w-16">Share</th>
                  <th className="pb-2 w-20 sm:w-36 pl-3" />
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.label} className="border-b last:border-0">
                    <td className="py-2.5 pr-3 sm:pr-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${m.color}`}
                        />
                        <span>{m.label}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-semibold w-20">
                      {formatCount(m.users)}
                    </td>
                    <td className="py-2.5 text-right text-muted-foreground w-16">
                      {formatPercent(m.users, stats.total)}
                    </td>
                    <td className="py-2.5 pl-3 w-20 sm:w-36">
                      <Progress
                        value={toPercent(m.users, stats.total) ?? 0}
                        className="bg-muted"
                        indicatorClassName={`${m.color} rounded-full transition-none`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatCell({ value, total }: { value: number | null; total: number }) {
  return (
    <td className="px-3 sm:px-5 py-3 text-right whitespace-nowrap">
      <div>{formatCount(value)}</div>
      <div className="text-xs text-muted-foreground font-normal">
        {formatPercent(value, total)}
      </div>
    </td>
  )
}

export default function UsersAnalyticsView({
  users
}: {
  users: UsersReport | null
}) {
  const [selectedRole, setSelectedRole] = useState(ALL_ROLES)

  if (!users) {
    return (
      <AnalyticsPage title="User reporting">
        <SnapshotUnavailable />
      </AnalyticsPage>
    )
  }

  const roles = Object.entries(users.roles).map(([name, stats]) => ({
    name,
    label: humanizeKey(name),
    stats: { ...stats, inactive: null } as UserStats
  }))
  const selected = roles.find((r) => r.name === selectedRole)
  const stats: UserStats = selected?.stats ?? users
  const selectedLabel = selected?.label ?? "All roles"

  const shareOf = (n: number | null) =>
    `${formatPercent(n, stats.total)} of ${selected ? "role" : "all users"}`

  const statCards = [
    {
      label: "Total users",
      value: formatCount(stats.total),
      sub: selected ? `${selectedLabel} accounts` : "All registered accounts",
      icon: Users
    },
    {
      label: "Active",
      value: formatCount(stats.active),
      sub: shareOf(stats.active),
      icon: UserCheck
    },
    {
      label: "Inactive",
      value: formatCount(stats.inactive),
      sub: shareOf(stats.inactive),
      icon: UserX
    },
    {
      label: "Verified",
      value: formatCount(stats.verified),
      sub: shareOf(stats.verified),
      icon: ShieldCheck
    },
    {
      label: "Completed profiles",
      value: formatCount(stats.completed_profiles),
      sub: shareOf(stats.completed_profiles),
      icon: UserCog
    },
    {
      label: "Online now",
      value: formatCount(stats.online),
      sub: "At snapshot time",
      icon: CircleDot
    }
  ]

  const roleChips = [
    { name: ALL_ROLES, label: "All roles", total: users.total },
    ...roles.map((r) => ({
      name: r.name,
      label: r.label,
      total: r.stats.total
    }))
  ]

  return (
    <AnalyticsPage
      title="User reporting"
      description="Account status, verification, profile completion and presence — for all users or one role."
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground mr-1">
          Role
        </span>
        {roleChips.map((r) => (
          <Button
            key={r.name}
            type="button"
            variant="outline"
            onClick={() => setSelectedRole(r.name)}
            className={`h-auto gap-1 px-3 py-1.5 rounded-full text-sm font-normal shadow-none transition-colors ${
              selectedRole === r.name
                ? "bg-foreground text-background border-foreground font-medium hover:bg-foreground hover:text-background"
                : "border-border bg-card hover:bg-muted text-foreground hover:text-foreground"
            }`}
          >
            {r.label}{" "}
            <span
              className={`ml-1 ${selectedRole === r.name ? "font-semibold" : "text-muted-foreground"}`}
            >
              {r.total.toLocaleString()}
            </span>
          </Button>
        ))}
      </div>

      <KpiCard items={statCards} variant="compact" />

      <AccountHealthCard stats={stats} label={selectedLabel} />

      <Card className="min-w-0">
        <CardHeader className="p-4 sm:p-5 border-b">
          <CardTitle className="text-sm">Breakdown by role</CardTitle>
          <CardDescription>
            Every user metric per global role. Percentages are of that
            role&apos;s total. Select a role to focus the page on it.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[40rem] text-sm border-separate border-spacing-0 [&_th]:border-b [&_td]:border-b [&_tbody_tr:last-child_td]:border-b-0">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-left px-3 sm:px-5 py-3 font-medium">
                    Role
                  </th>
                  {[
                    "Total",
                    "Active",
                    "Inactive",
                    "Verified",
                    "Completed",
                    "Online"
                  ].map((col) => (
                    <th
                      key={col}
                      className="text-right px-3 sm:px-5 py-3 whitespace-nowrap font-medium"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ...roles,
                  {
                    name: ALL_ROLES,
                    label: "All users",
                    stats: users as UserStats
                  }
                ].map((r) => {
                  const isAll = r.name === ALL_ROLES
                  return (
                    <tr
                      key={r.name}
                      onClick={() => setSelectedRole(r.name)}
                      className={`cursor-pointer hover:bg-muted/30 transition-colors ${isAll ? "font-semibold bg-muted/20" : ""}`}
                    >
                      <td className="px-3 sm:px-5 py-3">
                        <div className="w-[8.5rem] sm:w-auto sm:min-w-[9rem]">
                          <p className="break-words">{r.label}</p>
                          {!isAll && (
                            <p className="text-xs text-muted-foreground font-normal">
                              {formatPercent(r.stats.total, users.total)} of
                              users
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-5 py-3 text-right whitespace-nowrap">
                        {r.stats.total.toLocaleString()}
                      </td>
                      <StatCell value={r.stats.active} total={r.stats.total} />
                      <StatCell
                        value={r.stats.inactive}
                        total={r.stats.total}
                      />
                      <StatCell
                        value={r.stats.verified}
                        total={r.stats.total}
                      />
                      <StatCell
                        value={r.stats.completed_profiles}
                        total={r.stats.total}
                      />
                      <StatCell value={r.stats.online} total={r.stats.total} />
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AnalyticsPage>
  )
}
