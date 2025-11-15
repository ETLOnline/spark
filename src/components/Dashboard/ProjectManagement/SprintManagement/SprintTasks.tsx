import { Badge } from "@/src/components/ui/badge"
import { SelectSprint, SelectTask, SelectUser } from "@/src/db/schema"
import { projectStore } from "@/src/store/project/projectStore"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { AlertCircle, CircleHelp, Flag, MoreHorizontal } from "lucide-react"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import {
  projectTaskPriority,
  projectTaskTypes
} from "../constants/projectManagment"
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
import {
  checkIfTaskIsParentAction,
  UpdateTaskAction
} from "@/src/server-actions/Tasks/Task"
import { useServerAction } from "@/src/hooks/useServerAction"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import { getInitials, ToUpperCase } from "@/src/utils/helpers"
import { taskStore } from "@/src/store/tasks/taskStore"
import { sprintStore } from "@/src/store/sprint/sprintsStore"
import { DynamicIcon, IconName } from "lucide-react/dynamic"

interface Props {
  task: SelectTask
  currSprint: SelectSprint
  setIsTaskModelOpen?: Dispatch<SetStateAction<boolean>>
  setTasks?: Dispatch<SetStateAction<SelectTask[]>>
  isSprintCompleted?: boolean
}

function SprintTasks({
  task,
  currSprint,
  setIsTaskModelOpen,
  setTasks,
  isSprintCompleted
}: Props) {
  const [status, setStatus] = useAtom(projectStore.projectStatusList)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isTaskDropDownOpen, setIsTaskDropDownOpen] = useState(false)
  const [isTaskMoveDialogOpen, setIsTaskMoveDialogOpen] = useAtom(
    taskStore.isTaskMoveDialogOpen
  )
  const setIsConformationAlertOpen = useSetAtom(
    taskStore.isConfirmationAlertOpen
  )
  const setSelectedSprint = useSetAtom(sprintStore.selectedSprint)
  const setSelectedTaskForEdit = useSetAtom(taskStore.selectedTask)
  const setSelectedTasksForMoveTasks = useSetAtom(taskStore.selectedSprintTask)
  const setTaskMoveDialogAction = useSetAtom(taskStore.taskMoveDialogAction)

  const [removeTaskLoading, , , RemoveTask] = useServerAction(UpdateTaskAction)

  function EditTask(task: SelectTask) {
    setSelectedTaskForEdit(task)
    setIsTaskModelOpen?.(true)
  }

  async function handleRemoveTask(task: SelectTask) {
    try {
      const taskIds = [task.id, ...(task.subTasks?.map((sub) => sub.id) || [])]

      for (const id of taskIds) {
        await RemoveTask(id, { sprint_id: null })
      }

      setTasks?.((prevTasks) =>
        prevTasks.filter((t) => !taskIds.includes(t.id))
      )

      toast({
        title: "Task and its subtasks removed from sprint successfully",
        duration: 2000
      })

      setIsAlertOpen(false)
    } catch {
      toast({
        title: "Unable to remove tasks",
        duration: 2000
      })
    }
  }

  async function moveTask(taskId: string) {
    const isTaskParent = await checkIfTaskIsParentAction(taskId)
    if (isTaskParent.data) {
      setIsConformationAlertOpen(true)
    } else {
      setIsTaskMoveDialogOpen(true)
    }

    setSelectedTasksForMoveTasks([task])
    setSelectedSprint(currSprint)
    setIsTaskDropDownOpen(false)
    setTaskMoveDialogAction("moveTask")
  }

  function IssueTypeIcon({ type }: { type: string }) {
    const typeMap = projectTaskTypes.find((t) => t.key === type)
    return typeMap ? (
      <DynamicIcon
        name={typeMap.icon as IconName}
        className="h-5 w-5"
        style={{ color: typeMap.iconColor }}
      />
    ) : (
      <AlertCircle className="h-5 w-5" />
    )
  }

  function PriorityIcon({ priority }: { priority: string }) {
    const priorityMap = projectTaskPriority.find((p) => p.key === priority)
    return priorityMap ? (
      <DynamicIcon
        name={priorityMap.icon as IconName}
        className="h-5 w-5"
        style={{ color: priorityMap.iconColor }}
      />
    ) : (
      <Flag className="h-5 w-5" />
    )
  }

  // PERMISSIONS INITATE
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    currSprint?.projectId
  )
  const canUpdateTask = permissionChecker
    ? permissionChecker?.canAccess("project.task.update")
    : false
  const canDeleteTask = permissionChecker
    ? permissionChecker?.canAccess("project.task.delete")
    : false

  return (
    <>
      <div
        key={task.id}
        className="grid  grid-cols-12 gap-2 p-4 border-t items-center hover:bg-muted/50  transition delay-150 duration-300"
      >
        <div className="col-span-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="">
                <IssueTypeIcon type={task.task_type} />
              </TooltipTrigger>
              <TooltipContent>{ToUpperCase(task.task_type)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div
          className={`col-span-1 text-sm font-medium text-muted-foreground cursor-pointer`}
          onClick={() => EditTask(task)}
        >
          #{task.task_num}
        </div>

        <div className="col-span-3 ">
          <div
            className={`font-semibold break-words whitespace-normal line-clamp-2 cursor-pointer`}
            onClick={() => EditTask(task)}
          >
            {task.task_title}
          </div>
        </div>

        <div className="col-span-1 text-center">
          {task.parentTask ? (
            <Badge variant={"outline"}>
              <IssueTypeIcon type={task.parentTask?.task_type} />
              {task.parentTask?.task_num}
            </Badge>
          ) : null}
        </div>

        <div className="col-span-2  text-center">
          <Badge variant={"outline"}>
            {status.find((s) => s.id === task.status_id)?.name}
          </Badge>
        </div>

        <div className="col-span-1 text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <PriorityIcon priority={task.task_priority} />
              </TooltipTrigger>
              <TooltipContent>{ToUpperCase(task.task_priority)}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="col-span-1 text-center">
          {task.story_points && task.story_points !== "0"
            ? task.story_points
            : "-"}
        </div>

        <div className="col-span-1 text-center">
          {task.assign_to ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage
                      src={getInitials(
                        `${task?.assignee?.first_name ?? ""} ${task?.assignee?.last_name ?? ""}`
                      )}
                      alt={task.assignee?.first_name ?? ""}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(
                        `${task?.assignee?.first_name ?? ""} ${task?.assignee?.last_name ?? ""}`
                      )}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <span>
                    {task.assignee?.first_name} {task.assignee?.last_name}
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <CircleHelp />
          )}
        </div>

        <div className="col-span-1 text-center">
          {canUpdateTask &&
            (isSprintCompleted ? (
              <span>-</span>
            ) : (
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
                  <DropdownMenuItem
                    onClick={() => {
                      setIsTaskDropDownOpen(false)
                      setIsAlertOpen(true)
                    }}
                  >
                    Move to Backlog
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => moveTask(task.id)}>
                    Move to other Sprint
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will move Task from the current sprint to backlog.
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
              Move
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default SprintTasks
