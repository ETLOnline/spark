"use client"

import { useAtomValue } from "jotai"
import { channelStore } from "@/src/store/channel/channelStore"
import CreateChannels from "@/src/components/Dashboard/Channels/CreateChannels"
import ChannelsCard from "@/src/components/Dashboard/Channels/ChannelsCard"
import { useEffect } from "react"
import { userStore } from "@/src/store/user/userStore"
import { redirect } from "next/navigation"

const ChannelsPage = () => {
  const channels = useAtomValue(channelStore.channels)
  const userRole = useAtomValue(userStore.AuthUser)?.role

  useEffect(() => {
    redirect("/")
  }, [userRole])

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

export default ChannelsPage
