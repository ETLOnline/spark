"use client"

import { SelectChannel } from "@/src/db/schema"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  AttachChannelUserAction,
  DeleteChannelAction
} from "@/src/server-actions/Channel/Channel"
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
  MoreHorizontal,
  PlusCircle,
  Trash2,
  User
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { userStore } from "@/src/store/user/userStore"
import { useEffect, useState } from "react"
import { isChannelUser } from "@/src/utils/clientHelper"

interface ChannelProps {
  channel: SelectChannel
  onActionComplete?: (
    actionType: "deleted" | "updated",
    channel: SelectChannel
  ) => void
}

const ChannelsContextMenu: React.FC<ChannelProps> = ({
  channel,
  onActionComplete
}) => {
  const currentUserId = useAtomValue(userStore.AuthUser)?.unique_id
  const superAdmin = useAtomValue(userStore.SuperAdmin)
  const [isChannelMember, setIsChannelMember] = useState<boolean>(false)

  useEffect(() => {
    const isMember = isChannelUser(channel, currentUserId as string)

    if (isMember) setIsChannelMember(true)
    else {
      setIsChannelMember(false)
    }
  }, [channel, currentUserId])

  const handleJoinChannel = async () => {
    if (channel.id && currentUserId) {
      const res = await joinChannel(channel.id, currentUserId)
      if (res?.success) {
        toast({
          title: "Chnnel Joined",
          duration: 3000
        })
      } else {
        console.error("Failed to join Channel:", res?.error)
      }
    }
  }

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
  const [joinLoading, joinResult, joinError, joinChannel] = useServerAction(
    AttachChannelUserAction
  )

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
                router.push(`/channels/${channel.channel_slug}/spaces`)
              }
            >
              <Layout className="mr-2 h-4 w-4" />
              View Spaces
            </DropdownMenuItem>
          )}
          {!superAdmin && (
            <DropdownMenuItem
              onClick={handleJoinChannel}
              disabled={isChannelMember || joinLoading}
              className={
                isChannelMember ? "text-gray-500 cursor-not-allowed" : ""
              }
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {joinLoading ? "Joining..." : isChannelMember ? "Joined" : "Join"}
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
                router.push(`/channels/${channel.channel_slug}/users`)
              }
            >
              <User className="mr-2 h-4 w-4" />
              Users
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
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
