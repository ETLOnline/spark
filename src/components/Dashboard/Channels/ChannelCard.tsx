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
import { Check, Layout, Lock, PencilRuler } from "lucide-react"
import { Badge } from "../../ui/badge"
import ChannelsContextMenu from "./ChannelDetails/ChannelsContextMenu"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../../ui/tooltip"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

interface ChannelProps {
  channel: SelectChannel
}

function ChannelCard({ channel }: ChannelProps) {
  const authUser = useAtomValue(userStore.AuthUser)

  const spacesCount = channel?.spaces ? channel.spaces.length : 0
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "CHANNEL",
    channel?.id
  )

  const canViewSpace = permissionChecker
    ? permissionChecker?.canAccess("space.view")
    : false
  const canViewChannelAction = permissionChecker
    ? permissionChecker?.canAccess("channel.allow.action")
    : false

  return (
    <Card key={channel.id} className="overflow-hidden">
      {/* <div className="aspect-video w-full overflow-hidden">
        <img
          src={"/images/home/session-image2.jpg"}
          alt={channel.channel_name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div> */}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl flex items-center gap-1">
            {channel.channel_name}
            {channel.channel_type === "private" ? (
              <Lock className="text-muted-foreground text-sm" height={14} />
            ) : null}

            {channel.publish_channel ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Check className="text-muted-foreground" height={14} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Published</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PencilRuler
                      className="text-muted-foreground"
                      height={14}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Draft</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardTitle>
          {authUser || canViewChannelAction ? (
            <ChannelsContextMenu channel={channel} />
          ) : null}
        </div>
        <CardDescription>{channel.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-2">
        <Badge variant="secondary" className="flex items-center">
          <Layout className="mr-1 h-3 w-3" />
          {spacesCount} {spacesCount === 1 ? "Space" : "Spaces"}
        </Badge>
        {channel.channel_type === "public" || canViewSpace ? (
          <Link href={`/channels/${channel.channel_slug}/spaces`}>
            <Button variant="outline">View Spaces</Button>
          </Link>
        ) : null}
      </CardFooter>
    </Card>
  )
}

export default ChannelCard
