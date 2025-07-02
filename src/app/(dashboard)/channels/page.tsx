"use client"
import React, { useEffect, useState } from "react"
import CreateChannels from "@/src/components/Dashboard/Channels/CreateChannels"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import ChannelCardList from "@/src/components/Dashboard/Channels/ChannelCardList"
import { isUserAdmin } from "@/src/utils/helpers"
import { GetChannelsAction } from "@/src/server-actions/Channel/Channel"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { useSearchParams } from "next/navigation"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { channelStore } from "@/src/store/channel/channelStore"
import { useAtom } from "jotai"

const ChannelsPage = () => {
  const { canAccess } = usePermissionChecker("global")

  const canCreate = canAccess("channel.create")

  const [channels, setChannels] = useState<any>(null)
  const [joinedChannels, setJoinedChannels] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger] = useAtom(channelStore.refreshChannelsTriggerAtom)

  const searchParams = useSearchParams()
  const page = Number(searchParams.get("page")) || 1

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const authUser = await AuthUserAction()

      setIsAdmin(isUserAdmin(authUser))

      const channelsRes = await GetChannelsAction({
        page,
        limit: 6
      })

      setChannels(channelsRes.data)
      setJoinedChannels(channelsRes.joinedChannels)
      setLoading(false)
    }

    fetchData()
  }, [page, refreshTrigger])

  if (loading) {
    return (
      <div className="flex justify-center h-full w-full">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  }

  return (
    <>
      {joinedChannels && joinedChannels.length > 0 ? (
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold sm:text-2xl">Joined Channels</h2>
          </div>

          <ChannelCardList fetchedChannels={joinedChannels} />
        </div>
      ) : null}
      <div className="flex-1 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold sm:text-2xl">Channels</h2>
          {isAdmin || canCreate ? (
            <CreateChannels
              onChannelCreated={(newChannel) =>
                setJoinedChannels((prev: any[]) => [
                  ...(prev || []),
                  newChannel
                ])
              }
            />
          ) : null}
        </div>
        {!channels?.channels || channels.channels.length === 0 ? (
          <NoDataCard title="No channels available" />
        ) : (
          <ChannelCardList
            fetchedChannels={channels.channels}
            pagination={channels.pagination}
            withGlobalStore={true}
          />
        )}
      </div>
    </>
  )
}

export default ChannelsPage
