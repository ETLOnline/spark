"use client"

import { SelectChannel } from "@/src/db/schema"
import ChannelsCard from "./ChannelsCard"
import { useEffect, useState } from "react"
import { useAtom } from "jotai"
import { channelStore } from "@/src/store/channel/channelStore"
import {  usePathname, useRouter, useSearchParams } from "next/navigation"
import { PaginationType } from "../../common/types/pagination.type"
import PaginationComponent from "../../common/Pagination"

type ChannelsCardsProps = {
  fetchedChannels: SelectChannel[]
  pagination: PaginationType
}

const ChannelsCards: React.FC<ChannelsCardsProps> = ({
  fetchedChannels,
  pagination
}) => {
  const router = useRouter()
  const [channels, setChannels] = useAtom(channelStore.channels)
  const params = useSearchParams()
  const page = params.get('page')
  const [currentPage, setCurrentPage] = useState(page ? Number(page) : 1)

  useEffect(() => {
    setChannels(fetchedChannels)
  }, [fetchedChannels])

  const handlePageChange = async (page: number) => {
    if (page === currentPage) return
    router.push(
      `/channels?page=${page}`
    )
    setCurrentPage(page)
    // const result = await getChannels({ page, limit: pagination.limit })
    // if (result && result.success && result.data) {
    //   setChannels(result.data.channels)
    // }

  }

 
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 2xl:grid-cols-3 gap-4">
        {channels?.map((channel) => (
          <ChannelsCard key={channel.id} channel={channel} />
        ))}
      </div>
      {pagination.totalPages > 1 && (
        <PaginationComponent pagination={pagination} />
      )}
    </div>
  )
}

export default ChannelsCards
