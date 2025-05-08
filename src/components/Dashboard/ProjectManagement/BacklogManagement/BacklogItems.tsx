import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/src/components/ui/alert-dialog'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Checkbox } from '@/src/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/src/components/ui/dropdown-menu'
import { SelectTask } from '@/src/db/schema'
import { toast } from '@/src/hooks/use-toast'
import { useServerAction } from '@/src/hooks/useServerAction'
import { DeleteTaskAction } from '@/src/server-actions/Tasks/Task'
import { projectStore } from '@/src/store/project/projectStore'
import { taskStore } from '@/src/store/tasks/taskStore'
import { taskStatusesStore } from '@/src/store/taskstatuses/StatusesStore'
import { useAtom, useSetAtom } from 'jotai'
import { CircleHelp, MoreHorizontal } from 'lucide-react'
import React, { Dispatch, SetStateAction, useState } from 'react'

interface Props {
  selectedItems: string[]
  setSelectedItems: Dispatch<SetStateAction<string[]>>
  task: SelectTask
}

function BacklogItems({ task, selectedItems, setSelectedItems }: Props) {
  const setIsTicketFormModelOpen = useSetAtom(taskStore.isTaskFormModelOpen)
  const [isDropdownOpen, setIsDropDownOpen] = useState(false)
  const setSelectedTask = useSetAtom(taskStore.selectedTask)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const SetTasks = useSetAtom(taskStore.tasks)
  const [status, setStatus] = useAtom(taskStatusesStore.statuses)

  const [deleteTaskLoading, deleteTaskData, deleteTaskError, DeleteTask] = useServerAction(DeleteTaskAction)


  const handleSelectItem = (id: string) => {
    setSelectedItems(
      selectedItems.includes(id) ? selectedItems.filter((itemId) => itemId !== id) : [...selectedItems, id],
    )
  }

  function EditTask(task: SelectTask) {
    setSelectedTask(task)
    setIsTicketFormModelOpen(true)
    setIsDropDownOpen(false)
  }

  async function handleDeleteTask(selectedTask: SelectTask) {
    try {
      const deletedTask = await DeleteTask(selectedTask)
      if (deletedTask?.success) {
        SetTasks((prev) =>
          prev.filter((t) => t.id !== selectedTask.id)
        )
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
    switch (type) {
      case "story":
        return (
          <Badge variant="default" className="bg-blue-500">
            Story
          </Badge>
        )
      case "bug":
        return <Badge variant="destructive">Bug</Badge>
      case "task":
        return <Badge variant="secondary">Task</Badge>
      case "epic":
        return (
          <Badge variant="default" className="bg-purple-500">
            Epic
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <>
      <div key={task.id} className="grid grid-cols-12 gap-2 p-4 border-t items-center">
        <div className="col-span-1">
          <Checkbox
            checked={task.task_num ? selectedItems.includes(task.task_num) : false}
            onCheckedChange={() => task.task_num && handleSelectItem(task.task_num)}
          />
        </div>
        <div className="col-span-1 text-sm font-medium">{task.task_num}</div>
        <div className="col-span-3">
          <div className="font-medium">{task.task_title}</div>
          <div className="text-xs text-muted-foreground hidden sm:block" dangerouslySetInnerHTML={{ __html: task.description }} />
          {/* <div className="flex flex-wrap gap-1 mt-1  sm:flex">
          {task.labels.map((label, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {label}
            </Badge>
          ))}
        </div> */}
        </div>
        <div className="col-span-1">{getTypeLabel(task.task_type)}</div>
        <div className="col-span-3 flex justify-around items-center">
          <Badge variant={"outline"}>
            {status.find(s => s.id === task.status_id)?.name}
          </Badge>
          <div >{getPriorityLabel(task.task_priority)}</div>
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
          <DropdownMenu open={isDropdownOpen} onOpenChange={(open) => setIsDropDownOpen(open)}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => EditTask(task)}>Edit</DropdownMenuItem>
              <DropdownMenuItem>Assign</DropdownMenuItem>
              <DropdownMenuItem>Add to Sprint</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setIsAlertOpen(true)
                  setIsDropDownOpen(false)
                }}
              >Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div >
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action  will remove Task permanentl and can't be undo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDeleteTask(task)
              }}
              loading={deleteTaskLoading}
            >Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default BacklogItems