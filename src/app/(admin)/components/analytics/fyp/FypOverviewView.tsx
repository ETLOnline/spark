"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { Download, Search } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { Badge } from "@/src/components/ui/badge"
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
import PaginationComponent from "@/src/components/common/Pagination"
import type { PaginationType } from "@/src/components/common/types/pagination.type"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetFypAcademicYearsAction,
  GetFypDirectoryAction,
  GetFypPlatformStatsAction,
  GetFypUniversitiesOverviewAction
} from "@/src/server-actions/Fyp/Fyp"
import { GetAllTAgsAction } from "@/src/server-actions/Tag/Tag"
import type {
  FypDirectoryProject,
  FypPlatformStats,
  FypUniversityOverview
} from "@/src/types/Fyp/Fyp"
import type { SelectTag } from "@/src/db/schema"
import { AnalyticsPage, SnapshotLoading } from "../AnalyticsPage"
import { KpiCard } from "../KpiCard"
import { downloadCsv } from "../csv"

const ALL = "all"

export default function FypOverviewView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get("page") || "1", 10)
  const academicYear = searchParams.get("academicYear") || undefined
  const university = searchParams.get("university") || ALL
  const domain = searchParams.get("domain") || ALL

  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const [years, setYears] = useState<string[]>([])
  const [universities, setUniversities] = useState<FypUniversityOverview[]>([])
  const [stats, setStats] = useState<FypPlatformStats | null>(null)
  const [domainOptions, setDomainOptions] = useState<SelectTag[]>([])
  const [projects, setProjects] = useState<FypDirectoryProject[]>([])
  const [pagination, setPagination] = useState<PaginationType>()

  const [universitiesLoading, , , fetchUniversities] = useServerAction(
    GetFypUniversitiesOverviewAction
  )
  const [statsLoading, , , fetchStats] = useServerAction(
    GetFypPlatformStatsAction
  )
  const [directoryLoading, , , fetchDirectory] = useServerAction(
    GetFypDirectoryAction
  )
  const [, , , fetchYears] = useServerAction(GetFypAcademicYearsAction)
  const [, , , fetchTags] = useServerAction(GetAllTAgsAction)

  useEffect(() => {
    fetchYears().then((res) => {
      if (res?.success && res.data) setYears(res.data)
    })
    fetchTags("interest").then((res) => {
      if (res?.success) setDomainOptions(res.data)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchUniversities({ academicYear }).then((res) => {
      if (res?.success && res.data) setUniversities(res.data)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academicYear])

  useEffect(() => {
    fetchStats({
      academicYear,
      communityId: university !== ALL ? university : undefined,
      domainTagId: domain !== ALL ? Number(domain) : undefined,
      searchTerm: searchTerm || undefined
    }).then((res) => {
      if (res?.success && res.data) setStats(res.data)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academicYear, university, domain, searchTerm])

  useEffect(() => {
    fetchDirectory(
      {
        academicYear,
        communityId: university !== ALL ? university : undefined,
        domainTagId: domain !== ALL ? Number(domain) : undefined,
        searchTerm: searchTerm || undefined,
        bucket: "running"
      },
      page,
      10
    ).then((res) => {
      if (res?.success && res.data) {
        setProjects(res.data.projects)
        setPagination(res.data.pagination)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academicYear, university, domain, searchTerm, page])

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === ALL) params.delete(key)
      else params.set(key, value)
    })
    params.set("page", "1")
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearchTerm(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", "1")
    router.replace(`?${params.toString()}`, { scroll: false })
  }, 400)

  const resetFilters = () => {
    setSearchInput("")
    setSearchTerm("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("university")
    params.delete("domain")
    params.set("page", "1")
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const exportCsv = () => {
    downloadCsv(
      `fyp-directory-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Project", "University", "Domain", "Tech stack", "Advisor", "Team"],
      projects.map((p) => [
        p.projectName,
        p.universityTitle ?? "",
        p.domain ?? "",
        p.techStack.join("; "),
        p.industryAdvisor ?? "",
        p.teamSize
      ])
    )
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
        <div className="flex items-center gap-2">
          <Select
            value={academicYear ?? ALL}
            onValueChange={(value) =>
              updateParams({ academicYear: value === ALL ? undefined : value })
            }
          >
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
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={exportCsv}
            disabled={projects.length === 0}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      }
    >
      <KpiCard columns={4} items={kpis} />

      <Card>
        <CardContent className="p-4 sm:p-5 border-b flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">FYPs by university</h2>
          <p className="text-xs text-muted-foreground">
            Select a row to filter the directory below
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
                    onClick={() => updateParams({ university: u.communityId })}
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
                          updateParams({ university: u.communityId })
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

      <Card>
        <CardContent className="p-4 sm:p-5 border-b">
          <h2 className="text-sm font-semibold">FYP directory</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Each project's domain, tech stack, advisor and team.
          </p>
        </CardContent>
        <CardContent className="p-4 sm:p-5 border-b flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={university}
            onValueChange={(value) => updateParams({ university: value })}
          >
            <SelectTrigger className="sm:w-[220px]">
              <SelectValue placeholder="All universities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All universities</SelectItem>
              {universities.map((u) => (
                <SelectItem key={u.communityId} value={u.communityId}>
                  {u.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={domain}
            onValueChange={(value) => updateParams({ domain: value })}
          >
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="All domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All domains</SelectItem>
              {domainOptions.map((tag) => (
                <SelectItem key={tag.id} value={String(tag.id)}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Title, advisor or technology"
              className="pl-8"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                debouncedSetSearch(e.target.value)
              }}
            />
          </div>
          <Button type="button" variant="outline" onClick={resetFilters}>
            Reset
          </Button>
        </CardContent>

        {stats && (
          <CardContent className="px-4 sm:px-5 py-3 border-b text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {pagination?.total.toLocaleString() ?? 0}
            </span>{" "}
            FYPs ·{" "}
            <span className="font-semibold text-foreground">
              {stats.studentsEngaged.toLocaleString()}
            </span>{" "}
            students ·{" "}
            <span className="font-semibold text-foreground">
              {stats.advisorsCount.toLocaleString()}
            </span>{" "}
            advisors
          </CardContent>
        )}

        <CardContent className="p-0">
          {directoryLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <NoDataCard
              title="No FYPs found"
              description="No project matches the current filters."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Tech stack</TableHead>
                  <TableHead>Advisor</TableHead>
                  <TableHead className="text-right">Team</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.spaceId}>
                    <TableCell>
                      <p className="font-medium">{p.projectName}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.universityTitle}
                      </p>
                    </TableCell>
                    <TableCell>
                      {p.domain ? (
                        <Badge variant="outline">{p.domain}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {p.techStack.length > 0 ? (
                          p.techStack.map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="font-normal"
                            >
                              {t}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.industryAdvisor ?? (
                        <span className="text-muted-foreground">
                          Not assigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.teamSize} student{p.teamSize === 1 ? "" : "s"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t p-4 sm:flex-row">
              <span className="whitespace-nowrap text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} FYPs
              </span>
              <div className="w-fit">
                <PaginationComponent pagination={pagination} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AnalyticsPage>
  )
}
