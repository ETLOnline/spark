import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { SelectTask, SelectUser } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { UpdateTaskAction } from "@/src/server-actions/Tasks/Task"
import {
  AlertCircle,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  CircleHelp,
  Equal,
  MoreHorizontal
} from "lucide-react"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import { projectTaskTypes, TaskType } from "../../constants/projectManagment"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { useDraggable } from "@dnd-kit/core"
import { ToUpperCase } from "@/src/utils/helpers"

interface Props {
  task: SelectTask
  onClick: (task: SelectTask) => void
  setTasks: Dispatch<SetStateAction<SelectTask[]>>
  taskList?: SelectTask[]
}

function BoardTaskCard({ task, onClick, setTasks, taskList }: Props) {
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const [removeTaskLoading, , , RemoveTask] = useServerAction(UpdateTaskAction)

  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    task?.project_id
  )

  const canUpdate = permissionChecker
    ? permissionChecker.canAccess("project.task.update")
    : false

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "highest":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <ChevronsUp className="text-red-500" />
              </TooltipTrigger>
              <TooltipContent>Highest Priority</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )

      case "high":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <ChevronUp className="text-red-500" />
              </TooltipTrigger>
              <TooltipContent>High Priority</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )

      case "medium":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Equal className="text-yellow-500" />
              </TooltipTrigger>
              <TooltipContent>Medium Priority</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )

      case "low":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <ChevronDown className="text-green-500" />
              </TooltipTrigger>
              <TooltipContent>Low Priority</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )

      case "lowest":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <ChevronsDown className="text-green-500" />
              </TooltipTrigger>
              <TooltipContent>Lowest Priority</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )

      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  async function handleRemoveTask(task: SelectTask) {
    try {
      const updatedTask = await RemoveTask(task.id, { sprint_id: null })
      if (updatedTask?.success && updatedTask.data) {
        setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id))

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

  function IssueTypeIcon({ type }: { type: string }) {
    const typeMap = projectTaskTypes.find((t) => t.key === type)
    return typeMap ? (
      <DynamicIcon
        name={typeMap.icon as IconName}
        className="h-4 w-4"
        style={{ color: typeMap.iconColor }}
      />
    ) : (
      <AlertCircle className="h-5 w-5" />
    )
  }

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { statusId: task.status_id }, // keep column info
      disabled: !canUpdate
    })

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    opacity: isDragging ? 0.5 : 1
  }

  const subTasks = taskList?.filter((t) => t.parent_task_id === task.id)

  const filteredSubTasks = subTasks?.filter(
    (subTask) => subTask.status_id === task.status_id
  )

  return (
    <>
      <Card
        key={`${task.id}-card`}
        className={` transition-colors hover:cursor-pointer hover:bg-muted`}
      >
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className="p-3"
          onClick={() => onClick(task)}
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs flex items-center gap-2 mb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="">
                      <IssueTypeIcon type={task.task_type} />
                    </TooltipTrigger>
                    <TooltipContent>
                      {ToUpperCase(task.task_type)}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-muted-foreground">{task.task_num}</span>
              </span>
              <h4 className="font-medium text-sm line-clamp-2">
                {task.task_title}
              </h4>
            </div>
            {canUpdate && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsAlertOpen(true)
                    }}
                  >
                    Move to Backlog
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {task.parentTask ? (
            <div className="p-1 border rounded-md mt-2 flex items-center gap-2">
              <div>
                <IssueTypeIcon type={task.parentTask?.task_type} />
              </div>
              <span className="text-xs line-clamp-1">
                {task.parentTask?.task_num} {task.parentTask?.task_title}
              </span>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-between items-center mt-3">
            <div className="flex gap-2 items-center">
              {task.assign_to ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-5 w-5 cursor-pointer">
                        <AvatarImage
                          src={task.assignee?.profile_url || ""}
                          alt={task.assignee?.first_name}
                        />
                        <AvatarFallback className="text-xs">
                          {task.assignee?.first_name[0]}
                          {task.assignee?.last_name[0]}
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
                <CircleHelp className="h-5 w-5" />
              )}
              <span className="text-sm text-muted-foreground">
                {task.assignee?.first_name} {task.assignee?.last_name}
              </span>
            </div>
            {getPriorityBadge(task.task_priority)}
          </div>
        </div>

        {(filteredSubTasks?.length ?? 0) > 0 && (
          <div className="text-xs flex flex-col gap-2 p-2 ">
            {filteredSubTasks?.map((subTask) => (
              <BoardTaskCard
                key={subTask.id}
                task={subTask}
                onClick={onClick}
                setTasks={setTasks}
              />
            ))}
          </div>
        )}
      </Card>

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

export default BoardTaskCard
