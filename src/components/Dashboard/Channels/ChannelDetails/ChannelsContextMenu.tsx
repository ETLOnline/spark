"use client"

import { SelectChannel } from "@/src/db/schema"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  AttachChannelUserAction,
  DeleteChannelAction,
  LeaveChannelAction
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
import clsx from "clsx"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/src/components/ui/alert-dialog"

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
  const [leaveDialogOpen, setLeaveDialogOpen] = useState<boolean>(false)
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

  const handleJoinChannel = async () => {
    if (channel.id && currentUserId) {
      const res = await joinChannel(channel.id, currentUserId)
      if (res?.success) {
        setIsChannelMember(true)
        setIsCommunityMember?.(true)
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
    if (!channel.id || !currentUserId) return

    try {
      const res = await leaveChannel(channel.id, currentUserId)

      if (res?.success) {
        setIsChannelMember(false)
        setIsCommunityMember?.(false)

        toast({
          title: "Channel Left",
          description: "You have left the channel and its spaces.",
          duration: 3000
        })

        if (channel.community?.slug) {
          router.push(`/communities/${channel.community.slug}`)
        } else {
          router.push(`/communities`)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while leaving the channel.",
        duration: 3000
      })
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
      <>
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
            {!superAdmin &&
              !isChannelMember &&
              channel.channel_type === "public" && (
                <DropdownMenuItem
                  onClick={handleJoinChannel}
                  disabled={joinLoading}
                  className=" hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {joinLoading ? "Joining..." : "Join Channel"}
                </DropdownMenuItem>
              )}

            {!superAdmin && isChannelMember && (
              <DropdownMenuItem
                onClick={() => setLeaveDialogOpen(true)}
                disabled={leaveLoading}
                className={clsx(
                  "text-red-500",
                  "focus:bg-red-500 focus:text-white",
                  "dark:focus:bg-muted dark:focus:text-red-500"
                )}
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
                title: `${channel?.channel_name}`,
                entity_id: channel?.id ?? "",
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

        <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave Channel?</AlertDialogTitle>
              <AlertDialogDescription>
                By leaving this, you will also be removed from related spaces.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                loading={leaveLoading}
                onClick={async () => {
                  await handleLeaveChannel()
                  setLeaveDialogOpen(false)
                }}
              >
                Leave Channel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  )
}

export default ChannelsContextMenu
