'use client'
import { useEffect, useState } from 'react'
import { SelectChannel } from '@/src/db/schema'
import { useServerAction } from '@/src/hooks/useServerAction'
import { GetChannelsAction } from '@/src/server-actions/channels/channel'
import ChannelsCard from './ChannelsCard'
import CreateChannels from './CreateChannels'
import { useAtom } from 'jotai'
import { channelStore } from '@/src/store/chennel/channelStore'


function ChannelsScreen() {
  const [channel, setChannel] = useAtom(channelStore.channel);
  const [getchannelLoading, getchannelData, getchannelError, GetChannel] = useServerAction(GetChannelsAction);

  useEffect(() => {
    GetChannel()
  }, [])

  useEffect(() => {
    if (getchannelData != null) {
      setChannel(getchannelData.data ? getchannelData.data : [])
    }
  }, [getchannelData])


  return (
    <>
      <div className=" flex  w-full justify-center">
        <CreateChannels />
      </div>

      <div className='w-full'>
        <div className='flex flex-wrap justify-around w-full gap-3'>
          {channel.map((channel, i) => {
            return (
              <div>
                <ChannelsCard channel={channel} key={channel.id} />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default ChannelsScreen