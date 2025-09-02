"use client"
import React, { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import {
  Edit,
  LogOut,
  MoreHorizontal,
  MoreVertical,
  PlusCircle,
  Settings,
  User
} from "lucide-react"
import { useAtomValue, useSetAtom } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { SelectSpace } from "@/src/db/schema"
import { useRouter } from "next/navigation"
import CreateSpaceModal from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/CreateSpaceModal"
import { channelStore } from "@/src/store/channel/channelStore"
import { isEntityUser } from "@/src/utils/clientHelper"
import { userStore } from "@/src/store/user/userStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import { AttachSpaceUserAction } from "@/src/server-actions/Space/Space"
import { LeaveSpaceAction } from "@/src/server-actions/Space/SpaceActions"
import { useToast } from "@/src/hooks/use-toast"

interface Props {
  currentSpace: SelectSpace
}

function SpaceContextMenu({ currentSpace }: Props) {
  const [spaceFormModelVisibility, setSpaceFormModelVisibility] =
    useState(false)
  const setSelectedSpace = useSetAtom(spaceStore.selectedSpace)
  const channel = useAtomValue(channelStore.selectedChannel)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const currentUserId = useAtomValue(userStore.AuthUser)?.unique_id
  const isSuperAdmin = useAtomValue(userStore.SuperAdmin)
  const [isSpaceMember, setIsSpaceMember] = useState<boolean>(false)

  const [joinLoading, joinResult, joinError, joinSpace] = useServerAction(
    AttachSpaceUserAction
  )
  const [leaveLoading, leaveResult, leaveError, leaveSpace] =
    useServerAction(LeaveSpaceAction)

  useEffect(() => {
    if (currentSpace && currentUserId) {
      const isMember = isEntityUser(currentSpace, currentUserId as string)
      setIsSpaceMember(isMember)
    }
  }, [currentSpace, currentUserId])

  const handleJoinSpace = () => {
    if (currentSpace.id && currentUserId) {
      joinSpace(currentSpace.id, currentUserId).then((res) => {
        if (res?.success) {
          setIsSpaceMember(true)
          toast({
            title: "Space Joined",
            description: "You have successfully joined the Space!",
            duration: 3000
          })
          router.refresh()
        } else {
          console.error("Failed to join Space:", res?.error)
        }
      })
    }
  }

  const handleLeaveSpace = () => {
    if (currentSpace.id) {
      leaveSpace(currentSpace.id).then((res) => {
        if (res?.success) {
          toast({
            title: "Space Left",
            description: "You have successfully left the Space!",
            duration: 3000
          })

          const encodedChannelSlug = encodeURIComponent(
            currentSpace.channel?.channel_slug ?? ""
          )
          router.push(`/channels/${encodedChannelSlug}/spaces`)
          router.refresh()
        } else {
          console.error("Failed to leave Space:", res?.error)
        }
      })
    }
  }

  function handleEditSpace(currentSpace: SelectSpace) {
    setSpaceFormModelVisibility(true)
    setSelectedSpace(currentSpace)
    setShouldRedirect(true)
  }

  return (
    <>
      <CreateSpaceModal
        spaceFormModelVisibility={spaceFormModelVisibility}
        setSpaceFormModelVisibility={setSpaceFormModelVisibility}
        shouldRedirect={shouldRedirect}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`./${currentSpace.space_slug}/settings`)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              handleEditSpace(currentSpace)
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`./${currentSpace.space_slug}/users`)}
          >
            <User className="mr-2 h-4 w-4" />
            Users
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {!isSuperAdmin && !isSpaceMember && (
            <DropdownMenuItem
              onClick={handleJoinSpace}
              disabled={joinLoading}
              className="text-primary hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {joinLoading ? "Joining..." : "Join Space"}
            </DropdownMenuItem>
          )}

          {!isSuperAdmin && isSpaceMember && (
            <DropdownMenuItem
              onClick={handleLeaveSpace}
              disabled={leaveLoading}
              className="text-muted-foreground hover:bg-muted hover:text-red-500 focus:bg-muted focus:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {leaveLoading ? "Leaving..." : "Leave Space"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default SpaceContextMenu
