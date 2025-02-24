import React from 'react'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import Image from 'next/image'
import { SelectChannel } from '@/src/db/schema'
import { Button } from '../../ui/button'
import { useAtomValue } from 'jotai'
import { userStore } from '@/src/store/user/userStore'
import Link from 'next/link'

interface channelProps {
  channel: SelectChannel
}

function ChannelsCard({ channel }: channelProps) {

  const authUser = useAtomValue(userStore.AuthUser)


  return (

    <div className=" w-full h-full  mt-2">
      <Card className='overflow-hidden' >
        <Image className='w-full h-40 rounded-md' width={500} height={500} src={'/images/channels/channel_sample_image.jpg'} alt='channel_image' />
        <CardHeader>
          <Link href={"/spaces/CreateSpace"} className='hover:underline'>
            <CardTitle>{channel.channel_name}</CardTitle>
            <CardDescription>{channel.description}</CardDescription>
          </Link>
          {channel.created_by === authUser?.unique_id && (
            <Button variant={'edit'}>Edit</Button>
          )}
        </CardHeader>
      </Card>
    </div>
  )
}

export default ChannelsCard

