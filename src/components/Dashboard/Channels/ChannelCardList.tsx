"use client"

import { SelectChannel } from "@/src/db/schema"
import { useEffect, useState } from "react"
import { useAtom } from "jotai"
import { channelStore } from "@/src/store/channel/channelStore"
import { useRouter, useSearchParams } from "next/navigation"
import { PaginationType } from "../../common/types/pagination.type"
import PaginationComponent from "../../common/Pagination"
import ChannelCard from "./ChannelCard"

type ChannelCardListProps = {
  fetchedChannels: SelectChannel[]
  pagination?: PaginationType
  withGlobalStore?: boolean
}

const ChannelCardList: React.FC<ChannelCardListProps> = ({
  fetchedChannels,
  pagination,
  withGlobalStore = false
}) => {
  const [channels, setChannels] = useAtom(channelStore.channels)

  useEffect(() => {
    setChannels(fetchedChannels)
  }, [fetchedChannels])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 2xl:grid-cols-3 gap-4">
        {(withGlobalStore ? channels : fetchedChannels)?.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <PaginationComponent pagination={pagination} />
      )}
    </div>
  )
}

export default ChannelCardList
