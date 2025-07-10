import { Badge } from "@/src/components/ui/badge"
import { SelectSprint, SelectTask, SelectUser } from "@/src/db/schema"
import { projectStore } from "@/src/store/project/projectStore"
import { useAtom } from "jotai"
import { CircleHelp, MoreHorizontal } from "lucide-react"
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
import { UpdateTaskAction } from "@/src/server-actions/Tasks/Task"
import { useServerAction } from "@/src/hooks/useServerAction"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import TaskMoveDialog from "../Task/components/task-move-dialog"
import { FindUserByUniqueIdAction } from "@/src/server-actions/User/FindUserByUniqueIdAction"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"

interface Props {
  task: SelectTask
  currSprint: SelectSprint
  setIsTaskModelOpen: Dispatch<SetStateAction<boolean>>
  setTasks: Dispatch<SetStateAction<SelectTask[]>>
  setSelectedTask: Dispatch<SetStateAction<SelectTask | null>>
}

function SprintTasks({
  task,
  currSprint,
  setIsTaskModelOpen,
  setTasks,
  setSelectedTask
}: Props) {
  const [status, setStatus] = useAtom(projectStore.projectStatusList)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isTaskDropDownOpen, setIsTaskDropDownOpen] = useState(false)
  const [isTaskMoveDialogOpen, setIsTaskMoveDialogOpen] = useState(false)
  const [assignedUser, setAssignedUser] = useState<SelectUser | null>(null)

  const [removeTaskLoading, , , RemoveTask] = useServerAction(UpdateTaskAction)

  useEffect(() => {
    const getUser = async () => {
      const res = await FindUserByUniqueIdAction(task.assign_to || "")
      if (res.success && res.data) {
        setAssignedUser(res.data)
      }
    }
    getUser()
  }, [task.assign_to])

  function EditTask(task: SelectTask) {
    setSelectedTask(task)
    setIsTaskModelOpen(true)
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
          {task.assign_to ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={assignedUser?.profile_url || "/placeholder.svg"}
                      alt={assignedUser?.first_name}
                    />
                    <AvatarFallback className="text-xs">
                      {assignedUser?.first_name[0]}
                      {assignedUser?.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <span>
                    {assignedUser?.first_name} {assignedUser?.last_name}
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <CircleHelp />
          )}
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
                  Move to Backlog
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => moveTask(task.id)}>
                  Move to other Sprint
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
