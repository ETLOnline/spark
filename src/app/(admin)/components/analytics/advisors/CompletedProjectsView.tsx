"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { Card } from "@/src/components/ui/card"
import { DrillDownHeader } from "./DrillDownHeader"
import { UrlSearchInput } from "./UrlSearchInput"
import { TableFooter } from "./TableFooter"
import { TableStatusRow } from "./TableStatusRow"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  ADVISOR_PAGE_SIZE,
  ADVISOR_ROUTES,
  DRILLDOWN_LINK_CLASS,
  DRILLDOWN_PAGE_CLASS,
  emptyPage
} from "./constants"
import { AdminCompletedProjectRow } from "@/src/types/Advisors/AdminAdvisors"
import { GetAdminCompletedProjectsAction } from "@/src/server-actions/Advisors/AdminAdvisors"

const formatDate = (iso: string) => {
  const date = new Date(iso)
  return iso && !Number.isNaN(date.getTime())
    ? format(date, "MMM d, yyyy")
    : "—"
}

const COLUMNS = [
  "Project title",
  "Advisor",
  "Students",
  "Community / Channel / Space",
  "Completion date ↓"
]

export default function CompletedProjectsView() {
  const searchParams = useSearchParams()
  const search = searchParams.get("search") ?? ""
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const [isFetching, result, fetchError, getProjects] = useServerAction(
    GetAdminCompletedProjectsAction
  )

  useEffect(() => {
    getProjects({ search, page, limit: ADVISOR_PAGE_SIZE })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page])

  // `result` is null until the first response arrives.
  const loading = isFetching || (!result && !fetchError)
  const error =
    fetchError?.message ?? (result && !result.success ? result.error : null)
  const { rows, pagination } = result?.success
    ? result.data
    : emptyPage<AdminCompletedProjectRow>(page)

  return (
    <div className={DRILLDOWN_PAGE_CLASS}>
      <DrillDownHeader
        title={
          loading
            ? "Projects Completed"
            : `Projects Completed (${pagination.total.toLocaleString()})`
        }
        description="Projects whose last milestone is done and verified, with or without closure feedback."
      />

      <UrlSearchInput
        label="Search projects"
        placeholder="Search project title or advisor"
      />

      <Card className="min-w-0 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[60rem] text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b bg-muted/40">
                {COLUMNS.map((c) => (
                  <th
                    key={c}
                    className="px-4 py-3 font-medium text-left whitespace-nowrap"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TableStatusRow
                colSpan={COLUMNS.length}
                loading={loading}
                error={error}
                isEmpty={rows.length === 0}
                emptyText="No completed projects found"
              />
              {!loading &&
                rows.map((p) => (
                  <tr
                    key={p.spaceId}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={ADVISOR_ROUTES.project(p.spaceId)}
                        className={DRILLDOWN_LINK_CLASS}
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.advisorName ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.students.join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {[p.communityName, p.channelName, p.spaceName]
                        .filter(Boolean)
                        .join(" / ")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                      {formatDate(p.completedAt)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!loading && !error && <TableFooter pagination={pagination} />}
      </Card>
    </div>
  )
}
