import { SelectChannel, SelectSpace, SelectUser } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetChannelsAction } from "@/src/server-actions/Channel/Channel"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { channelStore } from "@/src/store/channel/channelStore"
import { navStore } from "@/src/store/nav/navStore"
import {
  canUserIntract,
  isUserAdmin,
  joinChannelsAndSpacesChannel
} from "@/src/utils/helpers"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useEffect } from "react"
import {
  getChannelsCrumbsMapped,
  getChannelsNavMapped,
  getSpacesCrumbsMapped
} from "../utils/helpers"
import { useParams } from "next/navigation"
import { userStore } from "@/src/store/user/userStore"
import { PageMeta } from "@/src/utils/constants"

const useSideBarHook = () => {
  const setRoutes = useSetAtom(navStore.routes)
  const setCrumbRoutes = useSetAtom(navStore.crumbRoutes)
  const setSelectedChannel = useSetAtom(channelStore.selectedChannel)
  const [channels, setChannels] = useAtom(channelStore.sideBarChannels)
  const user = useAtomValue(userStore.AuthUser)

  const channelSlug = useParams().channel_slug

  const [channelsLoading, channelsData, channelsError, getChannels] =
    useServerAction(GetChannelsAction)

  const userData = user

  useEffect(() => {
    const { unsubscribe } = joinChannelsAndSpacesChannel(
      "broadcast-channels-spaces-update",
      async (data, activity) => {
        let updateAllowed = false

        if (!user) return
        if (activity.includes("channel")) {
          updateAllowed = canUserIntract(user, data.created_by)
        }
        if (activity.includes("space")) {
          updateAllowed = canUserIntract(user, data.created_by)
        }
        if (!updateAllowed) return

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
        if (activity === "channel-edit") {
          const editedChannel = data as SelectChannel
          setChannels((channels) =>
            channels.map((c) => {
              if (c.id === editedChannel.id) {
                return { ...editedChannel, spaces: c.spaces }
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

    // getUser()

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (userData) {
      updateChannelsList(userData)
    }
  }, [userData])

  const updateChannelsList = async (userData: SelectUser) => {
    if(!userData || !userData.channels) return
    const navChannels = await getChannels()
    setChannels([...(navChannels?.joinedChannels || []),...(navChannels?.data?.channels || [])])
    // if (isUserAdmin(userData)) {
    //   const adminChannels = await getChannels()
    //   setChannels(adminChannels?.data?.channels || [])

    // } else {
    //   const publicChannels = await getChannels({channelType: "public", isPublished: true}) 
    //   const joinedChannels = userData?.channels.map((uc)=> uc.channel).filter((c) => typeof c !== 'undefined' )

    //   setChannels([...(joinedChannels || []), ...(publicChannels?.data?.channels || []) ])
    // }

  }

  useEffect(() => {
    if (userData) {
      let mappedCrumbs: PageMeta[] = []

      setRoutes((routes) => {
        return {
          ...routes,
          navChannels: getChannelsNavMapped(channels)
        }
      })
      setCrumbRoutes((crumbRoutes) => {
        mappedCrumbs = getChannelsCrumbsMapped(channels)
        return [
          ...crumbRoutes,
          ...(Array.isArray(mappedCrumbs) ? mappedCrumbs : [mappedCrumbs])
        ]
      })
      mappedCrumbs = []
      channels.forEach((channel) => {
        if (channel.spaces && channel.spaces.length) {
          mappedCrumbs = [
            ...mappedCrumbs,
            ...getSpacesCrumbsMapped(channel.spaces as SelectSpace[], channel)
          ]
        }
      })
      if (mappedCrumbs.length) {
        setCrumbRoutes((crumbRoutes) => [
          ...crumbRoutes,
          ...(Array.isArray(mappedCrumbs) ? mappedCrumbs : [mappedCrumbs])
        ])
      }
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
