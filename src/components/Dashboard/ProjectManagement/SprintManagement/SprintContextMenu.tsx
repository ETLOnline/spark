import React, { Dispatch, SetStateAction, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { Button } from "@/src/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import CreateSprintModal from "./CreateSprintModal"
import { SelectSprint, SelectTask } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  DeleteSprintAction,
  UpdateSprintAction
} from "@/src/server-actions/Sprint/sprint"
import { toast } from "@/src/hooks/use-toast"
import { useSetAtom } from "jotai"
import { sprintStore } from "@/src/store/sprint/sprintsStore"
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
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { useParams } from "next/navigation"

interface Props {
  isSprintContextMenuOpen: boolean
  setIsSprintContextMenuOpen: Dispatch<SetStateAction<boolean>>
  sprint: SelectSprint
  sprintTasks: SelectTask[]
}

function SprintContextMenu({
  sprint,
  sprintTasks,
  isSprintContextMenuOpen,
  setIsSprintContextMenuOpen
}: Props) {
  const params = useParams()
  const projectId = params.id as string

  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)
  const [selectedSprint, setSelectedSprint] = useState<SelectSprint | null>(
    null
  )
  const setSprintList = useSetAtom(sprintStore.sprints)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  // const tasks = useAtomValue(taskStore.tasks)

  const [deleteSprintLoading, , , DeleteSprint] =
    useServerAction(DeleteSprintAction)

  const [updateSprintLoading, , , UpdateSprint] =
    useServerAction(UpdateSprintAction)

  function EditSprint(sprint: SelectSprint) {
    setSelectedSprint(sprint)
    setIsCreateSprintOpen(true)
    setIsSprintContextMenuOpen(false)
  }

  async function handleDeleteSprint(sprintId: string) {
    try {
      const SprintTasks = sprintTasks.filter((t) => t.sprint_id === sprintId)
      if (SprintTasks.length > 0) {
        toast({
          title: "Unable to delete sprint",
          description:
            "This sprint has tasks assigned to it. Please remove the tasks before deleting the sprint.",
          variant: "destructive",
          duration: 2000
        })
      } else {
        const deletedSprint = await DeleteSprint(sprintId)

        if (deletedSprint?.success) {
          setSprintList((prevSprints) =>
            prevSprints.filter((s) => s.id !== sprintId)
          )
          toast({
            title: "Sprint delted succesfuully",
            duration: 2000
          })
        }
      }
    } catch {
      toast({
        title: "Unable to delete sprint",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  // PERMISSIONS INITATE
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    projectId
  )
  const canUpdate = permissionChecker
    ? permissionChecker?.canAccess("project.sprint.update")
    : false
  const canDelete = permissionChecker
    ? permissionChecker?.canAccess("project.sprint.delete")
    : false

  async function HandleStartSprint(sprint: SelectSprint) {
    if (sprint) {
      const res = await UpdateSprint(sprint.id, { sprint_status: "active" })
      if (res?.success && res.data) {
        setSprintList((prev) =>
          prev.map((s) => (s.id === res.data.id ? res.data : s))
        )
      }
    }
  }

  async function HandleEndSprint(sprint: SelectSprint) {
    if (sprint) {
      const res = await UpdateSprint(sprint.id, { sprint_status: "closed" })
      if (res?.success && res.data) {
        setSprintList((prev) =>
          prev.map((s) => (s.id === res.data.id ? res.data : s))
        )
      }
      console.log("id", sprint.id, "data", res?.data)
    }
  }

  return (
    <>
      {(canDelete || canUpdate) && (
        <DropdownMenu
          open={isSprintContextMenuOpen}
          onOpenChange={(open) => setIsSprintContextMenuOpen(open)}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canUpdate && (
              <DropdownMenuItem onClick={() => EditSprint(sprint)}>
                Edit Sprint
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                HandleStartSprint(sprint)
              }}
            >
              Start Sprint
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => HandleEndSprint(sprint)}>
              End Sprint
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canDelete && (
              <DropdownMenuItem
                className="text-red-500 "
                onClick={() => {
                  setIsSprintContextMenuOpen(false)
                  setIsAlertOpen(true)
                }}
              >
                Delete Sprint
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete {sprint.title}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteSprint(sprint.id)}
              loading={deleteSprintLoading}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateSprintModal
        selectedSprint={selectedSprint}
        isCreateSprintOpen={isCreateSprintOpen}
        setIsCreateSprintOpen={setIsCreateSprintOpen}
      />
    </>
  )
}

export default SprintContextMenu
