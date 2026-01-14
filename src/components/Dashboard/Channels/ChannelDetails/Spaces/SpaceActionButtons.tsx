import { Button } from "@/src/components/ui/button"
import {
  Edit,
  ExternalLink,
  LogOut,
  MoreHorizontal,
  PlusCircle,
  Settings,
  Trash2,
  User
} from "lucide-react"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useAtomValue, useSetAtom } from "jotai"
import {
  AttachSpaceUserAction,
  DeleteSpaceAction,
  DetachSpaceUserAction
} from "@/src/server-actions/Space/Space"
import { useServerAction } from "@/src/hooks/useServerAction"
import { SelectSpace } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import CreateSpaceModal from "./CreateSpaceModal"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { userStore } from "@/src/store/user/userStore"
import { isEntityUser } from "@/src/utils/clientHelper"
import CreateShortcut from "@/src/components/common/Shortcut/components/CreateShortcut"
import clsx from "clsx"
import { getRoleIdOnMatch } from "@/src/services/realtime/utils/helper"
import useShortcut from "@/src/components/common/Shortcut/hooks/useShortcut"

interface Props {
  space: SelectSpace
  setIsChannelMember?: React.Dispatch<React.SetStateAction<boolean>>
}

function SpacesActionButtons({ space, setIsChannelMember }: Props) {
  const [joinLoading, joinResult, joinError, joinSpace] = useServerAction(
    AttachSpaceUserAction
  )
  const [leaveLoading, leaveResult, leaveError, leaveSpace] =
    useServerAction(DetachSpaceUserAction)
  const {getShortcuts} = useShortcut()

  const authUser = useAtomValue(userStore.AuthUser)
  const currentUserId = authUser?.unique_id
  const superAdmin = useAtomValue(userStore.SuperAdmin)
  const [isSpaceMember, setIsSpaceMember] = useState<boolean>(false)
  useEffect(() => {
    const isMember = isEntityUser(space, currentUserId as string)

    if (isMember) setIsSpaceMember(true)
    else {
      setIsSpaceMember(false)
    }
  }, [space, currentUserId])

  const handleJoinSpace = async () => {
    if (!space.id || !currentUserId) return

    try {
      const res = await joinSpace(space.id, currentUserId)

      if (res?.success) {
        setIsSpaceMember(true)
        setIsChannelMember?.(true)
        toast({
          title: "Space Joined",
          description: "You have successfully joined the Space!",
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while joining the Space",
        variant: "destructive"
      })
    }
  }

  const handleLeaveSpace = async () => {
    if(!authUser?.roles) {
      toast({
        title: "Error",
        description: "Failed to leave Space",
        variant: "destructive"
      })
      return;
    }
    const role_id = getRoleIdOnMatch(authUser?.roles, space.id)
    if (space.id && currentUserId && role_id) {
      const res = await leaveSpace(space.id, currentUserId, role_id)
      if (res?.success) {
        setIsSpaceMember(false)
        await getShortcuts()
        toast({
          title: "Space Left",
          description: "You have successfully left the Space!",
          duration: 3000
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to leave Space",
          variant: "destructive"
        })
      }
    }
  }

  const encodedSpaceSlug = encodeURIComponent(space.space_slug)
  const encodeChannelSlug = encodeURIComponent(
    space.channel?.channel_slug ?? ""
  )
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    space?.id
  )

  const canUpdateSpace = permissionChecker
    ? permissionChecker?.canAccess("space.update")
    : false
  const canDeleteSpace = permissionChecker
    ? permissionChecker?.canAccess("space.delete")
    : false
  const canViewSpaceUsers = permissionChecker
    ? permissionChecker?.canAccess("space.user.view")
    : false
  const canSetSpaceSetting = permissionChecker
    ? permissionChecker?.canAccess("space.setting.update")
    : false

  const setSelectedSpace = useSetAtom(spaceStore.selectedSpace)
  const setSpaces = useSetAtom(spaceStore.spaces)

  const [
    addDeleteSpaceLoading,
    addDeleteSpaceData,
    addDeleteSpaceError,
    deleteSpace
  ] = useServerAction(DeleteSpaceAction)
  const [spaceFormModelVisibility, setSpaceFormModelVisibility] =
    useState(false)

  const router = useRouter()

  function handleEditSpace(space: SelectSpace) {
    setSpaceFormModelVisibility(true)
    setSelectedSpace(space)
  }

  async function handleDeleteSpace(selectedSpace: SelectSpace) {
    const deletedSpace = await deleteSpace(selectedSpace)
    if (deletedSpace?.success) {
      setSpaces((prev) => prev.filter((s) => s.id !== selectedSpace.id))
      toast({
        title: "Space deleted successfully.",
        duration: 3000
      })
    }
  }

  return (
    <>
      <CreateSpaceModal
        spaceFormModelVisibility={spaceFormModelVisibility}
        setSpaceFormModelVisibility={setSpaceFormModelVisibility}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`./spaces/${encodedSpaceSlug}`)}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Space
          </DropdownMenuItem>
          {canUpdateSpace && (
            <DropdownMenuItem onClick={() => handleEditSpace(space)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {!superAdmin && !isSpaceMember && (
            <DropdownMenuItem onClick={handleJoinSpace} disabled={joinLoading}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {joinLoading ? "Joining..." : "Join Space"}
            </DropdownMenuItem>
          )}

          {!superAdmin && isSpaceMember && (
            <DropdownMenuItem
              onClick={handleLeaveSpace}
              disabled={leaveLoading}
              className={clsx(
                "text-red-500",
                "focus:bg-red-500 focus:text-white",
                "dark:focus:bg-muted dark:focus:text-red-500"
              )}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {leaveLoading ? "Leaving..." : "Leave Space"}
            </DropdownMenuItem>
          )}
          {canViewSpaceUsers && (
            <DropdownMenuItem
              onClick={() => router.push(`./spaces/${encodedSpaceSlug}/users`)}
            >
              <User className="mr-2 h-4 w-4" />
              Users
            </DropdownMenuItem>
          )}
          {canSetSpaceSetting && (
            <DropdownMenuItem
              onClick={() =>
                router.push(`./spaces/${encodedSpaceSlug}/settings`)
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <CreateShortcut
            type="space"
            entity={{
              slug: `${encodeChannelSlug}/spaces/${encodedSpaceSlug}`,
              title: `${space?.space_name}`,
              entity_id: space?.id
            }}
            ctaType="menuItem"
          />
          {canDeleteSpace && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleDeleteSpace(space)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default SpacesActionButtons
