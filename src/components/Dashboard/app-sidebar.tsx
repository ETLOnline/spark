"use client"

import NavMain from "@/src/components/Dashboard/nav-main"
import NavSecondary from "@/src/components/Dashboard/nav-secondary"
import NavUser from "@/src/components/Dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/src/components/ui/sidebar"
import { SignedIn } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { useAtom } from "jotai"
import { navStore } from "@/src/store/nav/navStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetChannelByIdAction,
  GetChannelPathsAction,
  GetChannelsAction
} from "@/src/server-actions/Channel/Channel"
import { useEffect } from "react"
import { Hash } from "lucide-react"
import { channelStore } from "@/src/store/channel/channelStore"
import { joinChannelsAndSpacesChannel } from "@/src/utils/helpers"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [routes, setRoutes] = useAtom(navStore.routes)
  const [channels, setChannels] = useAtom(channelStore.channels)

  const [
    channelPathsLoading,
    channelPathsData,
    channelPathsError,
    getChannelPaths
  ] = useServerAction(GetChannelPathsAction)
  const [channelsLoading, channelsData, channelsError, getChannels] =
    useServerAction(GetChannelsAction)
  const [channelLoading, channelData, channelError, getChannelById] =
    useServerAction(GetChannelByIdAction)
  const [userLoading, userData, userError, getUser] =
    useServerAction(AuthUserAction)

  useEffect(() => {
    ;(async () => {
      const channelPaths = (await getChannelPaths())?.data
      const channels = (await getChannels())?.data
      if (channelPaths) {
        setRoutes((routes) => {
          return {
            ...routes,
            navChannels: channelPaths.map((channelPath) => ({
              title: channelPath.channel_name,
              url: `/channels/${channelPath.channel_slug}/spaces`,
              icon: Hash,
              items: channelPath.spaces.length
                ? channelPath.spaces.map((spacePath) => ({
                    title: spacePath.space_name,
                    url: `/channels/${channelPath.channel_slug}/spaces/${spacePath.space_slug}`
                  }))
                : []
            }))
          }
        })
      }
      if (channels) {
        setChannels([...channels])
      }
    })()

    const { unsubscribe } = joinChannelsAndSpacesChannel(
      "boradcast-channels-spaces-update",
      async (data, activity) => {
        const userId = (await getUser())?.unique_id
        if (activity === "channel" && "channel_name" in data) {
          if (data.created_by !== userId) {
            setRoutes((routes) => ({
              ...routes,
              navChannels: [
                ...routes.navChannels,
                {
                  title: data.channel_name,
                  url: `/channels/${data.channel_slug}/spaces`,
                  icon: Hash,
                  items: []
                }
              ]
            }))

            setChannels((channels) => [...channels, data])
          }
        }

        if (activity === "space" && "space_name" in data) {
          if (data.created_by !== userId) {
            const channelSlug = (await getChannelById(data.channel_id))?.data
              ?.channel_slug
            setRoutes((routes) => ({
              ...routes,
              navChannels: routes.navChannels.map((channel) => {
                return channel.url.includes(channelSlug as string)
                  ? {
                      ...channel,
                      items: [
                        ...(channel.items ?? []),
                        {
                          title: data.space_name,
                          url: `/channels/${channelSlug as string}/spaces/${
                            data.space_slug
                          }`
                        }
                      ]
                    }
                  : channel
              })
            }))
          }
        }
      },
      ["channel", "space"]
    )

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square   items-center justify-center rounded-lg border  text-sidebar-primary-foreground">
                  <Image
                    sizes="8"
                    src="/logo/spark-logo-no-bg.png"
                    alt="spark-logo"
                    width={40}
                    height={40}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Spark</span>
                  <span className="truncate text-xs">ETLOnline</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={routes.navMain} label="Platform" />
        <NavMain items={routes.testNav} label="Test" />
        <NavMain items={routes.navChannels} label="Channels" />
        <NavSecondary items={routes.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <SignedIn>
          <NavUser />
        </SignedIn>
      </SidebarFooter>
    </Sidebar>
  )
}
