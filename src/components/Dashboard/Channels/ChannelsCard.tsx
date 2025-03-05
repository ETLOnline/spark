"use client"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../../ui/card"
import Image from "next/image"
import { SelectChannel } from "@/src/db/schema"
import { Button } from "../../ui/button"
import { useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import Link from "next/link"
import { channelStore } from "@/src/store/chennel/channelStore"

interface channelProps {
  channel: SelectChannel
}

function ChannelsCard({ channel }: channelProps) {
  const authUser = useAtomValue(userStore.AuthUser)
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
      <Card className="overflow-hidden">
        <Image
          className="w-full h-40 rounded-md"
          width={500}
          height={500}
          src={"/images/channels/channel_sample_image.jpg"}
          alt="channel_image"
        />
        <CardHeader>
          <Link
            href={`channels/${channel.channel_name}?channel_id=${channel.id}`}
            className="hover:underline"
          >
            <CardTitle>{channel.channel_name}</CardTitle>
            <CardDescription>{channel.description}</CardDescription>
          </Link>
        </CardHeader>
        <CardFooter className="flex justify-end">
          {channel.created_by === authUser?.unique_id && (
            <Button variant={"edit"} onClick={() => editChannal(channel)}>
              Edit
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default ChannelsCard
