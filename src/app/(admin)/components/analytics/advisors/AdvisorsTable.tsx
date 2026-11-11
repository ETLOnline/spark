"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Linkedin } from "lucide-react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/src/components/ui/table"
import { DomainChips } from "./DomainChips"
import { TableFooter } from "./TableFooter"
import { TableStatusRow } from "./TableStatusRow"
import { useServerAction } from "@/src/hooks/useServerAction"
import { UrlSearchInput } from "./UrlSearchInput"
import {
  ADVISOR_FILTER_DESCRIPTIONS,
  ADVISOR_FILTER_TITLES,
  ADVISOR_PAGE_SIZE,
  ADVISOR_TABLE_COLUMNS,
  DRILLDOWN_LINK_CLASS,
  emptyPage,
  toExternalUrl
} from "./constants"
import { GetAdminAdvisorsListAction } from "@/src/server-actions/Advisors/AdminAdvisors"
import {
  AdminAdvisorRow,
  AdvisorFilter
} from "@/src/types/Advisors/AdminAdvisors"

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

      <Table className="min-w-[56rem]">
        <TableHeader>
          <TableRow className="text-xs bg-muted/40 hover:bg-muted/40">
            {ADVISOR_TABLE_COLUMNS.map((c) => (
              <TableHead
                key={c.label}
                className={`h-auto px-4 py-3 whitespace-nowrap ${c.numeric ? "text-right" : "text-left"}`}
              >
                {c.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableStatusRow
            colSpan={ADVISOR_TABLE_COLUMNS.length}
            loading={loading}
            error={error}
            isEmpty={rows.length === 0}
            emptyText="No advisors found"
          />
          {!loading &&
            rows.map((a) => (
              <TableRow key={a.id} className="hover:bg-muted/30">
                <TableCell className="px-4 py-3 whitespace-nowrap font-medium">
                  {a.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground">
                  {a.email}
                </TableCell>
                <TableCell className="px-4 py-3 text-xs whitespace-nowrap">
                  {a.linkedinUrl ? (
                    <Link
                      href={toExternalUrl(a.linkedinUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={a.linkedinUrl}
                      className={`inline-flex items-center gap-1 ${DRILLDOWN_LINK_CLASS}`}
                    >
                      <Linkedin aria-hidden="true" className="w-3.5 h-3.5" />
                      View Profile
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Not added</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <DomainChips domains={a.domains} />
                </TableCell>
                <TableCell className="px-4 py-3 text-right tabular-nums">
                  {a.activeProjects}
                </TableCell>
                <TableCell className="px-4 py-3 text-right tabular-nums">
                  {a.completedProjects}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      {!loading && !error && <TableFooter pagination={pagination} />}
    </Card>
  )
}
