"use client"

import { SelectChannel } from "@/src/db/schema"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  AttachChannelUserAction,
  DeleteChannelAction
} from "@/src/server-actions/Channel/Channel"
import { LeaveChannelAction } from "@/src/server-actions/Channel/ChannelActions"
import { channelStore } from "@/src/store/channel/channelStore"
import { useAtomValue, useSetAtom } from "jotai"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import {
  Edit,
  Layout,
  LogOut,
  MoreHorizontal,
  PlusCircle,
  Trash2,
  User
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { userStore } from "@/src/store/user/userStore"
import { useEffect, useState } from "react"
import { isEntityUser } from "@/src/utils/clientHelper"
import CreateShortcut from "@/src/components/common/Shortcut/components/CreateShortcut"

interface ChannelProps {
  channel: SelectChannel
  onActionComplete?: (
    actionType: "deleted" | "updated",
    channel: SelectChannel
  ) => void
  setIsCommunityMember?: React.Dispatch<React.SetStateAction<boolean | null>>
}

const ChannelsContextMenu: React.FC<ChannelProps> = ({
  channel,
  onActionComplete,
  setIsCommunityMember
}) => {
  const currentUserId = useAtomValue(userStore.AuthUser)?.unique_id
  const superAdmin = useAtomValue(userStore.SuperAdmin)
  const [isChannelMember, setIsChannelMember] = useState<boolean>(false)

  const [joinLoading, joinResult, joinError, joinChannel] = useServerAction(
    AttachChannelUserAction
  )
  const [leaveLoading, leaveResult, leaveError, leaveChannel] =
    useServerAction(LeaveChannelAction)

  useEffect(() => {
    const isMember = isEntityUser(channel, currentUserId as string)

    if (isMember) setIsChannelMember(true)
    else {
      setIsChannelMember(false)
    }
  }, [channel, currentUserId])

  // Listen for changes from other components
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
        setIsCommunityMember?.(true)

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

        // Navigate back to the community page where all channels are listed
        if (channel.community?.slug) {
          window.location.href = `/communities/${channel.community.slug}`
        } else {
          window.location.href = `/communities`
        }
      } else {
        console.error("Failed to leave Channel:", res?.error)
      }
    }
  }
  const encodedChannelSlug = encodeURIComponent(channel.channel_slug)

  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "CHANNEL",
    channel?.id
  )

  const canViewActions = permissionChecker
    ? permissionChecker?.canAccess("channel.allow.action")
    : false
  const canEdit = permissionChecker
    ? permissionChecker?.canAccess("channel.update")
    : false
  const canViewSpace = permissionChecker
    ? permissionChecker?.canAccess("space.view")
    : false
  const canViewUser = permissionChecker
    ? permissionChecker?.canAccess("channel.user.view")
    : false
  const canDeletChannel = permissionChecker
    ? permissionChecker?.canAccess("channel.delete")
    : false

  const router = useRouter()
  const setSelectedChannel = useSetAtom(channelStore.selectedChannel)
  const setChannelFormModelVisibility = useSetAtom(
    channelStore.channelformModalVisibility
  )

  const { toast } = useToast()

  const [
    addDeleteChannelLoading,
    addDeleteChannelData,
    addDeleteChannelError,
    DeleteChannel
  ] = useServerAction(DeleteChannelAction)

  function editChannel(channel: SelectChannel) {
    setSelectedChannel(channel)
    setChannelFormModelVisibility(true)
  }

  async function handleDeleteChannel(channelToDelete: SelectChannel) {
    const deletedChannel = await DeleteChannel(channelToDelete)
    if (deletedChannel?.success) {
      onActionComplete?.("deleted", channelToDelete)
      setChannelFormModelVisibility(false)
      toast({
        title: "Channel deleted successfully",
        duration: 3000
      })
    } else {
      toast({
        title: "Failed to delete channel",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  return (
    (canViewActions || channel?.channel_type === "public") && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(canViewSpace || channel.channel_type === "public") && (
            <DropdownMenuItem
              onClick={() =>
                router.push(`/channels/${encodedChannelSlug}/spaces`)
              }
            >
              <Layout className="mr-2 h-4 w-4" />
              View Spaces
            </DropdownMenuItem>
          )}
          {!superAdmin && !isChannelMember && (
            <DropdownMenuItem
              onClick={handleJoinChannel}
              disabled={joinLoading}
              className="text-primary hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {joinLoading ? "Joining..." : "Join Channel"}
            </DropdownMenuItem>
          )}

          {!superAdmin && isChannelMember && (
            <DropdownMenuItem
              onClick={handleLeaveChannel}
              disabled={leaveLoading}
              className="text-muted-foreground hover:bg-muted hover:text-red-500 focus:bg-muted focus:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {leaveLoading ? "Leaving..." : "Leave Channel"}
            </DropdownMenuItem>
          )}
          {canEdit && (
            <DropdownMenuItem onClick={() => editChannel(channel)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {canViewUser && (
            <DropdownMenuItem
              onClick={() =>
                router.push(`/channels/${encodedChannelSlug}/users`)
              }
            >
              <User className="mr-2 h-4 w-4" />
              Users
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <CreateShortcut
            type="channel"
            entity={{
              slug: channel?.channel_slug ?? "",
              title: `${channel?.community?.title} - ${channel?.channel_name}`
            }}
            ctaType="menuItem"
          />
          {canDeletChannel && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleDeleteChannel(channel)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  )
}

export default ChannelsContextMenu
