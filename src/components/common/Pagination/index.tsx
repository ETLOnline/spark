import { usePathname, useSearchParams } from "next/navigation"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../ui/pagination"
import { PaginationType } from "../types/pagination.type"

interface props {
  pagination: PaginationType
}

const PaginationComponent = ({ pagination }: props) => {
  const pathname = usePathname()
  const query = useSearchParams()
  const page = query.get('page') ? Number(query.get('page')) : 1

  const restQueryParams = query.toString().split('&').filter(q => !q.includes('page')).join('&')
  const isRestQuery = restQueryParams.length > 0

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
          <PaginationLink href={`${pathname}?page=1${isRestQuery ? `&${restQueryParams}` : ''}`}>1</PaginationLink>
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
            href={`${pathname}?page=${i}${isRestQuery ? `&${restQueryParams}` : ''}`}
            isActive={i === page}
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
            href={`${pathname}?page=${pagination.totalPages}${isRestQuery ? `&${restQueryParams}` : ''}`}
            isActive={pagination.totalPages === page}
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
            href={`${pathname}?page=${page - 1}${isRestQuery ? `&${restQueryParams}` : ''}`}
            className={
              page === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>

        {generatePaginationItems()}
        <PaginationItem>
          <PaginationNext
            href={`${pathname}?page=${page + 1}${isRestQuery ? `&${restQueryParams}` : ''}`}
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