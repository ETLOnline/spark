"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ChevronRight, Search } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/src/components/ui/input"
import { buttonVariants } from "@/src/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/src/components/ui/table"
import { cn } from "@/src/lib/utils"
import { Card, CardContent } from "@/src/components/ui/card"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import PaginationComponent from "@/src/components/common/Pagination"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetAdminCommunitiesListAction } from "@/src/server-actions/Community/Community"
import type { AdminCommunityListItem } from "@/src/db/data-access/communities/adminQuery"
import type { PaginationType } from "@/src/components/common/types/pagination.type"
import { AnalyticsPage, SnapshotUnavailable } from "./AnalyticsPage"
import { AdminNames, FypBadge, VisibilityBadge } from "./CommunityCells"
import { formatDate, getInitials } from "./format"

const PAGE_SIZE = 10

/**
 * Every community on the platform for Super Admins, with search and
 * pagination. A row opens the community's detail page, where it can be
 * edited or deleted. Search and page live in the URL so the back button
 * returns to the same spot.
 */
export default function AdminCommunitiesList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const query = searchParams.get("q") ?? ""

  const [searchInput, setSearchInput] = useState(query)
  const [communities, setCommunities] = useState<AdminCommunityListItem[]>([])
  const [pagination, setPagination] = useState<PaginationType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, , , fetchCommunities] = useServerAction(
    GetAdminCommunitiesListAction
  )

  // Keep the input in sync when the URL changes (e.g. browser back).
  useEffect(() => {
    setSearchInput(query)
  }, [query])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const res = await fetchCommunities({
        searchTerm: query || undefined,
        page,
        limit: PAGE_SIZE
      })
      if (cancelled) return
      if (res?.success && res.data) {
        setCommunities(res.data.communities)
        setPagination(res.data.pagination)
        setError(null)
      } else {
        setCommunities([])
        setPagination(null)
        setError(res?.error || "Failed to load communities.")
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page])

  const applySearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const trimmed = value.trim()
    if (trimmed) params.set("q", trimmed)
    else params.delete("q")
    params.delete("page") // new search starts from page 1
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, 400)

  const total = pagination?.total ?? 0
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)

  return (
    <AnalyticsPage
      className="flex-1"
      title="All communities"
      description="Every community on the platform. Open a community to edit or delete it."
      aside={
        <Link
          href="/admin/analytics/communities"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5"
          )}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Community analytics
        </Link>
      }
    >
      <Card className="min-w-0 flex flex-col">
        <div className="p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                applySearch(e.target.value)
              }}
              placeholder="Search by name or slug"
              aria-label="Search communities"
              className="pl-9"
            />
          </div>
          {pagination && !loading && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {total === 0
                ? "No communities"
                : `Showing ${rangeStart}–${rangeEnd} of ${total.toLocaleString()}`}
            </span>
          )}
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader size={LoaderSizes.lg} />
            </div>
          ) : error ? (
            <div className="m-4 sm:m-5 rounded-xl border border-dashed p-6 text-center text-sm text-destructive">
              {error}
            </div>
          ) : communities.length === 0 ? (
            query ? (
              <div className="m-4 sm:m-5 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No communities match &ldquo;{query}&rdquo;.
              </div>
            ) : (
              <SnapshotUnavailable className="m-4 sm:m-5" />
            )
          ) : (
            <div className="w-full overflow-x-auto">
              <Table className="w-full min-w-[56rem] text-sm">
                <TableHeader>
                  <TableRow className="text-xs text-muted-foreground border-b hover:bg-transparent">
                    <TableHead className="text-left px-3 sm:px-5 py-3 font-medium">
                      Community
                    </TableHead>
                    <TableHead className="text-left px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                      Category
                    </TableHead>
                    <TableHead className="text-left px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                      Visibility
                    </TableHead>
                    <TableHead className="text-left px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                      Community admin
                    </TableHead>
                    <TableHead className="text-left px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                      FYP enabled
                    </TableHead>
                    <TableHead className="text-right px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                      Members
                    </TableHead>
                    <TableHead className="text-left px-3 sm:px-5 py-3 font-medium whitespace-nowrap">
                      Created
                    </TableHead>
                    <TableHead className="w-10" aria-hidden />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communities.map((c) => {
                    const href = `/communities/${encodeURIComponent(c.slug)}`
                    return (
                      <TableRow
                        key={c.id}
                        onClick={() => router.push(href)}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <TableCell className="px-3 sm:px-5 py-3">
                          <Link
                            href={href}
                            onClick={(e) => e.stopPropagation()}
                            className="flex min-w-0 items-center gap-3 rounded-md hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <span className="w-8 h-8 rounded-lg bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {getInitials(c.title)}
                            </span>
                            <span className="min-w-0">
                              <span className="block font-medium break-words max-w-[14rem] sm:max-w-none">
                                {c.title}
                              </span>
                              <span className="block text-xs text-muted-foreground truncate">
                                /{c.slug}
                              </span>
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="px-3 sm:px-5 py-3 whitespace-nowrap">
                          {c.category ?? (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-3 sm:px-5 py-3">
                          <VisibilityBadge visibility={c.visibility} />
                        </TableCell>
                        <TableCell
                          className="px-3 sm:px-5 py-3 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <AdminNames names={c.admin_names} />
                        </TableCell>
                        <TableCell className="px-3 sm:px-5 py-3">
                          <FypBadge enabled={c.fyp_enabled} />
                        </TableCell>
                        <TableCell className="px-3 sm:px-5 py-3 text-right font-semibold tabular-nums">
                          {c.total_members.toLocaleString()}
                        </TableCell>
                        <TableCell className="px-3 sm:px-5 py-3 whitespace-nowrap text-muted-foreground">
                          {formatDate(c.created_at)}
                        </TableCell>
                        <TableCell className="px-3 sm:px-5 py-3 text-muted-foreground">
                          <ChevronRight className="w-4 h-4" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && !error && pagination && pagination.totalPages > 1 && (
            <div className="px-3 sm:px-5 py-3 border-t">
              <PaginationComponent pagination={pagination} />
            </div>
          )}
        </CardContent>
      </Card>
    </AnalyticsPage>
  )
}
