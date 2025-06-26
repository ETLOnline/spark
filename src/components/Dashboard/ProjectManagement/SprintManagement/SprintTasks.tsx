import { Badge } from "@/src/components/ui/badge"
import { SelectSprint, SelectTask } from "@/src/db/schema"
import { projectStore } from "@/src/store/project/projectStore"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { CircleHelp, MoreHorizontal } from "lucide-react"
import React, { useState } from "react"
import {
  projectTaskPriority,
  projectTaskTypes
} from "../constants/projectManagment"
import { taskStore } from "@/src/store/tasks/taskStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { Button } from "@/src/components/ui/button"
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
import { toast } from "@/src/hooks/use-toast"
import { UpdateTaskAction } from "@/src/server-actions/Tasks/Task"
import { useServerAction } from "@/src/hooks/useServerAction"
import TaskMoveDialog from "../BacklogManagement/task-move-dialog"

interface Props {
  task: SelectTask
  currSprint: SelectSprint
}

function SprintTasks({ task, currSprint }: Props) {
  const [status, setStatus] = useAtom(projectStore.projectStatusList)
  const setSelectedTask = useSetAtom(taskStore.selectedTask)
  const [isTaskFormModelOpen, setIsTaskFormModelOpen] = useAtom(
    taskStore.isTaskFormModelOpen
  )
  const setTask = useSetAtom(taskStore.tasks)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isTaskDropDownOpen, setIsTaskDropDownOpen] = useState(false)
  const [isTaskMoveDialogOpen, setIsTaskMoveDialogOpen] = useState(false)

  const [removeTaskLoading, , , RemoveTask] = useServerAction(UpdateTaskAction)

  function EditTask(task: SelectTask) {
    setSelectedTask(task)
    setIsTaskFormModelOpen(true)
  }

  async function handleRemoveTask(task: SelectTask) {
    try {
      const updatedTask = await RemoveTask(task.id, { sprint_id: null })
      if (updatedTask?.success && updatedTask.data) {
        setTask((prevTasks) =>
          prevTasks.map((t) =>
            t.id === task.id ? { ...t, ...updatedTask.data } : t
          )
        )

        toast({
          title: "Task removed from sprint successfully",
          duration: 2000
        })
        setIsAlertOpen(false)
      }
    } catch {
      toast({
        title: "Unable to remove task",
        duration: 2000
      })
    }
  }

  function moveTask(taskId: string) {
    setIsTaskMoveDialogOpen(true)
    setIsTaskDropDownOpen(false)
  }

  const getTypeLabel = (type: string) => {
    const matchedType = projectTaskTypes.find((t) => t.key === type)
    return matchedType ? (
      <Badge
        variant={
          matchedType?.badgeVariant as
            | "default"
            | "destructive"
            | "secondary"
            | "outline"
        }
      >
        {matchedType.title}
      </Badge>
    ) : (
      <Badge variant={"outline"} />
    )
  }

  const getPriorityLabel = (priority: string) => {
    const priorityMap = projectTaskPriority.find((p) => p.key === priority)
    return priorityMap ? (
      <Badge
        variant={"outline"}
        style={{
          color: priorityMap.badgeTextColor,
          borderColor: priorityMap.badgeBorderColor
        }}
      >
        {priorityMap?.title}
      </Badge>
    ) : (
      <Badge variant="outline">Unknown</Badge>
    )
  }

  // PERMISSIONS INITATE
  const permissionChecker = useAtomValue(
    projectStore.singleprojectPermissionCheckerAtom
  )
  const canUpdateTask = permissionChecker?.canAccess("project.task.update")
  const canDeleteTask = permissionChecker?.canAccess("project.task.delete")

  return (
    <>
      <div
        key={task.id}
        className="grid grid-cols-12 gap-2 p-4 border-t items-center hover:bg-muted/50  transition delay-150 duration-300"
      >
        <div
          className="col-span-2 text-sm font-medium text-muted-foreground cursor-pointer"
          onClick={() => EditTask(task)}
        >
          #{task.task_num}
        </div>
        <div className="col-span-3 ">
          <div
            className="font-semibold break-words whitespace-normal cursor-pointer"
            onClick={() => EditTask(task)}
          >
            {task.task_title}
          </div>
        </div>
        <div className="col-span-1 text-center">
          {getTypeLabel(task.task_type)}
        </div>
        <div className="col-span-3 flex justify-around items-center">
          <Badge variant={"outline"}>
            {status.find((s) => s.id === task.status_id)?.name}
          </Badge>
          <div>{getPriorityLabel(task.task_priority)}</div>
        </div>
        <div className="col-span-1 text-center">{task.story_points}</div>
        <div className="col-span-1 text-center">
          <CircleHelp className="w-full" />
        </div>
        <div className="col-span-1 text-center">
          {canUpdateTask && (
            <DropdownMenu
              open={isTaskDropDownOpen}
              onOpenChange={(open) => setIsTaskDropDownOpen(open)}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Assign</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setIsTaskDropDownOpen(false)
                    setIsAlertOpen(true)
                  }}
                >
                  Remove from Sprint
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => moveTask(task.id)}>
                  move to other Sprint
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove Task from the current sprint.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleRemoveTask(task)
              }}
              loading={removeTaskLoading}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TaskMoveDialog
        isTaskMoveDialogOpen={isTaskMoveDialogOpen}
        setIsTaskMoveDialogOpen={setIsTaskMoveDialogOpen}
        task_id={task.id}
        currSprintId={currSprint.id}
      />
    </>
  )
}

export default SprintTasks
