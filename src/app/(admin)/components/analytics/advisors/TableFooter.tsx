"use client"

import PaginationComponent from "@/src/components/common/Pagination"
import { PaginationType } from "@/src/components/common/types/pagination.type"

/** "Showing x–y of n" + URL-driven pagination, under a drill-down table. */
export function TableFooter({ pagination }: { pagination: PaginationType }) {
  const from =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const to = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t">
      <span className="text-xs text-muted-foreground">
        Showing {from}–{to} of {pagination.total.toLocaleString()}
      </span>
      {pagination.totalPages > 1 && (
        <div>
          <PaginationComponent pagination={pagination} />
        </div>
      )}
    </div>
  )
}
