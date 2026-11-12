"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { ArrowLeft, Eye, Search } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
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
import { GetFypDirectoryAction } from "@/src/server-actions/Fyp/Fyp"
import type { FypDirectoryProject } from "@/src/types/Fyp/Fyp"

export default function CompletedFypsListView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get("page") || "1", 10)

  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [projects, setProjects] = useState<FypDirectoryProject[]>([])
  const [pagination, setPagination] = useState<PaginationType>()

  const [loading, , , fetchDirectory] = useServerAction(GetFypDirectoryAction)

  useEffect(() => {
    fetchDirectory(
      { bucket: "completed", searchTerm: searchTerm || undefined },
      page,
      10
    ).then((res) => {
      if (res?.success && res.data) {
        setProjects(res.data.projects)
        setPagination(res.data.pagination)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, page])

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
          href="/admin/analytics/fyp"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Completed FYPs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every Final Year Project that has finished all its milestones.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="relative sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Title, university, advisor or domain"
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
          ) : projects.length === 0 ? (
            <NoDataCard
              title="No completed FYPs"
              description="No project has completed all its milestones yet."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>FYP title</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Advisor</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.spaceId}>
                    <TableCell className="font-medium">
                      {p.projectName}
                    </TableCell>
                    <TableCell>{p.universityTitle}</TableCell>
                    <TableCell>
                      {p.industryAdvisor ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.domain ? (
                        <Badge variant="outline">{p.domain}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.teamSize}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/analytics/fyp/completed/${p.spaceId}`}
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
                of {pagination.total} completed FYPs
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
