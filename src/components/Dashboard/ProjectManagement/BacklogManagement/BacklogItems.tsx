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
import { Checkbox } from "@/src/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { SelectTask } from "@/src/db/schema"
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
import { useRouter } from "next/navigation"

interface Props {
  selectedItems: string[]
  setSelectedItems: Dispatch<SetStateAction<string[]>>
  task: SelectTask
}

function BacklogItems({ task, selectedItems, setSelectedItems }: Props) {
  const [isTaskFormModelOpen, setIsTaskFormModelOpen] = useAtom(
    taskStore.isTaskFormModelOpen
  )
  const [isDropdownOpen, setIsDropDownOpen] = useState(false)
  const setSelectedTask = useSetAtom(taskStore.selectedTask)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const SetTasks = useSetAtom(taskStore.tasks)
  const [status, setStatus] = useAtom(projectStore.projectStatusList)

  const [deleteTaskLoading, deleteTaskData, deleteTaskError, DeleteTask] =
    useServerAction(DeleteTaskAction)

  const handleSelectItem = (id: string) => {
    setSelectedItems(
      selectedItems.includes(id)
        ? selectedItems.filter((itemId) => itemId !== id)
        : [...selectedItems, id]
    )
  }

  function EditTask(task: SelectTask) {
    setSelectedTask(task)
    setIsTaskFormModelOpen(true)
    setIsDropDownOpen(false)
  }

  async function handleDeleteTask(selectedTask: SelectTask) {
    try {
      const deletedTask = await DeleteTask(selectedTask)
      if (deletedTask?.success) {
        SetTasks((prev) => prev.filter((t) => t.id !== selectedTask.id))
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

  return (
    <>
      <div
        key={task.id}
        className="grid grid-cols-12 gap-2 p-4 border-t items-center hover:bg-muted/50  transition delay-150 duration-300"
      >
        <div className="col-span-1">
          <Checkbox
            checked={
              task.task_num ? selectedItems.includes(task.task_num) : false
            }
            onCheckedChange={() =>
              task.task_num && handleSelectItem(task.task_num)
            }
          />
        </div>
        <div
          className="col-span-1 text-sm font-medium cursor-pointer"
          onClick={() => EditTask(task)}
        >
          {task.task_num}
        </div>
        <div className="col-span-3">
          <div
            className="font-medium break-words whitespace-normal cursor-pointer"
            onClick={() => EditTask(task)}
          >
            {task.task_title}
          </div>
        </div>
        <div className="col-span-1">{getTypeLabel(task.task_type)}</div>
        <div className="col-span-3 flex justify-around items-center">
          <Badge variant={"outline"}>
            {status.find((s) => s.id === task.status_id)?.name}
          </Badge>
          <div>{getPriorityLabel(task.task_priority)}</div>
        </div>
        <div className="col-span-1">{task.story_points}</div>
        <div className="col-span-1">
          {/* {task.assignee ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={task.assignee.avatar} />
            <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <Badge variant="outline" className="text-xs">
            Unassigned
          </Badge>
        )} */}

          <CircleHelp />
        </div>
        <div className="col-span-1 text-right">
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
              <DropdownMenuItem onClick={() => EditTask(task)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>Assign</DropdownMenuItem>
              <DropdownMenuItem>Add to Sprint</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setIsAlertOpen(true)
                  setIsDropDownOpen(false)
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
