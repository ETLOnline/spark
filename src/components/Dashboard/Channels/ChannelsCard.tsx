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
import { Edit } from 'lucide-react'

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



  function editChannal(channel: SelectChannel) {
    setSelectedChannel(channel)
    setChannelFormModelVisibility(true)
  }

  return (
    <div className=" w-full h-full  mt-2">
      <Link href={`/channels/${channel.channel_name}?channel_id=${channel.id}`} >
        <Card key={channel.id} className="overflow-hidden flex flex-col relative">
          <div className="relative h-40 sm:h-48 w-full">
            <Image
              src="/images/channels/channel_sample_image.jpg"
              alt="sample image"
              fill
              className="object-cover"
            />
            {/* <div className="absolute top-2 right-2 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <MoreVertical className="h-4 w-4 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) =>
                    editChannal(channel)
                  }
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) =>
                    handleDeleteChannel()
                  }
                  className="text-destructive"
                >
                  Delete channel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}
          </div>
          <CardHeader className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold sm:text-lg">
                {channel.channel_name}
              </h3>
              <Button onClick={(e) => {
                e.preventDefault()
                editChannal(channel)
              }} variant={"ghost"}>
                <Edit />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 pb-4 sm:p-6 sm:pt-0 flex-1">
            <p className="text-sm text-muted-foreground sm:text-base line-clamp-3">
              {channel.description}
            </p>
          </CardContent>
        </Card>
      </Link>
    </div >
  )
}

export default ChannelsCard
