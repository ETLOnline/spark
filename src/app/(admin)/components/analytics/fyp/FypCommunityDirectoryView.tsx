"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { ArrowLeft, Download, Search } from "lucide-react"
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
  GetFypCommunityTitleAction,
  GetFypDirectoryAction
} from "@/src/server-actions/Fyp/Fyp"
import { GetAllTAgsAction } from "@/src/server-actions/Tag/Tag"
import type { FypDirectoryProject } from "@/src/types/Fyp/Fyp"
import type { SelectTag } from "@/src/db/schema"
import { downloadCsv } from "../csv"

const ALL = "all"

interface FypCommunityDirectoryViewProps {
  communityId: string
}

export default function FypCommunityDirectoryView({
  communityId
}: FypCommunityDirectoryViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get("page") || "1", 10)
  const domain = searchParams.get("domain") || ALL

  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [communityTitle, setCommunityTitle] = useState<string | null>(null)
  const [domainOptions, setDomainOptions] = useState<SelectTag[]>([])
  const [projects, setProjects] = useState<FypDirectoryProject[]>([])
  const [pagination, setPagination] = useState<PaginationType>()

  const [directoryLoading, , , fetchDirectory] = useServerAction(
    GetFypDirectoryAction
  )
  const [, , , fetchCommunityTitle] = useServerAction(
    GetFypCommunityTitleAction
  )
  const [, , , fetchTags] = useServerAction(GetAllTAgsAction)

  useEffect(() => {
    fetchCommunityTitle(communityId).then((res) => {
      if (res?.success) setCommunityTitle(res.data ?? null)
    })
    fetchTags("interest").then((res) => {
      if (res?.success) setDomainOptions(res.data)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId])

  useEffect(() => {
    fetchDirectory(
      {
        communityId,
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
  }, [communityId, domain, searchTerm, page])

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
    params.delete("domain")
    params.set("page", "1")
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const exportCsv = () => {
    downloadCsv(
      `fyp-directory-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Project", "Domain", "Tech stack", "Advisor", "Team"],
      projects.map((p) => [
        p.projectName,
        p.domain ?? "",
        p.techStack.join("; "),
        p.industryAdvisor ?? "",
        p.teamSize
      ])
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-1 py-4 sm:p-4 lg:p-6 w-full min-w-0">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/analytics/fyp"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold [overflow-wrap:anywhere]">
            {communityTitle ?? "FYPs"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Each project's domain, tech stack, advisor and team.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={domain}
            onValueChange={(value) => updateParams({ domain: value })}
          >
            <SelectTrigger className="sm:w-[200px]">
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
        </CardContent>
      </Card>

      <Card>
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
                    <TableCell className="font-medium">
                      {p.projectName}
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
    </div>
  )
}
