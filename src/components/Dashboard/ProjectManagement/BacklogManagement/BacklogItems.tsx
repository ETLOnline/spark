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
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { SelectTask, SelectUser } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  checkIfTaskIsParentAction,
  DeleteTaskAction
} from "@/src/server-actions/Tasks/Task"
import { projectStore } from "@/src/store/project/projectStore"
import { taskStore } from "@/src/store/tasks/taskStore"
import { useAtom, useSetAtom } from "jotai"
import { AlertCircle, CircleHelp, Flag, MoreHorizontal } from "lucide-react"
import React, { useState } from "react"
import {
  projectTaskPriority,
  projectTaskTypes
} from "../constants/projectManagment"
import { useParams } from "next/navigation"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import { getInitials, ToUpperCase } from "@/src/utils/helpers"
import Link from "next/link"
import { DynamicIcon, IconName } from "lucide-react/dynamic"

interface Props {
  task: SelectTask
}

function BacklogItems({ task }: Props) {
  const params = useParams()
  const projectId = params.id as string
  const [isDropdownOpen, setIsDropDownOpen] = useState(false)
  const setSelectedTask = useSetAtom(taskStore.selectedTask)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const setTasks = useSetAtom(taskStore.BackLogTasks)
  const [status, setStatus] = useAtom(projectStore.projectStatusList)
  const [isTaskMoveDialogOpen, setIsTaskMoveDialogOpen] = useAtom(
    taskStore.isTaskMoveDialogOpen
  )
  const setIsConfirmationAlertOpen = useSetAtom(
    taskStore.isConfirmationAlertOpen
  )
  const setIsTaskModalOpen = useSetAtom(taskStore.isTaskModalOpen)
  const setTaskMoveDialogAction = useSetAtom(taskStore.taskMoveDialogAction)

  const [deleteTaskLoading, deleteTaskData, deleteTaskError, DeleteTask] =
    useServerAction(DeleteTaskAction)

  function EditTask(task: SelectTask) {
    setSelectedTask(task)
    setIsDropDownOpen(false)
    setIsTaskModalOpen(true)
  }

  async function handleDeleteTask(selectedTask: SelectTask) {
    try {
      const deletedTask = await DeleteTask(selectedTask)
      if (deletedTask?.success) {
        setTasks((prev) => prev.filter((t) => t.id !== selectedTask.id))
        toast({
          title: "Task Deleted successfully"
        })
      }
    } catch {
      toast({
        title: "Task Deleted successfully",
        variant: "destructive"
      })
    }
  }

  const HandleMoveTask = async (task: SelectTask) => {
    const isTaskParent = await checkIfTaskIsParentAction(task.id)
    if (isTaskParent.data) {
      setIsConfirmationAlertOpen(true)
    } else {
      setIsTaskMoveDialogOpen(true)
    }
    setSelectedTask(task)
    setIsDropDownOpen(false)
    setTaskMoveDialogAction("moveTask")
  }

  // PERMISSIONS INITATE
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    projectId
  )
  const canUpdate = permissionChecker
    ? permissionChecker?.canAccess("project.backlog.task.update")
    : false
  const canDelete = permissionChecker
    ? permissionChecker?.canAccess("project.backlog.task.delete")
    : false

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

  const isParentAvailable = task.parentTask

  return (
    <>
      <div
        key={task.id}
        className="grid grid-cols-12 gap-3 p-4 border-t items-center hover:bg-muted/50  transition delay-150 duration-300"
      >
        <div className={`col-span-1`}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <IssueTypeIcon type={task.task_type} />
              </TooltipTrigger>
              <TooltipContent>{task.task_type}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div
          className={`col-span-1 text-sm font-medium cursor-pointer text-left`}
          onClick={() => EditTask(task)}
        >
          {task.task_num}
        </div>
        <div className={"col-span-3"}>
          <div
            className={`font-medium break-words whitespace-normal line-clamp-2 cursor-pointer text-left`}
            onClick={() => EditTask(task)}
          >
            {task.task_title}
          </div>
        </div>

        <div className="col-span-1 text-center">
          {task.parentTask ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant={"outline"}>
                    <Link
                      href={`/project/${projectId}/task/${task.parentTask?.id}`}
                      className="flex flex-row items-center gap-2"
                    >
                      <IssueTypeIcon type={task.parentTask.task_type} />
                      {task.parentTask?.task_num}
                    </Link>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>{task.parentTask?.task_title}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>

        <div className="col-span-2 text-center">
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
            <div className="flex justify-center items-center">
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
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <CircleHelp />
            </div>
          )}
        </div>
        <div className="col-span-1 text-center">
          {(canUpdate || canDelete) && (
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={(open) => setIsDropDownOpen(open)}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canUpdate && (
                  <>
                    <DropdownMenuItem onClick={() => EditTask(task)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        HandleMoveTask(task)
                      }}
                    >
                      Add to Sprint
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                {canDelete && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setIsAlertOpen(true)
                      setIsDropDownOpen(false)
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                )}
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
              This action will remove Task permanentl and can't be undo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDeleteTask(task)
              }}
              loading={deleteTaskLoading}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default BacklogItems
