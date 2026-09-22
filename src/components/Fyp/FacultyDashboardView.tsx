"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import {
  ArrowLeft,
  ClipboardList,
  UserCheck,
  Clock,
  UserX,
  Flag,
  Search,
  Eye
} from "lucide-react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
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
import { Progress } from "@/src/components/ui/progress"
import { Skeleton } from "@/src/components/ui/skeleton"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import PaginationComponent from "@/src/components/common/Pagination"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetFypDashboardProjectsAction,
  GetFypDashboardStatsAction
} from "@/src/server-actions/Fyp/Fyp"
import { GetAllTAgsAction } from "@/src/server-actions/Tag/Tag"
import { SelectTag } from "@/src/db/schema"
import { AdvisorRequestStatus } from "@/src/types/AdvisorRequest/AdvisorRequest"
import { FypDashboardProject, FypDashboardStats } from "@/src/types/Fyp/Fyp"
import { getSpaceBasePath } from "@/src/utils/helpers"

const STATUS_BADGE_CLASS: Record<AdvisorRequestStatus, string> = {
  [AdvisorRequestStatus.PENDING]: "bg-slate-500/15 text-slate-500",
  [AdvisorRequestStatus.AWAITING_APPROVAL]: "bg-blue-500/15 text-blue-500",
  [AdvisorRequestStatus.ACCEPTED]: "bg-emerald-500/15 text-emerald-500",
  [AdvisorRequestStatus.REJECTED]: "bg-red-500/15 text-red-500",
  [AdvisorRequestStatus.EXPIRED]: "bg-amber-500/15 text-amber-600"
}

const STATUS_LABEL: Record<AdvisorRequestStatus, string> = {
  [AdvisorRequestStatus.PENDING]: "Pending",
  [AdvisorRequestStatus.AWAITING_APPROVAL]: "Awaiting Approval",
  [AdvisorRequestStatus.ACCEPTED]: "Accepted",
  [AdvisorRequestStatus.REJECTED]: "Rejected",
  [AdvisorRequestStatus.EXPIRED]: "Expired"
}

const STAT_CARDS: {
  key: keyof FypDashboardStats
  label: string
  icon: typeof ClipboardList
  iconClass: string
}[] = [
  {
    key: "totalProjects",
    label: "Total Projects",
    icon: ClipboardList,
    iconClass: "bg-teal-500/15 text-teal-600"
  },
  {
    key: "advisorAssigned",
    label: "Advisor Assigned",
    icon: UserCheck,
    iconClass: "bg-blue-500/15 text-blue-600"
  },
  {
    key: "pendingRequests",
    label: "Pending Requests",
    icon: Clock,
    iconClass: "bg-amber-500/15 text-amber-600"
  },
  {
    key: "withoutAdvisor",
    label: "Without Advisor",
    icon: UserX,
    iconClass: "bg-slate-500/15 text-slate-600"
  },
  {
    key: "milestonesOverdue",
    label: "Milestones Overdue",
    icon: Flag,
    iconClass: "bg-red-500/15 text-red-600"
  }
]

interface FacultyDashboardViewProps {
  // Present for a community's own dashboard (scopes every card/row to that
  // community). Omitted for the super admin dashboard, which sees every
  // community's FYP projects.
  communityId?: string
  // Where the back button goes. Omitted hides the button entirely.
  backHref?: string
}

export default function FacultyDashboardView({
  communityId,
  backHref
}: FacultyDashboardViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get("page") || "1", 10)

  const [stats, setStats] = useState<FypDashboardStats | null>(null)
  const [statsFailed, setStatsFailed] = useState(false)
  const [domainOptions, setDomainOptions] = useState<SelectTag[]>([])
  const [projects, setProjects] = useState<FypDashboardProject[]>([])
  const [pagination, setPagination] = useState<PaginationType>()

  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [domainTagId, setDomainTagId] = useState("all")
  const [status, setStatus] = useState("all")

  const [statsLoading, , , fetchStats] = useServerAction(
    GetFypDashboardStatsAction
  )
  const [projectsLoading, , , fetchProjects] = useServerAction(
    GetFypDashboardProjectsAction
  )
  const [, , , fetchTags] = useServerAction(GetAllTAgsAction)

  useEffect(() => {
    fetchStats({ communityId }).then((res) => {
      if (res?.success && res.data) {
        setStats(res.data)
        setStatsFailed(false)
      } else {
        setStatsFailed(true)
      }
    })
  }, [communityId])

  useEffect(() => {
    fetchTags("interest").then((res) => {
      if (res?.success) setDomainOptions(res.data)
    })
  }, [])

  useEffect(() => {
    fetchProjects(
      {
        communityId,
        searchTerm: searchTerm || undefined,
        domainTagId: domainTagId !== "all" ? Number(domainTagId) : undefined,
        status: status !== "all" ? (status as AdvisorRequestStatus) : undefined
      },
      page,
      10
    ).then((res) => {
      if (res?.success && res.data) {
        setProjects(res.data.projects)
        setPagination(res.data.pagination)
      }
    })
  }, [communityId, searchTerm, domainTagId, status, page])

  // Any filter change starts the list back at page 1.
  const resetToFirstPage = () => {
    const next = new URLSearchParams(searchParams.toString())
    next.set("page", "1")
    router.replace(`?${next.toString()}`, { scroll: false })
  }

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearchTerm(value)
    resetToFirstPage()
  }, 400)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor advisor requests, project progress, milestones, and
            activity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {STAT_CARDS.map(({ key, label, icon: Icon, iconClass }) => (
          <Card key={key}>
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">
                  {label}
                </p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-8" />
                ) : statsFailed || !stats ? (
                  <p className="text-xl font-bold text-muted-foreground">-</p>
                ) : (
                  <p className="text-xl font-bold">{stats[key]}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects"
              className="pl-8"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                debouncedSetSearch(e.target.value)
              }}
            />
          </div>
          <Select
            value={domainTagId}
            onValueChange={(value) => {
              setDomainTagId(value)
              resetToFirstPage()
            }}
          >
            <SelectTrigger className="sm:w-[200px]">
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domainOptions.map((tag) => (
                <SelectItem key={tag.id} value={String(tag.id)}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value)
              resetToFirstPage()
            }}
          >
            <SelectTrigger className="sm:w-[200px]">
              <SelectValue placeholder="All Request Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Request Statuses</SelectItem>
              {Object.values(AdvisorRequestStatus).map((value) => (
                <SelectItem key={value} value={value}>
                  {STATUS_LABEL[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">All FYP Projects</h2>
          </div>

          {projectsLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <NoDataCard
              title="No projects found"
              description="No FYP project matches the current filters."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>University Supervisor</TableHead>
                  <TableHead>Industry Advisor</TableHead>
                  <TableHead>Request Status</TableHead>
                  <TableHead>Milestone Progress</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => {
                  const isAccepted =
                    project.request_status === AdvisorRequestStatus.ACCEPTED
                  const basePath = getSpaceBasePath(
                    project.channel_slug,
                    project.space_slug
                  )
                  const href = isAccepted
                    ? basePath
                    : `${basePath}?page-type=fyp&fyp-tab=request-status`
                  const progress =
                    project.milestones_total > 0
                      ? (project.milestones_completed /
                          project.milestones_total) *
                        100
                      : 0

                  return (
                    <TableRow key={project.space_id}>
                      <TableCell className="font-medium">
                        {project.project_name}
                      </TableCell>
                      <TableCell>{project.domain ?? "-"}</TableCell>
                      <TableCell>
                        {project.university_supervisor ?? (
                          <span className="text-muted-foreground">
                            Not Assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {project.industry_advisor ?? (
                          <span className="text-muted-foreground">
                            Not Assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block rounded px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[project.request_status]}`}
                        >
                          {STATUS_LABEL[project.request_status]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="w-40 space-y-1">
                          <span className="text-xs text-muted-foreground">
                            {project.milestones_completed} of{" "}
                            {project.milestones_total} Completed
                          </span>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {isAccepted ? "View Space" : "View Request"}
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t p-4 sm:flex-row">
              <span className="whitespace-nowrap text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} projects
              </span>
              <div className="w-fit">
                <PaginationComponent pagination={pagination} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
