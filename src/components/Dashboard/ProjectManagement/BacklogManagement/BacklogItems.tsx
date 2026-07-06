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
        className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 p-4 border-t items-start md:items-center hover:bg-muted/50 transition delay-150 duration-300 relative"
      >
        {/* Mobile Type & ID */}
        <div className="md:col-span-1 flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <IssueTypeIcon type={task.task_type} />
              </TooltipTrigger>
              <TooltipContent>{task.task_type}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Mobile Only ID */}
          <div
            className="md:hidden text-sm font-medium cursor-pointer"
            onClick={() => EditTask(task)}
          >
            #{task.task_num}
          </div>
        </div>

        {/* Desktop Only ID */}
        <div
          className="hidden md:block md:col-span-1 text-sm font-medium cursor-pointer text-left"
          onClick={() => EditTask(task)}
        >
          #{task.task_num}
        </div>

        {/* Title */}
        <div className="md:col-span-2 w-full pr-8 md:pr-0">
          <div
            className="font-medium break-words whitespace-normal line-clamp-2 cursor-pointer text-left"
            onClick={() => EditTask(task)}
          >
            {task.task_title}
          </div>
        </div>

        {/* Wrapper for Badges and extra info */}
        <div className="flex flex-wrap items-center gap-2 w-full md:contents">
          {/* Parent Badge */}
          <div className="md:col-span-2 md:text-center min-w-0 overflow-hidden">
            {task.parentTask ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="max-w-full">
                    <Badge variant={"outline"} className="max-w-full ">
                      <Link
                        href={`/project/${projectId}/task/${task.parentTask?.id}`}
                        className="flex flex-row items-center gap-1 min-w-0"
                      >
                        <IssueTypeIcon type={task.parentTask.task_type} />
                        <span className="ml-1 truncate">
                          {task.parentTask?.task_num}
                        </span>
                      </Link>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>{task.parentTask?.task_title}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
          </div>

          {/* Status Badge */}
          <div className="md:col-span-2 md:text-center min-w-0 overflow-hidden">
            <Badge variant={"outline"} className="max-w-full">
              <span className="truncate">
                {status.find((s) => s.id === task.status_id)?.name}
              </span>
            </Badge>
          </div>

          {/* Priority */}
          <div className="md:col-span-1 md:text-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <PriorityIcon priority={task.task_priority} />
                </TooltipTrigger>
                <TooltipContent>
                  {ToUpperCase(task.task_priority)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Story Points */}
          <div className="md:col-span-1 md:text-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 text-sm font-medium md:truncate md:max-w-[50px] mx-auto">
                    <span className="md:hidden text-muted-foreground text-xs">
                      Pts:
                    </span>
                    {task.story_points && task.story_points !== "0"
                      ? task.story_points
                      : "-"}
                  </div>
                </TooltipTrigger>

                <TooltipContent>
                  <span>
                    {task.story_points && task.story_points !== "0"
                      ? task.story_points
                      : "-"}
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Assignee */}
          <div className="md:col-span-1 md:text-center">
            {task.assign_to ? (
              <div className="flex justify-start md:justify-center items-center">
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
              <div className="flex justify-start md:justify-center items-center">
                <CircleHelp className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="absolute right-4 top-4 md:static md:col-span-1 md:text-center">
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
        <AlertDialogContent className="w-[95vw] sm:max-w-md rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove Task permanently and can't be undone.
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
