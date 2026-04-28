"use client"

import { usePathname, useSearchParams } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "../../ui/pagination"
import { PaginationType } from "../types/pagination.type"

interface props {
  pagination: PaginationType
  onPageChange?: (page: number) => void
}

const PaginationComponent = ({ pagination, onPageChange }: props) => {
  const pathname = usePathname()
  const query = useSearchParams()
  const urlPage = query.get("page") ? Number(query.get("page")) : 1

  const page = onPageChange ? pagination.page : urlPage

  const restQueryParams = query
    .toString()
    .split("&")
    .filter((q) => !q.includes("page"))
    .join("&")
  const isRestQuery = restQueryParams.length > 0

  const getHref = (p: number) =>
    `${pathname}?page=${p}${isRestQuery ? `&${restQueryParams}` : ""}`

  const handleClick = (e: React.MouseEvent, p: number, disabled: boolean) => {
    if (!onPageChange) return
    e.preventDefault()
    if (!disabled) onPageChange(p)
  }

  const generatePaginationItems = () => {
    const items = []
    const maxVisiblePages = 5
    const halfVisible = Math.floor(maxVisiblePages / 2)

    let startPage = Math.max(1, page - halfVisible)
    const endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    )

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink
            href={onPageChange ? "#" : getHref(1)}
            onClick={(e) => handleClick(e, 1, false)}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      )
      if (startPage > 2) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i} className="cursor-pointer">
          <PaginationLink
            href={onPageChange ? "#" : getHref(i)}
            isActive={i === page}
            onClick={(e) => handleClick(e, i, false)}
            className={"cursor-pointer"}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      items.push(
        <PaginationItem key={pagination.totalPages}>
          <PaginationLink
            href={onPageChange ? "#" : getHref(pagination.totalPages)}
            isActive={pagination.totalPages === page}
            onClick={(e) => handleClick(e, pagination.totalPages, false)}
            className={"cursor-pointer"}
          >
            {pagination.totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={onPageChange ? "#" : getHref(page - 1)}
            onClick={(e) => handleClick(e, page - 1, page <= 1)}
            className={
              page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
          />
        </PaginationItem>

        {generatePaginationItems()}

        <PaginationItem>
          <PaginationNext
            href={onPageChange ? "#" : getHref(page + 1)}
            onClick={(e) =>
              handleClick(e, page + 1, page >= pagination.totalPages)
            }
            className={
              page === pagination.totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default PaginationComponent
