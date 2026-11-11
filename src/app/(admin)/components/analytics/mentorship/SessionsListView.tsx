"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { ArrowLeft, Eye, Search, Star } from "lucide-react"
import moment from "moment-timezone"
import { Card, CardContent } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
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
import { GetSessionsListAction } from "@/src/server-actions/Mentor/MentorActions"
import type {
  SessionListItem,
  SessionListStatusFilter
} from "@/src/types/Mentorship/Mentorship"
import { formatTime } from "@/src/components/Dashboard/profile/mentor-calendar/mentorCalendarUtils"

const STATUS_TABS: { value: SessionListStatusFilter | "all"; label: string }[] =
  [
    { value: "all", label: "All" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" }
  ]

const STATUS_BADGE_CLASS: Record<SessionListStatusFilter, string> = {
  completed: "bg-emerald-500/15 text-emerald-600",
  pending: "bg-blue-500/15 text-blue-600",
  rejected: "bg-orange-400/15 text-orange-600"
}

const STATUS_LABEL: Record<SessionListStatusFilter, string> = {
  completed: "Completed",
  pending: "Pending",
  rejected: "Rejected"
}

function RatingCell({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-muted-foreground">—</span>
  return (
    <span className="inline-flex items-center gap-0.5">
      {rating}
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
    </span>
  )
}

export default function SessionsListView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get("page") || "1", 10)
  const status = (searchParams.get("status") || "all") as
    | SessionListStatusFilter
    | "all"

  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [pagination, setPagination] = useState<PaginationType>()

  const [loading, , , fetchSessions] = useServerAction(GetSessionsListAction)

  useEffect(() => {
    fetchSessions(
      {
        status: status !== "all" ? status : undefined,
        search: searchTerm || undefined
      },
      page,
      10
    ).then((res) => {
      if (res?.success && res.data) {
        setSessions(res.data.sessions)
        setPagination(res.data.pagination)
      }
    })
  }, [status, searchTerm, page])

  const setStatus = (next: SessionListStatusFilter | "all") => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("status", next)
    params.set("page", "1")
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearchTerm(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", "1")
    router.replace(`?${params.toString()}`, { scroll: false })
  }, 400)

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-1 py-4 sm:p-4 lg:p-6 w-full min-w-0">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/analytics/mentorship"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Sessions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every mentorship session request, across all mentors and mentees.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Tabs
              value={status}
              onValueChange={(v) =>
                setStatus(v as SessionListStatusFilter | "all")
              }
            >
              <TabsList>
                {STATUS_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="relative sm:w-64 flex-shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentor, mentee or topic"
              className="pl-8"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                debouncedSetSearch(e.target.value)
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <NoDataCard
              title="No sessions found"
              description="No session matches the current filters."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session date</TableHead>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Mentee</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ratings</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium">
                        {moment(session.date).format("MMM D, YYYY")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(session.startTime)} –{" "}
                        {formatTime(session.endTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{session.mentor.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {session.mentor.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{session.mentee.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {session.mentee.email}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[16rem] truncate">
                      {session.topic}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block rounded px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[session.status]}`}
                      >
                        {STATUS_LABEL[session.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="text-muted-foreground">Mentor</span>
                          <RatingCell rating={session.ratings.mentor} />
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-muted-foreground">Mentee</span>
                          <RatingCell rating={session.ratings.mentee} />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/analytics/mentorship/sessions/${session.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View details
                      </Link>
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
                of {pagination.total} sessions
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
