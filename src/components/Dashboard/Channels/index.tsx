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
    <>
      <div className="flex w-full justify-center">
        <CreateChannels />
      </div>
      <div className="w-full">
        <div className="flex flex-wrap justify-around w-full gap-3">
          {channels.map((channel) => {
            return (
              <div>
                <ChannelsCard channel={channel} key={channel.id} />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default ChannelsScreen
