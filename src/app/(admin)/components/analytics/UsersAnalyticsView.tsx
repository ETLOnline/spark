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
import { AnalyticsPage } from "./AnalyticsPage"
import { DonutChart } from "./DonutChart"
import { KpiCard } from "./KpiCard"
import { Progress } from "@/src/components/ui/progress"
import {
  ROLES,
  KPI_BY_ROLE,
  BREAKDOWN_ROWS
} from "../../admin/analytics/_data/constants"

function AccountHealthCard({ kpi }: { kpi: (typeof KPI_BY_ROLE)["all"] }) {
  const activePct = kpi.active / kpi.total
  const inactivePct = kpi.inactive / kpi.total

  const metrics = [
    {
      label: "Active",
      users: kpi.active,
      pct: kpi.active / kpi.total,
      color: "bg-emerald-500",
      stroke: "text-emerald-500"
    },
    {
      label: "Inactive",
      users: kpi.inactive,
      pct: kpi.inactive / kpi.total,
      color: "bg-amber-400",
      stroke: "text-amber-400"
    },
    {
      label: "Verified",
      users: kpi.verified,
      pct: kpi.verified / kpi.total,
      color: "bg-blue-500",
      stroke: "text-blue-500"
    },
    {
      label: "Completed profiles",
      users: kpi.completed,
      pct: kpi.completed / kpi.total,
      color: "bg-violet-500",
      stroke: "text-violet-500"
    },
    {
      label: "Online now",
      users: kpi.online,
      pct: kpi.online / kpi.total,
      color: "bg-primary",
      stroke: "text-primary"
    }
  ]

  return (
    <Card className="min-w-0">
      <CardHeader className="p-4 sm:p-5 pb-0">
        <CardTitle className="text-sm">Account health · All roles</CardTitle>
        <CardDescription>
          Share of {kpi.total.toLocaleString()} all users
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-4">
        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <DonutChart
              svgClassName="w-28 h-28 -rotate-90"
              radius={30}
              strokeWidth={14}
              segments={[
                {
                  key: "active",
                  value: activePct * 100,
                  className: "text-emerald-500"
                },
                {
                  key: "inactive",
                  value: inactivePct * 100,
                  className: "text-amber-400"
                }
              ]}
            >
              <span className="text-base font-bold">
                {(activePct * 100).toFixed(1)}%
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
                      {m.users.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right text-muted-foreground w-16">
                      {(m.pct * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 pl-3 w-20 sm:w-36">
                      <Progress
                        value={m.pct * 100}
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

export default function UsersAnalyticsView() {
  const [selectedRole, setSelectedRole] = useState("all")
  const kpi = KPI_BY_ROLE[selectedRole]

  const pct = (n: number) =>
    `${((n / kpi.total) * 100).toFixed(1)}% of all users`

  const statCards = [
    {
      label: "Total users",
      value: kpi.total.toLocaleString(),
      sub: "All registered accounts",
      icon: Users
    },
    {
      label: "Active",
      value: kpi.active.toLocaleString(),
      sub: pct(kpi.active),
      icon: UserCheck
    },
    {
      label: "Inactive",
      value: kpi.inactive.toLocaleString(),
      sub: pct(kpi.inactive),
      icon: UserX
    },
    {
      label: "Verified",
      value: kpi.verified.toLocaleString(),
      sub: pct(kpi.verified),
      icon: ShieldCheck
    },
    {
      label: "Completed profiles",
      value: kpi.completed.toLocaleString(),
      sub: pct(kpi.completed),
      icon: UserCog
    },
    {
      label: "Online now",
      value: kpi.online.toLocaleString(),
      sub: "At snapshot time",
      icon: CircleDot
    }
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
        {ROLES.map((r) => (
          <Button
            key={r.key}
            type="button"
            variant="outline"
            onClick={() => setSelectedRole(r.key)}
            className={`h-auto gap-1 px-3 py-1.5 rounded-full text-sm font-normal shadow-none transition-colors ${
              selectedRole === r.key
                ? "bg-foreground text-background border-foreground font-medium hover:bg-foreground hover:text-background"
                : "border-border bg-card hover:bg-muted text-foreground hover:text-foreground"
            }`}
          >
            {r.label}{" "}
            <span
              className={`ml-1 ${selectedRole === r.key ? "font-semibold" : "text-muted-foreground"}`}
            >
              {r.total.toLocaleString()}
            </span>
          </Button>
        ))}
      </div>

      <KpiCard items={statCards} variant="compact" />

      <AccountHealthCard kpi={kpi} />

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
                  <th className="text-right px-3 sm:px-5 py-3 whitespace-nowrap font-medium">
                    Total
                  </th>
                  <th className="text-right px-3 sm:px-5 py-3 whitespace-nowrap font-medium">
                    Active
                  </th>
                  <th className="text-right px-3 sm:px-5 py-3 whitespace-nowrap font-medium">
                    Inactive
                  </th>
                  <th className="text-right px-3 sm:px-5 py-3 whitespace-nowrap font-medium">
                    Verified
                  </th>
                  <th className="text-right px-3 sm:px-5 py-3 whitespace-nowrap font-medium">
                    Completed
                  </th>
                  <th className="text-right px-3 sm:px-5 py-3 whitespace-nowrap font-medium">
                    Online
                  </th>
                </tr>
              </thead>
              <tbody>
                {BREAKDOWN_ROWS.map((r, i) => (
                  <tr
                    key={r.role}
                    onClick={() => {
                      const match = ROLES.find(
                        (ro) =>
                          ro.label === r.role ||
                          (r.role === "All users" && ro.key === "all")
                      )
                      if (match) setSelectedRole(match.key)
                    }}
                    className={`cursor-pointer hover:bg-muted/30 transition-colors ${i === BREAKDOWN_ROWS.length - 1 ? "font-semibold bg-muted/20" : ""}`}
                  >
                    <td className="px-3 sm:px-5 py-3">
                      <div className="w-[8.5rem] sm:w-auto sm:min-w-[9rem]">
                        <p className="break-words">{r.role}</p>
                        {r.share && (
                          <p className="text-xs text-muted-foreground font-normal">
                            {r.share}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-right whitespace-nowrap">
                      {r.total.toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-right whitespace-nowrap">
                      <div>{r.active.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {r.activePct}
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-right whitespace-nowrap">
                      <div>{r.inactive.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {r.inactivePct}
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-right whitespace-nowrap">
                      <div>{r.verified.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {r.verifiedPct}
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-right whitespace-nowrap">
                      <div>{r.completed.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {r.completedPct}
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-right whitespace-nowrap">
                      <div>{r.online.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {r.onlinePct}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AnalyticsPage>
  )
}
