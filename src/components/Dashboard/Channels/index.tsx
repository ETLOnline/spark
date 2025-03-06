"use client"

import { useEffect } from "react"
import ChannelsCard from "./ChannelsCard"
import CreateChannels from "./CreateChannels"
import { useAtom } from "jotai"
import { channelStore } from "@/src/store/chennel/channelStore"
import { SelectChannel } from "@/src/db/schema"

type ChannelScreenProps = { fetchedChannels: SelectChannel[] }

function ChannelsScreen({ fetchedChannels }: ChannelScreenProps) {
  const [channels, setChannels] = useAtom(channelStore.channels)

  useEffect(() => {
    setChannels(fetchedChannels)
  }, [fetchedChannels])

  return (
    <div className="flex-1 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold sm:text-2xl">Channels</h2>
        <CreateChannels />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 ">
        {channels.map((channel) => {
          return <ChannelsCard key={channel.id} channel={channel} />
        })}
      </div>
    </div>
  )
}

export default ChannelsScreen
