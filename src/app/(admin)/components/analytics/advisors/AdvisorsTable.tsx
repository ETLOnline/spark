"use client"

import { useEffect } from "react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { DomainChips } from "./DomainChips"
import { TableFooter } from "./TableFooter"
import { TableStatusRow } from "./TableStatusRow"
import { useServerAction } from "@/src/hooks/useServerAction"
import { UrlSearchInput } from "./UrlSearchInput"
import {
  ADVISOR_FILTER_DESCRIPTIONS,
  ADVISOR_FILTER_TITLES,
  ADVISOR_PAGE_SIZE,
  displayUrl,
  DRILLDOWN_LINK_CLASS,
  emptyPage,
  toExternalUrl
} from "./constants"
import { GetAdminAdvisorsListAction } from "@/src/server-actions/Advisors/AdminAdvisors"
import {
  AdminAdvisorRow,
  AdvisorFilter
} from "@/src/types/Advisors/AdminAdvisors"

const COLUMNS = [
  { label: "Name" },
  { label: "Email" },
  { label: "LinkedIn URL" },
  { label: "Domain" },
  { label: "Active projects", numeric: true },
  { label: "Completed projects", numeric: true }
]

interface AdvisorsTableProps {
  /** Selected by the Total / Active / Verified KPI card above. */
  filter: AdvisorFilter
  search: string
  page: number
}

/** Paginated, searchable advisors table shown under the advisor KPI cards. */
export function AdvisorsTable({ filter, search, page }: AdvisorsTableProps) {
  const [isFetching, result, fetchError, getAdvisors] = useServerAction(
    GetAdminAdvisorsListAction
  )

  useEffect(() => {
    getAdvisors({ filter, search, page, limit: ADVISOR_PAGE_SIZE })
  }, [filter, search, page])

  // `result` is null until the first response arrives.
  const loading = isFetching || (!result && !fetchError)
  const error =
    fetchError?.message ?? (result && !result.success ? result.error : null)
  const { rows, pagination } = result?.success
    ? result.data
    : emptyPage<AdminAdvisorRow>(page)

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0">
        <div className="min-w-0">
          <CardTitle className="text-sm">
            {`${ADVISOR_FILTER_TITLES[filter]} (${pagination.total.toLocaleString()})`}
          </CardTitle>
          <CardDescription>
            {ADVISOR_FILTER_DESCRIPTIONS[filter]}
          </CardDescription>
        </div>
        <UrlSearchInput
          label="Search advisors"
          placeholder="Search name or email"
        />
      </CardHeader>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[56rem] text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b bg-muted/40">
              {COLUMNS.map((c) => (
                <th
                  key={c.label}
                  className={`px-4 py-3 font-medium whitespace-nowrap ${c.numeric ? "text-right" : "text-left"}`}
                >
                  {c.label}
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
              emptyText="No advisors found"
            />
            {!loading &&
              rows.map((a) => (
                <tr
                  key={a.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap font-medium">
                    {a.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.email}</td>
                  <td className="px-4 py-3 text-xs max-w-[14rem]">
                    {a.linkedinUrl ? (
                      <a
                        href={toExternalUrl(a.linkedinUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={a.linkedinUrl}
                        className={`block truncate ${DRILLDOWN_LINK_CLASS}`}
                      >
                        {displayUrl(a.linkedinUrl)}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Not added</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <DomainChips domains={a.domains} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {a.activeProjects}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {a.completedProjects}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {!loading && !error && <TableFooter pagination={pagination} />}
    </Card>
  )
}
