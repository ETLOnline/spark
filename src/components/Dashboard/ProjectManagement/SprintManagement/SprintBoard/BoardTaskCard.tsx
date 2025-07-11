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
import { FindUserByUniqueIdAction } from "@/src/server-actions/User/FindUserByUniqueIdAction"

interface Props {
  task: SelectTask
  onClick: (task: SelectTask) => void
  setTasks: Dispatch<SetStateAction<SelectTask[]>>
}

function BoardTaskCard({ task, onClick, setTasks }: Props) {
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [assignee, setAssignee] = useState<SelectUser | null>(null)

  const [removeTaskLoading, , , RemoveTask] = useServerAction(UpdateTaskAction)

  useEffect(() => {
    const getUser = async () => {
      const res = await FindUserByUniqueIdAction(task.assign_to || "")
      if (res.success && res.data) {
        setAssignee(res.data)
      }
    }
    getUser()
  }, [task.assign_to])

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

  return (
    <>
      <Card
        key={task.id}
        className="p-3 hover:cursor-pointer hover:bg-muted transition-colors"
        onClick={() => onClick(task)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium text-sm">{task.task_title}</h4>
            {/* <p className="text-xs text-muted-foreground mt-1">
              {task.description}
            </p> */}
          </div>
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
        </div>
        <div className="flex flex-wrap justify-between items-center mt-3">
          <div className="flex gap-2 items-center">
            {task.assign_to ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={
                          (assignee?.first_name ?? "") +
                          (assignee?.last_name ?? "")
                        }
                        alt={assignee?.first_name}
                      />
                      <AvatarFallback className="text-xs">
                        {assignee?.first_name[0]}
                        {assignee?.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>
                      {assignee?.first_name} {assignee?.last_name}
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <CircleHelp className="h-5 w-5" />
            )}
            <span className="text-xs">#{task.task_num}</span>
          </div>
          {getPriorityBadge(task.task_priority)}
        </div>
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
