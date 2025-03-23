"use client"

import React, { useState } from "react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { SelectChannel } from "@/src/db/schema"
import { Button } from "../../ui/button"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import Link from "next/link"
import { channelStore } from "@/src/store/channel/channelStore"
import { Edit, Layout, MoreHorizontal, Settings, Trash2 } from "lucide-react"

import { DeleteChannelAction } from "@/src/server-actions/Channel/Channel"
import { useServerAction } from "@/src/hooks/useServerAction"
import Loader from "../../common/Loader/Loader"
import { toast } from "@/src/hooks/use-toast"
import { userStore } from "@/src/store/user/userStore"
import { Badge } from "../../ui/badge"
import { canUserIntract } from "@/src/utils/helpers"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface channelProps {
  channel: SelectChannel
}

function ChannelsCard({ channel }: channelProps) {
  const router = useRouter()
  
  const [channels, setChannels] = useAtom(channelStore.channels)
  const [selectedChannel, setSelectedChannel] = useAtom(channelStore.selectedChannel)
  const authUser = useAtomValue(userStore.AuthUser)
  const setChannelFormModelVisibility = useSetAtom(channelStore.channelformModalVisibility)

  const spacesCount = channel?.spaces ? channel.spaces.length : 0 

  const [
    addDeleteChannelLoading,
    addDeleteChannelData,
    addDeleteChannelError,
    DeleteChannel
  ] = useServerAction(DeleteChannelAction)

  function editChannel(channel: SelectChannel) {
    setSelectedChannel(channel)
    setChannelFormModelVisibility(true)
  }

  async function handleDeleteChannel(channel: SelectChannel) {
    console.log("selectedChannel", channel)
    const deletedChannel = await DeleteChannel(channel as SelectChannel)
    if (deletedChannel?.success) {
      setChannels((preChannels) =>
        preChannels.filter((c) => c.id !== channel.id)
      )
      setChannelFormModelVisibility(false)
      toast({
        title: "Channel deleted successfully",
        duration: 3000
      })
    }
  }

  return (
    <Card key={channel.id} className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={"/images/home/session-image2.jpg"}
          alt={channel.channel_name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{channel.channel_name}</CardTitle>
          {
            authUser && canUserIntract(authUser, channel.ownerId) ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/channels/${channel.channel_slug}/spaces`)}>
                    <Layout className="mr-2 h-4 w-4" />
                    View Spaces
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editChannel(channel)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem onClick={() => router.push(`/channels/${channel.channel_slug}/settings`)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteChannel(channel)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ):null
          }
        </div>
        <CardDescription>{channel.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Badge variant="secondary" className="flex items-center">
          <Layout className="mr-1 h-3 w-3" />
          {spacesCount} {spacesCount === 1 ? "Space" : "Spaces"}
        </Badge>
        <Link href={`/channels/${channel.channel_slug}/spaces`}>
          <Button variant="outline">
            View Spaces
          </Button>
        </Link>
      </CardFooter>
    </Card>
    // <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
    //   
    //   <AlertDialogContent>
    //     <AlertDialogHeader>
    //       <AlertDialogTitle>Are you sure?</AlertDialogTitle>
    //       <AlertDialogDescription>
    //         This action will permanently delete the channel and
    //         the spaces that exist in this channel. This action
    //         cannot be undone.
    //       </AlertDialogDescription>
    //     </AlertDialogHeader>
    //     <AlertDialogFooter>
    //       <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
    //         Cancel
    //       </AlertDialogCancel>
    //       <AlertDialogAction
    //         onClick={(e) => {
    //           e.stopPropagation()
    //           handleDeleteChannel()
    //         }}
    //         loading={addDeleteChannelLoading}
    //       >
    //         Delete
    //       </AlertDialogAction>
    //     </AlertDialogFooter>
    //   </AlertDialogContent>
    // </AlertDialog>
  )
}

export default ChannelsCard
