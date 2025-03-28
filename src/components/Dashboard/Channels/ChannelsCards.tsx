"use client"

import { SelectChannel } from "@/src/db/schema"
import ChannelsCard from "./ChannelsCard"
import { useEffect, useState } from "react"
import { useAtom } from "jotai"
import { channelStore } from "@/src/store/channel/channelStore"
import { GetChannelsAction } from "@/src/server-actions/Channel/Channel"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/src/components/ui/pagination"
import { useServerAction } from "@/src/hooks/useServerAction"

type PaginationType = {
  total: number
  page: number
  limit: number
  totalPages: number
}

type ChannelsCardsProps = {
  fetchedChannels: SelectChannel[]
  pagination: PaginationType
}

const ChannelsCards: React.FC<ChannelsCardsProps> = ({
  fetchedChannels,
  pagination
}) => {
  const [channels, setChannels] = useAtom(channelStore.channels)
  const [currentPage, setCurrentPage] = useState(pagination.page)

  const [channelsLoading, channelsData, channelsError, getChannels] =
    useServerAction(GetChannelsAction)

  useEffect(() => {
    setChannels(fetchedChannels)
  }, [fetchedChannels])

  const handlePageChange = async (page: number) => {
    if (page === currentPage) return
    const result = await getChannels({ page, limit: pagination.limit })
    if (result && result.success && result.data) {
      setChannels(result.data.channels)
      setCurrentPage(page)
    }
  }

  const generatePaginationItems = () => {
    const items = []
    const maxVisiblePages = 5
    const halfVisible = Math.floor(maxVisiblePages / 2)
    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    )

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
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
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
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
            onClick={() => handlePageChange(pagination.totalPages)}
          >
            {pagination.totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 2xl:grid-cols-3 gap-4">
        {channels?.map((channel) => (
          <ChannelsCard key={channel.id} channel={channel} />
        ))}
      </div>
      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {generatePaginationItems()}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                className={
                  currentPage === pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export default ChannelsCards
