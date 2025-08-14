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
import { DeleteTaskAction } from "@/src/server-actions/Tasks/Task"
import { projectStore } from "@/src/store/project/projectStore"
import { taskStore } from "@/src/store/tasks/taskStore"
import { useAtom, useSetAtom } from "jotai"
import { CircleHelp, MoreHorizontal } from "lucide-react"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
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
import { getInitials } from "@/src/utils/helpers"
import usePageName from "@/src/hooks/usePageName"

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
  const setIsTaskModalOpen = useSetAtom(taskStore.isTaskModalOpen)
  const setTaskMoveDialogAction = useSetAtom(taskStore.taskMoveDialogAction)

  const [deleteTaskLoading, deleteTaskData, deleteTaskError, DeleteTask] =
    useServerAction(DeleteTaskAction)
  const { GetPageName } = usePageName()

  const pageName = GetPageName()

  function EditTask(task: SelectTask) {
    setSelectedTask(task)
    setIsDropDownOpen(false)
    setIsTaskModalOpen(true)
  }

  async function handleDeleteTask(selectedTask: SelectTask) {
    try {
      const deletedTask = await DeleteTask(selectedTask, pageName ?? "")
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

  const HandleMoveTask = (task: SelectTask) => {
    setSelectedTask(task)
    setIsTaskMoveDialogOpen(true)
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

  return (
    <>
      <div
        key={task.id}
        className="grid grid-cols-12 gap-3 p-4 border-t items-center hover:bg-muted/50  transition delay-150 duration-300"
      >
        <div
          className={`col-span-1 text-sm font-medium cursor-pointer text-left`}
          onClick={() => EditTask(task)}
        >
          {task.task_num}
        </div>
        <div className="col-span-4">
          <div
            className={`font-medium break-words whitespace-normal line-clamp-2 cursor-pointer text-left`}
            onClick={() => EditTask(task)}
          >
            {task.task_title}
          </div>
        </div>
        <div className="col-span-1 text-center">
          {getTypeLabel(task.task_type)}
        </div>
        <div className="col-span-2 text-center">
          <Badge variant={"outline"}>
            {status.find((s) => s.id === task.status_id)?.name}
          </Badge>
        </div>
        <div className="col-span-1 text-center">
          {getPriorityLabel(task.task_priority)}
        </div>
        <div className="col-span-1 text-center">{task.story_points}</div>
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
