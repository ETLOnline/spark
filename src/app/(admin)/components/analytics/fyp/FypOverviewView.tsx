"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/src/components/ui/table"
import { Skeleton } from "@/src/components/ui/skeleton"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetFypAcademicYearsAction,
  GetFypPlatformStatsAction,
  GetFypUniversitiesOverviewAction
} from "@/src/server-actions/Fyp/Fyp"
import type {
  FypPlatformStats,
  FypUniversityOverview
} from "@/src/types/Fyp/Fyp"
import { AnalyticsPage, SnapshotLoading } from "../AnalyticsPage"
import { KpiCard } from "../KpiCard"

const ALL = "all"

export default function FypOverviewView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const academicYear = searchParams.get("academicYear") || undefined

  const [years, setYears] = useState<string[]>([])
  const [universities, setUniversities] = useState<FypUniversityOverview[]>([])
  const [stats, setStats] = useState<FypPlatformStats | null>(null)

  const [universitiesLoading, , , fetchUniversities] = useServerAction(
    GetFypUniversitiesOverviewAction
  )
  const [, , , fetchStats] = useServerAction(GetFypPlatformStatsAction)
  const [, , , fetchYears] = useServerAction(GetFypAcademicYearsAction)

  useEffect(() => {
    fetchYears().then((res) => {
      if (res?.success && res.data) setYears(res.data)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchUniversities({ academicYear }).then((res) => {
      if (res?.success && res.data) setUniversities(res.data)
    })
    fetchStats({ academicYear }).then((res) => {
      if (res?.success && res.data) setStats(res.data)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academicYear])

  const setAcademicYear = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === ALL) params.delete("academicYear")
    else params.set("academicYear", value)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const kpis = stats
    ? [
        {
          label: "Total running FYPs",
          value: stats.runningCount.toLocaleString(),
          sub: `across ${stats.universitiesCount.toLocaleString()} universities`
        },
        {
          label: "Students engaged",
          value: stats.studentsEngaged.toLocaleString(),
          sub: `${stats.avgStudentsPerTeam.toFixed(1)} per team on average`
        },
        {
          label: "Active advisors",
          value: stats.advisorsCount.toLocaleString(),
          sub: `${stats.avgFypsPerAdvisor.toFixed(1)} FYPs per advisor`
        },
        {
          label: "Completed FYPs",
          value: stats.completedCount.toLocaleString(),
          sub: "View completed listing",
          href: "/admin/analytics/fyp/completed"
        }
      ]
    : []

  if (universitiesLoading && universities.length === 0 && !stats) {
    return <SnapshotLoading />
  }

  return (
    <AnalyticsPage
      title="Final Year Projects — all universities"
      description="Running FYPs across every FYP-enabled university community."
      aside={
        <Select value={academicYear ?? ALL} onValueChange={setAcademicYear}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Academic year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <KpiCard columns={4} items={kpis} />

      <Card>
        <CardContent className="p-4 sm:p-5 border-b flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">FYPs by university</h2>
          <p className="text-xs text-muted-foreground">
            View FYPs to see that university's projects
          </p>
        </CardContent>
        <CardContent className="p-0">
          {universitiesLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : universities.length === 0 ? (
            <NoDataCard
              title="No FYP-enabled universities"
              description="Enable FYP for a community to see it here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>University</TableHead>
                  <TableHead className="text-right">Running FYPs</TableHead>
                  <TableHead className="text-right">Students engaged</TableHead>
                  <TableHead className="text-right">Advisors</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {universities.map((u) => (
                  <TableRow
                    key={u.communityId}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/admin/analytics/fyp/${u.communityId}`)
                    }
                  >
                    <TableCell>
                      <p className="font-medium">{u.title}</p>
                      {u.topDomain && (
                        <p className="text-xs text-muted-foreground">
                          top domain {u.topDomain}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {u.runningCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {u.studentsEngaged.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {u.advisorsCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/analytics/fyp/${u.communityId}`)
                        }}
                      >
                        View FYPs
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {stats && (
                  <TableRow className="font-semibold bg-muted/30">
                    <TableCell>All universities</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {stats.runningCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {stats.studentsEngaged.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {stats.advisorsCount.toLocaleString()}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AnalyticsPage>
  )
}
