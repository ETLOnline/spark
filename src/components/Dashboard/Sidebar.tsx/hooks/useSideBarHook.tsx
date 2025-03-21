import { SelectChannel, SelectSpace } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetChannelPathsAction,
  GetChannelsAction
} from "@/src/server-actions/Channel/Channel"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { channelStore } from "@/src/store/channel/channelStore"
import { navStore } from "@/src/store/nav/navStore"
import { joinChannelsAndSpacesChannel } from "@/src/utils/helpers"
import { useAtom, useSetAtom } from "jotai"
import { useEffect } from "react"
import { getChannelsNavMapped } from "../utils/helpers"
import { useParams } from "next/navigation"

const useSideBarHook = () => {
  const setRoutes = useSetAtom(navStore.routes)
  const setSelectedChannel = useSetAtom(channelStore.selectedChannel)
  const [channels, setChannels] = useAtom(channelStore.channels)

  const channelSlug = useParams().channel_slug

  const [channelsLoading, channelsData, channelsError, getChannels] =
    useServerAction(GetChannelsAction)
  const [userLoading, userData, userError, getUser] =
    useServerAction(AuthUserAction)
  const [
    channelPathsLoading,
    channelPathsData,
    channelPathsError,
    getChannelPaths
  ] = useServerAction(GetChannelPathsAction)

  useEffect(() => {
    const { unsubscribe } = joinChannelsAndSpacesChannel(
      "broadcast-channels-spaces-update",
      async (data, activity) => {
        if (activity === "channel-add") {
          const newChannel = data as SelectChannel
          setChannels((preChannels) => [newChannel, ...preChannels])
        }
        if (activity === "space-add") {
          const newSpace = data as SelectSpace
          setChannels((preChannels) => {
            return preChannels.map((c) => {
              if (c.id === newSpace.channel_id) {
                console.log("newSpace", newSpace)
                c.spaces = [...(c?.spaces || []), newSpace]
              }
              return c
            })
          })
        }
        if (activity === "channel-edit") {
          const editedChannel = data as SelectChannel
          setChannels((channels) =>
            channels.map((c) => {
              if (c.id === editedChannel.id) {
                return {...editedChannel, spaces: c.spaces}
              }
              return c
            })
          )
        }
        if (activity === "space-edit") {
          const editedSpace = data as SelectSpace
          setChannels((channels) =>
            channels.map((c) => {
              if (c.id === editedSpace.channel_id) {
                c.spaces = c.spaces?.map((s) => {
                  if (s.id === editedSpace.id) {
                    return editedSpace
                  }
                  return s
                })
              }
              return c
            })
          )
        }
        if (activity === "channel-del") {
          const deletedChannel = data as SelectChannel
          setChannels((channels) =>
            channels.filter((c) => c.id !== deletedChannel.id)
          )
        }
        if (activity === "space-del") {
          const deletedSpace = data as SelectSpace
          setChannels((channels) =>
            channels.map((c) => {
              if (c.id === deletedSpace.channel_id) {
                c.spaces = c.spaces?.filter((s) => s.id !== deletedSpace.id)
              }
              return c
            })
          )
        }
      },
      [
        "channel-add",
        "space-add",
        "channel-edit",
        "space-edit",
        "channel-del",
        "space-del"
      ]
    )

    getUser()

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (userData) {
      if (userData.role?.includes("admin")) {
        getChannels()
      } else {
        getChannels("public", userData.unique_id)
      }
    }
  }, [userData])

  useEffect(() => {
    if (channelsData?.data && channelsData.success) {
      const allChannels = channelsData.data
      setChannels(allChannels)
    }
  }, [channelsData])

  useEffect(() => {
    if (userData) {
      setRoutes((routes) => {
        return {
          ...routes,
          navChannels: getChannelsNavMapped(channels)
        }
      })
    }

    if (channelSlug) {
      const selectedChannel = channels.find(
        (channel) => channel.channel_slug === channelSlug
      )
      if (selectedChannel) {
        setSelectedChannel({ ...selectedChannel })
      }
    }
  }, [channels, userData])
}

export default useSideBarHook
