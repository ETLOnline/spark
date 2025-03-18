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
import { useAtom } from "jotai"
import { useEffect } from "react"
import { getChannelsNavMapped } from "../utils/helpers"
import { NavItem } from "../../nav-types"

const useSideBarHook = () => {
  const [routes, setRoutes] = useAtom(navStore.routes)
  const [channels, setChannels] = useAtom(channelStore.channels)

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
    getUser()
    getChannels()

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
                c.spaces = [...(c?.spaces || []), newSpace]
              }
              return c
            })
          })
        }
      },
      ["channel-add", "space-add"]
    )

    return () => {
      unsubscribe()
    }
  }, [])

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
  }, [channels, userData])

  useEffect(() => {
    if (userData?.role) {
      ;(async () => {
        setRoutes((routes) => {
          let tempRoutes = {
            ...routes
          }

          if (!userData.role?.includes("admin")) {
            if ("navMain" in tempRoutes) {
              tempRoutes = {
                ...routes,
                navMain: (tempRoutes.navMain as NavItem[]).filter(
                  (route) => route.title !== "Channels"
                )
              }
            }
          }
          return tempRoutes
        })
      })()
    }
  }, [userData?.role])
}

export default useSideBarHook
