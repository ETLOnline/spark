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
import { useAtom, useAtomValue } from "jotai"
import { channelStore } from "@/src/store/channel/channelStore"
import { userStore } from "@/src/store/user/userStore"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../../ui/tooltip"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { useState, useEffect } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { AttachChannelUserAction } from "@/src/server-actions/Channel/Channel"
import { LeaveChannelAction } from "@/src/server-actions/Channel/ChannelActions"
import { useToast } from "@/src/hooks/use-toast"
import { isEntityUser } from "@/src/utils/clientHelper"

interface ChannelProps {
  channel: SelectChannel
}

function ChannelCard({ channel }: ChannelProps) {
  const authUser = useAtomValue(userStore.AuthUser)
  const currentUserId = authUser?.unique_id
  const { toast } = useToast()
  const [isChannelMember, setIsChannelMember] = useState<boolean>(false)
  const [channels, setChannels] = useAtom(channelStore.channels)

  // Server actions
  const [joinLoading, joinResult, joinError, joinChannel] = useServerAction(
    AttachChannelUserAction
  )
  const [leaveLoading, leaveResult, leaveError, leaveChannel] =
    useServerAction(LeaveChannelAction)

  useEffect(() => {
    if (channel && currentUserId) {
      const isMember = isEntityUser(channel, currentUserId)
      setIsChannelMember(isMember)
    }
  }, [channel, currentUserId])

  // Listen for changes from context menu
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "channel_member_status" && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          if (data.channelId === channel.id) {
            setIsChannelMember(data.isMember)
          }
        } catch (err) {
          console.error("Error parsing channel member status:", err)
        }
      }
    }

    window.addEventListener("storage", handleStorageEvent)
    return () => window.removeEventListener("storage", handleStorageEvent)
  }, [channel.id])

  const handleJoinChannel = async () => {
    if (channel.id && currentUserId) {
      const res = await joinChannel(channel.id, currentUserId)
      if (res?.success) {
        setIsChannelMember(true)

        // Notify other components about the status change
        localStorage.setItem(
          "channel_member_status",
          JSON.stringify({
            channelId: channel.id,
            isMember: true
          })
        )
        // Trigger storage event for other tabs/components
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "channel_member_status",
            newValue: JSON.stringify({
              channelId: channel.id,
              isMember: true
            })
          })
        )

        toast({
          title: "Channel Joined",
          description: "You have successfully joined the channel!",
          duration: 3000
        })
      } else {
        console.error("Failed to join Channel:", res?.error)
      }
    }
  }

  const handleLeaveChannel = async () => {
    if (channel.id) {
      const res = await leaveChannel(channel.id)
      if (res?.success) {
        setIsChannelMember(false)

        // Notify other components about the status change
        localStorage.setItem(
          "channel_member_status",
          JSON.stringify({
            channelId: channel.id,
            isMember: false
          })
        )
        // Trigger storage event for other tabs/components
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "channel_member_status",
            newValue: JSON.stringify({
              channelId: channel.id,
              isMember: false
            })
          })
        )

        toast({
          title: "Channel Left",
          description: "You have successfully left the channel!",
          duration: 3000
        })
      } else {
        console.error("Failed to leave Channel:", res?.error)
      }
    }
  }

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
      <CardFooter className="flex flex-col items-start gap-2 w-full">
        <Badge variant="secondary" className="flex items-center">
          <Layout className="mr-1 h-3 w-3" />
          {spacesCount} {spacesCount === 1 ? "Space" : "Spaces"}
        </Badge>
        <div className="flex items-center gap-2 w-full justify-between">
          {channel.channel_type === "public" || canViewSpace ? (
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
