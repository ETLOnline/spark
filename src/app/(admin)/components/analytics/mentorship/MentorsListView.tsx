"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { ArrowLeft, Linkedin, Search } from "lucide-react"
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
import { GetMentorsListAction } from "@/src/server-actions/Mentor/MentorActions"
import type {
  MentorListItem,
  MentorListStatusFilter
} from "@/src/types/Mentorship/Mentorship"
import { AVATAR_CLASSES } from "../../../admin/analytics/_data/constants"
import { getInitials } from "../format"

const STATUS_TABS: { value: MentorListStatusFilter; label: string }[] = [
  { value: "total", label: "All" },
  { value: "active", label: "Active" },
  { value: "verified", label: "Verified" }
]

export default function MentorsListView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get("page") || "1", 10)
  const status = (searchParams.get("status") ||
    "total") as MentorListStatusFilter

  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [mentors, setMentors] = useState<MentorListItem[]>([])
  const [pagination, setPagination] = useState<PaginationType>()

  const [loading, , , fetchMentors] = useServerAction(GetMentorsListAction)

  useEffect(() => {
    fetchMentors({ status, search: searchTerm || undefined }, page, 10).then(
      (res) => {
        if (res?.success && res.data) {
          setMentors(res.data.mentors)
          setPagination(res.data.pagination)
        }
      }
    )
  }, [status, searchTerm, page])

  const setStatus = (next: MentorListStatusFilter) => {
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
          <h1 className="text-xl sm:text-2xl font-semibold">Mentors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Everyone registered with the Mentor role.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Tabs
              value={status}
              onValueChange={(v) => setStatus(v as MentorListStatusFilter)}
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
              placeholder="Search name or email"
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
          ) : mentors.length === 0 ? (
            <NoDataCard
              title="No mentors found"
              description="No mentor matches the current filters."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mentor</TableHead>
                  <TableHead>LinkedIn</TableHead>
                  <TableHead className="text-right">
                    Sessions completed
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentors.map((mentor, idx) => (
                  <TableRow key={mentor.id}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`w-8 h-8 rounded-full flex-shrink-0 text-[11px] font-bold flex items-center justify-center ${AVATAR_CLASSES[idx % AVATAR_CLASSES.length]}`}
                        >
                          {getInitials(mentor.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium whitespace-nowrap">
                            {mentor.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {mentor.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {mentor.linkedinUrl ? (
                        <Link
                          href={mentor.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <Linkedin className="h-3.5 w-3.5" />
                          View profile
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {mentor.sessionsCompleted.toLocaleString()}
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
                of {pagination.total} mentors
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
