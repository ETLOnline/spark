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
import { useAtomValue, useSetAtom } from "jotai"
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
import { projectStore } from "@/src/store/project/projectStore"
import { taskStore } from "@/src/store/tasks/taskStore"

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
  const projectStatusList = useAtomValue(projectStore.projectStatusList)
  const setIsTaskMoveDialogOpen = useSetAtom(taskStore.isTaskMoveDialogOpen)
  const setCurrSprint = useSetAtom(sprintStore.selectedSprint)
  const setSelectedTask = useSetAtom(taskStore.selectedSprintTask)

  const setTaskMoveDilaogAction = useSetAtom(taskStore.taskMoveDialogAction)

  const [deleteSprintLoading, , , DeleteSprint] =
    useServerAction(DeleteSprintAction)

  const [updateSprintLoading, , , UpdateSprint] =
    useServerAction(UpdateSprintAction)

  function EditSprint(sprint: SelectSprint) {
    setSelectedSprint(sprint)
    setIsCreateSprintOpen(true)
    setIsSprintContextMenuOpen(false)
  }

  const DoneStatusId = projectStatusList.find((s) => s.name === "Done")?.id

  async function handleDeleteSprint(sprintId: string) {
    try {
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
    if (!sprint) return

    const incompleteTasks = sprintTasks.filter(
      (t) => t.status_id !== DoneStatusId
    )

    if (incompleteTasks.length > 0) {
      setIsTaskMoveDialogOpen(true)
      setCurrSprint(sprint)
      setSelectedTask(incompleteTasks)
      setIsSprintContextMenuOpen(false)
      setTaskMoveDilaogAction("endSprint")
    } else {
      const res = await UpdateSprint(sprint.id, { sprint_status: "closed" })
      if (res?.success && res.data) {
        setSprintList((prev) =>
          prev.map((s) => (s.id === res.data.id ? res.data : s))
        )
      }
    }
  }

  const canDeleteSprint = (sprintId: string) => {
    const isTasksInSprint = sprintTasks.filter((t) => t.sprint_id === sprintId)

    if (isTasksInSprint.length > 0) {
      setIsTaskMoveDialogOpen(true)
      setCurrSprint(sprint)
      setSelectedTask(isTasksInSprint)
      setIsSprintContextMenuOpen(false)
      setTaskMoveDilaogAction("deleteSprint")
    } else {
      setIsSprintContextMenuOpen(false)
      setIsAlertOpen(true)
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
            {sprint.sprint_status !== "active" ? (
              <DropdownMenuItem
                onClick={() => {
                  HandleStartSprint(sprint)
                }}
              >
                Start Sprint
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={() => HandleEndSprint(sprint)}>
              End Sprint
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {canDelete && (
              <DropdownMenuItem
                className="text-red-500 "
                onClick={() => {
                  canDeleteSprint(sprint.id)
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
