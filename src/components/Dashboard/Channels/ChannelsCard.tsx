import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../../ui/card"
import { SelectChannel } from "@/src/db/schema"
import { Button } from "../../ui/button"
import Link from "next/link"
import { Layout, Lock } from "lucide-react"
import { Badge } from "../../ui/badge"
import { canUserIntract } from "@/src/utils/helpers"
import ChannelsContextMenu from "./ChannelDetails/ChannelsContextMenu"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"

interface ChannelProps {
  channel: SelectChannel
}

function ChannelsCard({ channel }: ChannelProps) {
  const authUser = useAtomValue(userStore.AuthUser)

  const spacesCount = channel?.spaces ? channel.spaces.length : 0

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
          <CardTitle className="text-xl flex items-center gap-1">
            {channel.channel_name}
            {channel.channel_type === "private" && (
              <Lock className="text-muted-foreground" />
            )}
          </CardTitle>
          {authUser && canUserIntract(authUser, channel.ownerId) ? (
            <ChannelsContextMenu channel={channel} />
          ) : null}
        </div>
        <CardDescription>{channel.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Badge variant="secondary" className="flex items-center">
          <Layout className="mr-1 h-3 w-3" />
          {spacesCount} {spacesCount === 1 ? "Space" : "Spaces"}
        </Badge>
        <Link href={`/channels/${channel.channel_slug}/spaces`}>
          <Button variant="outline">View Spaces</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default ChannelsCard
