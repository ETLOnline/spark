"use client"

import { SelectChannel } from "@/src/db/schema"
import ChannelsCard from "./ChannelsCard"
import { useEffect } from "react"
import { useAtom } from "jotai"
import { channelStore } from "@/src/store/channel/channelStore"

type ChannelsCardsProps = { fetchedChannels: SelectChannel[] }

const ChannelsCards: React.FC<ChannelsCardsProps> = ({ fetchedChannels }) => {
  const [channels, setChannels] = useAtom(channelStore.channels)

  useEffect(() => {
    setChannels(fetchedChannels)
  }, [])

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 ">
      {channels?.map((channel) => {
        return <ChannelsCard key={channel.id} channel={channel} />
      })}
    </div>
  )
}

export default ChannelsCards
