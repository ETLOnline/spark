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
import { SelectSprint } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { DeleteSprintAction } from "@/src/server-actions/Sprint/sprint"
import { toast } from "@/src/hooks/use-toast"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
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
import { taskStore } from "@/src/store/tasks/taskStore"
import { projectStore } from "@/src/store/project/projectStore"

interface Props {
  isSprintContextMenuOpen: boolean
  setIsSprintContextMenuOpen: Dispatch<SetStateAction<boolean>>
  sprint: SelectSprint
}

function SprintContextMenu({
  sprint,
  isSprintContextMenuOpen,
  setIsSprintContextMenuOpen
}: Props) {
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)
  const [selectedSprint, setSelectedSprint] = useState<SelectSprint | null>(
    null
  )
  const setSprintList = useSetAtom(sprintStore.sprints)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const tasks = useAtomValue(taskStore.tasks)

  const [deleteSprintLoading, , , DeleteSprint] =
    useServerAction(DeleteSprintAction)

  function EditSprint(sprint: SelectSprint) {
    setSelectedSprint(sprint)
    setIsCreateSprintOpen(true)
    setIsSprintContextMenuOpen(false)
  }

  async function handleDeleteSprint(sprintId: string) {
    try {
      const SprintTasks = tasks.filter((t) => t.sprint_id === sprintId)
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
  const permissionChecker = useAtomValue(
    projectStore.singleprojectPermissionCheckerAtom
  )
  const canUpdate = permissionChecker?.canAccess("project.sprint.update")
  const canDelete = permissionChecker?.canAccess("project.sprint.delete")

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
