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
import {
  Check,
  Layout,
  Lock,
  LogOut,
  PencilRuler,
  PlusCircle
} from "lucide-react"
import { Badge } from "../../ui/badge"
import ChannelsContextMenu from "./ChannelDetails/ChannelsContextMenu"
import { useAtomValue } from "jotai"
import { useEffect, useState } from "react"
import { userStore } from "@/src/store/user/userStore"
import { useRouter } from "next/navigation"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  AttachChannelUserAction,
  LeaveChannelAction
} from "@/src/server-actions/Channel/Channel"
import { useToast } from "@/src/hooks/use-toast"
import { isEntityUser } from "@/src/utils/clientHelper"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent
} from "../../ui/tooltip"

interface ChannelProps {
  channel: SelectChannel
}

function ChannelCard({ channel }: ChannelProps) {
  const authUser = useAtomValue(userStore.AuthUser)
  const currentUserId = authUser?.unique_id
  const { toast } = useToast()
  const router = useRouter()

  const [isChannelMember, setIsChannelMember] = useState<boolean>(false)

  const [joinLoading, , , joinChannel] = useServerAction(
    AttachChannelUserAction
  )
  const [leaveLoading, , , leaveChannel] = useServerAction(LeaveChannelAction)

  useEffect(() => {
    if (channel && currentUserId) {
      setIsChannelMember(!!isEntityUser(channel, currentUserId))
    }
  }, [channel, currentUserId])

  const handleJoinChannel = async () => {
    if (channel?.id && currentUserId) {
      const res = await joinChannel(channel.id, currentUserId)
      if (res?.success) {
        setIsChannelMember(true)
        toast({
          title: "Channel Joined",
          description: "You have successfully joined the channel!",
          duration: 3000
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to join channel",
          variant: "destructive"
        })
      }
    }
  }

  const handleLeaveChannel = async () => {
    if (channel?.id && currentUserId) {
      const res = await leaveChannel(channel.id, currentUserId)
      if (res?.success) {
        setIsChannelMember(false)
        toast({
          title: "Channel Left",
          description: "You have successfully left the channel!",
          duration: 3000
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to leave channel",
          variant: "destructive"
        })
      }
    }
  }

  const spacesCount = channel?.spaces ? channel.spaces.length : 0

  return (
    <Card key={channel.id} className="overflow-hidden">
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
          {authUser || false ? <ChannelsContextMenu channel={channel} /> : null}
        </div>
        <CardDescription>{channel.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-2 w-full">
        <Badge variant="secondary" className="flex items-center">
          <Layout className="mr-1 h-3 w-3" />
          {spacesCount} {spacesCount === 1 ? "Space" : "Spaces"}
        </Badge>
        <div className="flex items-center gap-2 w-full justify-between">
          {channel.channel_type === "public" ? (
            <Link href={`/channels/${channel.channel_slug}/spaces`}>
              <Button variant="outline">View Spaces</Button>
            </Link>
          ) : null}

          {currentUserId && (
            <>
              {isChannelMember ? (
                <Button
                  variant="outline"
                  onClick={handleLeaveChannel}
                  disabled={leaveLoading}
                  loading={leaveLoading}
                  className="border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {leaveLoading ? "Leaving..." : "Leave"}
                </Button>
              ) : (
                channel.channel_type === "public" && (
                  <Button
                    variant="outline"
                    onClick={handleJoinChannel}
                    disabled={joinLoading}
                    loading={joinLoading}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {joinLoading ? "Joining..." : "Join"}
                  </Button>
                )
              )}
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export default ChannelCard
