import { Button } from "@/src/components/ui/button"
import {
  Edit,
  ExternalLink,
  MoreHorizontal,
  Settings,
  Trash2,
  User
} from "lucide-react"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useSetAtom } from "jotai"
import { DeleteSpaceAction } from "@/src/server-actions/Space/Space"
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
import { useState } from "react"
import CreateSpaceModal from "./CreateSpaceModal"
import { PermissionChecker } from "@/src/lib/PermissionCheker"

interface Props {
  space: SelectSpace
  permissionChecker?: PermissionChecker | null
}

function SpacesActionButtons({ space, permissionChecker }: Props) {
  const canUpdateSpace = permissionChecker?.canAccess("space.update")
  const canDeleteSpace = permissionChecker?.canAccess("space.delete")
  const canViewSpaceUsers = permissionChecker?.canAccess("space.user.view")
  const canSetSpaceSetting = permissionChecker?.canAccess(
    "space.setting.update"
  )

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
            onClick={() => router.push(`./spaces/${space.space_slug}`)}
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
          {canViewSpaceUsers && (
            <DropdownMenuItem
              onClick={() => router.push(`./spaces/${space.space_slug}/users`)}
            >
              <User className="mr-2 h-4 w-4" />
              Users
            </DropdownMenuItem>
          )}
          {canSetSpaceSetting && (
            <DropdownMenuItem
              onClick={() =>
                router.push(`./spaces/${space.space_slug}/settings`)
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
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
