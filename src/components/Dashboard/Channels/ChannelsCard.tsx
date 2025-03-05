"use client"
import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import Image from 'next/image'
import { SelectChannel } from '@/src/db/schema'
import { Button } from '../../ui/button'
import { useAtomValue, useSetAtom } from 'jotai'
import { userStore } from '@/src/store/user/userStore'
import Link from 'next/link'
import { channelStore } from '@/src/store/chennel/channelStore'
import { Edit } from 'lucide-react'

interface channelProps {
  channel: SelectChannel
}

function ChannelsCard({ channel }: channelProps) {
  const authUser = useAtomValue(userStore.AuthUser);
  const setSelectedChannel = useSetAtom(channelStore.selectedChannel);
  const setChannelFormModelVisibility = useSetAtom(channelStore.channelformModalVisibility);


  function editChannal(channel: SelectChannel) {
    setSelectedChannel(channel)
    setChannelFormModelVisibility(true)
  }


  return (
    <div className=" w-full h-full  mt-2">
      <Card key={channel.id} className="overflow-hidden flex flex-col">
        <div className="relative h-40 sm:h-48 w-full">
          <Image src="/images/channels/channel_sample_image.jpg" alt={"sample image"} fill className="object-cover" />
        </div>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold sm:text-lg">{channel.channel_name}</h3>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => editChannal(channel)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit {channel.channel_name}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pb-0 sm:p-6 sm:pt-0 flex-1">
          <p className="text-sm text-muted-foreground sm:text-base line-clamp-3">{channel.description}</p>
        </CardContent>
        <CardFooter>
          <Link href={`/channels/${channel.channel_name}`} className='w-full'>
            <Button variant="outline" className="w-full">
              View Channel
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ChannelsCard

