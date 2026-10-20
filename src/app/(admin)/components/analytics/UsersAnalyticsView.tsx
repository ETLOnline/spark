"use client"

import { useState } from "react"
import { Users, ShieldCheck, UserCog } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { useAtomValue } from "jotai"
import {
  AnalyticsPage,
  SnapshotLoading,
  SnapshotUnavailable
} from "./AnalyticsPage"
import { adminAnalyticsStore } from "@/src/store/adminAnalytics/adminAnalyticsStore"
import { KpiCard } from "./KpiCard"
import { UserSegmentCard } from "./UserSegmentCard"
import { formatCount, formatPercent, humanizeKey } from "./format"

const ALL_ROLES = "all"

/**
 * One row of user stats — the whole user base or a single role. Only
 * total/verified/completed_profiles are shown: active/inactive/online have
 * no backing data (no status/activity/presence column on `users`) and aren't
 * part of any shipped ticket, so they're left out of this page entirely.
 */
interface UserStats {
  total: number
  verified: number
  completed_profiles: number
}

function StatCell({ value, total }: { value: number; total: number }) {
  return (
    <td className="px-3 sm:px-5 py-3 text-right whitespace-nowrap">
      <div>{formatCount(value)}</div>
      <div className="text-xs text-muted-foreground font-normal">
        {formatPercent(value, total)}
      </div>
    </td>
  )
}

export default function UsersAnalyticsView() {
  const snapshot = useAtomValue(adminAnalyticsStore.snapshot)
  const isLoading = useAtomValue(adminAnalyticsStore.LoadingSnapshot)
  const users = snapshot?.users ?? null
  const [selectedRole, setSelectedRole] = useState(ALL_ROLES)

  if (isLoading) return <SnapshotLoading />

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
    stats: {
      total: stats.total,
      verified: stats.verified,
      completed_profiles: stats.completed_profiles
    } as UserStats
  }))
  const selected = roles.find((r) => r.name === selectedRole)
  const stats: UserStats = selected?.stats ?? users
  const selectedLabel = selected?.label ?? "All roles"

  const shareOf = (n: number) =>
    `${formatPercent(n, stats.total)} of ${selected ? "role" : "all users"}`

  const statCards = [
    {
      label: "Total users",
      value: formatCount(stats.total),
      sub: selected ? `${selectedLabel} accounts` : "All registered accounts",
      icon: Users
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
      description="Verification and profile completion — for all users or one role."
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

      <UserSegmentCard users={users} error={false} />

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
                  {["Total", "Verified", "Completed"].map((col) => (
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
                      <StatCell
                        value={r.stats.verified}
                        total={r.stats.total}
                      />
                      <StatCell
                        value={r.stats.completed_profiles}
                        total={r.stats.total}
                      />
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
