"use client"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import { InsertTaskStatus, SelectTask } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { DeleteTaskAction } from "@/src/server-actions/Tasks/Task"
import { ToUpperCase } from "@/src/utils/helpers"
import { AlertCircle, Flag, MoreHorizontal } from "lucide-react"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import Link from "next/link"
import React, { Dispatch, SetStateAction } from "react"
import {
  projectTaskPriority,
  projectTaskTypes
} from "../../constants/projectManagment"

interface Props {
  subtask: any
  projectId: string
  statuses?: InsertTaskStatus[]
  isAllowedAction: boolean
  setSubTasks: Dispatch<SetStateAction<SelectTask[]>>
}

function SubTask({
  subtask,
  projectId,
  statuses,
  isAllowedAction,
  setSubTasks
}: Props) {
  const [deleteTaskLoading, deleteTaskData, deleteTaskError, DeleteTask] =
    useServerAction(DeleteTaskAction)

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

  async function handleDeleteTask(selectedTask: SelectTask) {
    try {
      const deletedTask = await DeleteTask(selectedTask)
      if (deletedTask?.success) {
        setSubTasks((prev) => prev.filter((t) => t.id !== selectedTask.id))
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

  return (
    <div key={subtask.id} className="subtask-row">
      <div className="flex items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="">
              <IssueTypeIcon type={subtask.task_type} />
            </TooltipTrigger>
            <TooltipContent>{ToUpperCase(subtask.task_type)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Link href={`?task_id=${subtask.id}`} className="flex gap-4">
          <span className="hover:underline hover:text-blue-600">
            {subtask.task_num}
          </span>
          <span className="hover:underline hover:text-blue-600">
            {subtask.task_title}
          </span>
        </Link>
      </div>
      <div className="flex flex-row items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <PriorityIcon priority={subtask.task_priority} />
            </TooltipTrigger>
            <TooltipContent>
              {ToUpperCase(subtask.task_priority)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <span className="px-2 bg-muted/30 rounded-sm">
          {" "}
          {subtask.story_points && subtask.story_points !== "0"
            ? subtask.story_points
            : "-"}
        </span>

        <Badge variant={"outline"}>
          {statuses?.find((s) => s.id === subtask.status_id)?.name}
        </Badge>
        {isAllowedAction ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDeleteTask(subtask)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  )
}

export default SubTask
