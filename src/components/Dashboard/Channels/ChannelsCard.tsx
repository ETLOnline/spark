"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader } from "../../ui/card"
import Image from "next/image"
import { SelectChannel } from "@/src/db/schema"
import { Button } from "../../ui/button"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import Link from "next/link"
import { channelStore } from "@/src/store/channel/channelStore"
import { Edit, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "../../ui/alert-dialog"
import { DeleteChannelAction } from "@/src/server-actions/Channel/Channel"
import { useServerAction } from "@/src/hooks/useServerAction"
import Loader from "../../common/Loader/Loader"
import { toast } from "@/src/hooks/use-toast"
import { userStore } from "@/src/store/user/userStore"
import { Badge } from "../../ui/badge"

interface channelProps {
  channel: SelectChannel
}

function ChannelsCard({ channel }: channelProps) {
  const setChannelFormModelVisibility = useSetAtom(
    channelStore.channelformModalVisibility
  )
  const [isOpen, setIsOpen] = useState(false)
  const [channels, setChannels] = useAtom(channelStore.channels)
  const [selectedChannel, setSelectedChannel] = useAtom(
    channelStore.selectedChannel
  )
  const [
    addDeleteChannelLoading,
    addDeleteChannelData,
    addDeleteChannelError,
    DeleteChannel
  ] = useServerAction(DeleteChannelAction)
  const authUser = useAtomValue(userStore.AuthUser)

  function editChannal(channel: SelectChannel) {
    setSelectedChannel(channel)
    setChannelFormModelVisibility(true)
  }

  async function handleDeleteChannel() {
    const deletedChannel = await DeleteChannel(selectedChannel as SelectChannel)
    if (deletedChannel?.success) {
      setChannels((channel) =>
        channel.filter((channel) => channel.id !== selectedChannel?.id)
      )
      setChannelFormModelVisibility(false)
      toast({
        title: "Channel deleted successfully",
        duration: 3000
      })
    }
  }

  return (
    <div className="w-full h-full mt-2">
      <Link
        href={`/channels/${channel.channel_slug}/spaces`}
        onClick={() => setSelectedChannel(channel)}
      >
        <Card
          key={channel.id}
          className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300"
        >
          <div className="relative h-40 sm:h-48 w-full">
            <Image
              src="/images/channels/channel_sample_image.jpg"
              alt={"sample image"}
              fill
              className="object-cover"
            />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <h3 className="text-base font-semibold sm:text-lg">
                  {channel.channel_name}
                </h3>
                <Badge>{channel.channel_type}</Badge>
              </div>
              {channel.ownerId === authUser?.unique_id ||
              authUser?.role.includes("admin") ? (
                <div className="flex items-center gap-1">
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      editChannal(channel)
                    }}
                    variant={"ghost"}
                    size={"sm"}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant={"ghost"}
                        size={"sm"}
                        onClick={(e) => {
                          e.preventDefault()
                          setIsOpen(true)
                        }}
                      >
                        {addDeleteChannelLoading ? (
                          <Loader />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete the channel and
                          the spaces that exist in this channel. This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteChannel()
                          }}
                          loading={addDeleteChannelLoading}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground sm:text-base line-clamp-1">
              {channel.description}
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

export default ChannelsCard
