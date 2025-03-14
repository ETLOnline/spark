"use client"

import React from "react"
import { Card, CardContent, CardHeader } from "../../ui/card"
import Image from "next/image"
import { SelectChannel } from "@/src/db/schema"
import { Button } from "../../ui/button"
import { useSetAtom } from "jotai"
import Link from "next/link"
import { channelStore } from "@/src/store/channel/channelStore"
import { Edit } from "lucide-react"

interface channelProps {
  channel: SelectChannel
}

function ChannelsCard({ channel }: channelProps) {
  const setSelectedChannel = useSetAtom(channelStore.selectedChannel)
  const setChannelFormModelVisibility = useSetAtom(
    channelStore.channelformModalVisibility
  )

  function editChannal(channel: SelectChannel) {
    setSelectedChannel(channel)
    setChannelFormModelVisibility(true)
  }

  return (
    <div className=" w-full h-full  mt-2">
      <Link href={`/channels/${channel.channel_slug}/spaces`} onClick={() => setSelectedChannel(channel)}>
        <Card key={channel.id} className="overflow-hidden flex flex-col">
          <div className="relative h-40 sm:h-48 w-full">
            <Image
              src="/images/channels/channel_sample_image.jpg"
              alt={"sample image"}
              fill
              className="object-cover"
            />
          </div>
          <CardHeader>
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
          <CardContent >
            <p className="text-sm text-muted-foreground sm:text-base line-clamp-3">
              {channel.description}
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

export default ChannelsCard
