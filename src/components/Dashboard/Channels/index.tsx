"use client"

import { useEffect } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetChannelsAction } from "@/src/server-actions/channels/channel"
import ChannelsCard from "./ChannelsCard"
import CreateChannels from "./CreateChannels"
import { useAtom } from "jotai"
import { channelStore } from "@/src/store/chennel/channelStore"

function ChannelsScreen() {
  const [channels, setChannels] = useAtom(channelStore.channels)
  const [getchannelLoading, getchannelData, getchannelError, GetChannel] =
    useServerAction(GetChannelsAction)

  useEffect(() => {
    ;(async () => {
      const channelsData = await GetChannel()
      if (channelsData) {
        setChannels(channelsData.data ? channelsData.data : [])
      }
    })()
  }, [])

  return (
    <div className="flex-1 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold sm:text-2xl">Channels</h2>
        <CreateChannels />
      </div>


      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 ">
        {channel.map((channel, i) => {
          return (
            <div>
              <ChannelsCard channel={channel} key={channel.id} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChannelsScreen
