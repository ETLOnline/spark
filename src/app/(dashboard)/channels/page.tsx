"use client"

import { useAtomValue } from "jotai"
import { channelStore } from "@/src/store/channel/channelStore"
import CreateChannels from "@/src/components/Dashboard/Channels/CreateChannels"
import ChannelsCard from "@/src/components/Dashboard/Channels/ChannelsCard"
import { userStore } from "@/src/store/user/userStore"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"

const ChannelsPage: React.FC = () => {
  const channels = useAtomValue(channelStore.channels)
  const userRole = useAtomValue(userStore.AuthUser)?.role

  return (
    <div className="flex-1 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold sm:text-2xl">Channels</h2>
        {userRole?.includes("admin") ? <CreateChannels /> : null}
      </div>
        {
          channels.length === 0 ? (
            <NoDataCard title="No channels available" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 ">
              {
                channels.map((channel) => {
                  return <ChannelsCard key={channel.id} channel={channel} />
                })
              }
            </div>
          )
        }
    </div>
  )
}

export default ChannelsPage
