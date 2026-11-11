"use client"

import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { TableCell, TableRow } from "@/src/components/ui/table"

interface TableStatusRowProps {
  colSpan: number
  loading: boolean
  error: string | null
  isEmpty: boolean
  emptyText: string
}

/**
 * Full-width row for a drill-down table's loading, error and empty states.
 * Renders nothing when there are rows to show.
 */
export function TableStatusRow({
  colSpan,
  loading,
  error,
  isEmpty,
  emptyText
}: TableStatusRowProps) {
  if (!loading && !error && !isEmpty) return null

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="px-4 py-10 text-center">
        {loading ? (
          <div className="flex justify-center">
            <Loader size={LoaderSizes.lg} />
          </div>
        ) : error ? (
          <span className="text-destructive">{error}</span>
        ) : (
          <span className="text-muted-foreground">{emptyText}</span>
        )}
      </TableCell>
    </TableRow>
  )
}
