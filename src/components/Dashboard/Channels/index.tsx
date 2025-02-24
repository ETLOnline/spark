'use client'
import { useEffect, useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Separator } from '@/src/components/ui/separator'
import { Textarea } from '@/src/components/ui/textarea'
import { InsertChannel, SelectChannel } from '@/src/db/schema'
import { useServerAction } from '@/src/hooks/useServerAction'
import { CreateChannelAction, GetChannelsAction } from '@/src/server-actions/channels/channel'
import { userStore } from '@/src/store/user/userStore'
import { useAtomValue } from 'jotai'
import Image from 'next/image'
import ChannelsCard from './ChannelsCard'
import CreateChannels from './CreateChannels'
import Link from 'next/link'

function ChannelsScreen() {

  const [channel, setchannel] = useState<SelectChannel[]>([]);

  const [getchannelLoading, getchannelData, getchannelError, GetChannel] = useServerAction(GetChannelsAction);

  useEffect(() => {
    GetChannel()
  }, [])

  useEffect(() => {
    if (getchannelData != null) {
      setchannel(getchannelData.data ? getchannelData.data : [])
    }
  }, [getchannelData])





  return (
    <>
      <div className=" flex  w-full justify-center">
        <CreateChannels channel={channel} setChannel={setchannel} />
      </div>

      <div className='w-full'>
        <div className='flex flex-wrap justify-around w-full gap-3'>
          {channel.map((channel, i) => {
            return (
              <div>
                <ChannelsCard channel={channel} key={i} />
              </div>
            )
          })}
        </div>
      </div>
    </>

  )
}

export default ChannelsScreen