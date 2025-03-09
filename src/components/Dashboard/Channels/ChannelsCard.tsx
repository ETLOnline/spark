"use client"
import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import Image from 'next/image'
import { SelectChannel } from '@/src/db/schema'
import { Button } from '../../ui/button'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { userStore } from '@/src/store/user/userStore'
import Link from 'next/link'
import { channelStore } from '@/src/store/chennel/channelStore'
import { Edit, MoreVertical } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../ui/dropdown-menu'
import { useServerAction } from '@/src/hooks/useServerAction'
import { DeleteChannelAction } from '@/src/server-actions/channels/channel'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog'

interface channelProps {
  channel: SelectChannel
}

function ChannelsCard({ channel }: channelProps) {
  const authUser = useAtomValue(userStore.AuthUser)
  const setChannelFormModelVisibility = useSetAtom(
    channelStore.channelformModalVisibility
  )
  const [channels, setChannels] = useAtom(channelStore.channels)
  const [selectedChannel, setSelectedChannel] = useAtom(channelStore.selectedChannel)
  const [
    addDeleteChannelLoading,
    addDeleteChannelData,
    addDeleteChannelError,
    DeleteChannel
  ] = useServerAction(DeleteChannelAction)



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
    }
  }

  return (
    <div className=" w-full h-full  mt-2">
      <Card key={channel.id} className="overflow-hidden flex flex-col relative">
        {/* Image with Dropdown Menu Positioned in Top-Right */}
        <div className="relative h-40 sm:h-48 w-full">
          <Link href={`/channels/${channel.channel_name}?channel_id=${channel.id}`} className="absolute inset-0 z-10">
            <span className="sr-only">Go to channel</span>
          </Link>
          <Image
            src="/images/channels/channel_sample_image.jpg"
            alt="sample image"
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  onClick={(e) => e.stopPropagation()}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <MoreVertical className="h-4 w-4 text-white" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    editChannal(channel);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChannel();
                  }}
                  className="text-destructive"
                >
                  Delete channel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>


        {/* Card Header */}
        <Link href={`/channels/${channel.channel_name}?channel_id=${channel.id}`}>
          <CardHeader className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold sm:text-lg">
                {channel.channel_name}
              </h3>
            </div>
          </CardHeader>

          {/* Card Content */}
          <CardContent className="p-3 pb-0 sm:p-6 sm:pt-0 flex-1">
            <p className="text-sm text-muted-foreground sm:text-base line-clamp-3">
              {channel.description}
            </p>
          </CardContent>
        </Link>
      </Card>
    </div >
  )
}

export default ChannelsCard
