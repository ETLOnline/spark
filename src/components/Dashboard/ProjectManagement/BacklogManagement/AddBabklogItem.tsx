import { Button } from '@/src/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Textarea } from '@/src/components/ui/textarea'
import { InsertTask, SelectTask } from '@/src/db/schema'
import { toast } from '@/src/hooks/use-toast'
import { useServerAction } from '@/src/hooks/useServerAction'
import { CreateTaskAction, GetTaskSatatusAction, UpdateTaskAction } from '@/src/server-actions/Tasks/Task'
import { projectStore } from '@/src/store/project/projectStore'
import { taskStatusesStore } from '@/src/store/taskstatuses/StatusesStore'
import { userStore } from '@/src/store/user/userStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom, useAtomValue } from 'jotai'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const projectSchema = z.object({
  task_title: z.string().min(1, "Title required").max(50, "Title is too long"),
  description: z.string().min(1, "Title required").max(100, "Title is too long"),
  task_type: z.string().min(1, "Title required"),
  task_priority: z.string().min(1, "Title required"),
  story_points: z.string().optional(),
  status_id: z.string().optional()
})



function AddBabklogItem() {
  const [isCreateItemOpen, setIsCreateItemOpen] = useAtom(projectStore.isCreateItemOpen)
  const [tasks, setTasks] = useAtom(projectStore.tasks)
  const [editTask, setEditTask] = useState(false)
  const [selectedTask, setSelectedTask] = useAtom(projectStore.selectedTask)
  const [statuses, setStatuses] = useAtom(taskStatusesStore.statuses)

  const authUser = useAtomValue(userStore.AuthUser)
  const [createTaskLoading, createTaskData, createTaskError, CreateTask] = useServerAction(CreateTaskAction)
  const [updateTaskLoading, updateTaskData, updateTaskError, UpdateTask] = useServerAction(UpdateTaskAction)

  const form = useForm({
    resolver: zodResolver(projectSchema)
  })

  const projectId = useParams().id as string
  const backlogStatus = statuses.find(s => s.name === "Backlog")


  useEffect(() => {
    const fetchStatuses = async () => {
      const status = await GetTaskSatatusAction(projectId)
      if (status.success && status.data) {
        setStatuses(status.data)
      }
    }
    fetchStatuses()
  }, [isCreateItemOpen])


  useEffect(() => {
    if (!isCreateItemOpen) {
      form.reset()
      form.clearErrors()
      setSelectedTask(null)
      setEditTask(false)
    }
  }, [isCreateItemOpen])

  useEffect(() => {
    if (selectedTask) {
      const status = statuses.find(s => s.id === selectedTask.status_id)
      setEditTask(true)
      form.setValue("task_title", selectedTask.task_title)
      form.setValue("description", selectedTask.description)
      form.setValue("task_type", selectedTask.task_type)
      form.setValue("task_priority", selectedTask.task_priority)
      form.setValue("story_points", selectedTask.story_points)
      form.setValue("status", status?.name)
    } else {
      setEditTask(false)
    }
  }, [selectedTask])

  // console.log(form.formState.errors)

  function taskSubmit(data: any) {
    if (!selectedTask) {
      handleCreateTask(data)
    } else {
      handleUpdateTask(data)
    }
  }


  async function handleCreateTask(data: InsertTask) {
    try {
      if (authUser) {
        const payload = {
          ...data,
          created_by: authUser?.unique_id,
          project_id: projectId || ""
        }
        const task = await CreateTask(payload)
        if (task?.success && task.data) {
          setTasks([...tasks, task.data])
          setIsCreateItemOpen(false)
          toast({
            title: "task added"
          })
        } else {
          toast({
            title: "failed",
            variant: "destructive"
          })
        }
      }
    } catch {
      console.log("Error in creating task")
    }
  }



  async function handleUpdateTask(data: SelectTask) {
    try {
      if (selectedTask?.id) {
        const updatedTask = await UpdateTask(selectedTask?.id, data)
        if (updatedTask?.success && updatedTask.data) {
          setTasks((prevTask) =>
            prevTask.map((task) =>
              task.id === selectedTask.id
                ? { ...task, ...updatedTask.data } : task
            )
          )
          toast({
            title: "Task Updated successfully"
          })
          setIsCreateItemOpen(false)
        }
      }
    } catch {
      toast({
        title: "Unable to Update Task",
        variant: "destructive"
      })
    }
  }



  return (
    <Dialog open={isCreateItemOpen} onOpenChange={setIsCreateItemOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editTask === true ? "Edit Backlog Item" : "Create Backlog Item"}</DialogTitle>
          <DialogDescription>{editTask === true ? "Edit Your Backlog Item" : "Add a new item to your project backlog."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(taskSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task_title" className="text-right">
                Title
              </Label>
              <Controller
                name="task_title"
                defaultValue=""
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="task_title"
                    {...field}
                    className="col-span-3"
                  />
                )}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Controller
                name="description"
                defaultValue=""
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    id="description"
                    {...field}
                    className="col-span-3"
                  />
                )}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task_type" className="text-right">
                Type
              </Label>
              <Controller
                name="task_type"
                defaultValue=""
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="task_type" className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                    </SelectContent>
                  </Select>

                )}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task_priority" className="text-right">
                Priority
              </Label>
              <Controller
                name="task_priority"
                defaultValue=""
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="task_priority" className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>

                )}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="story_points" className="text-right">
                Story Points
              </Label>
              <Controller
                name="story_points"
                defaultValue=""
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="story_points"
                    {...field}
                    className="col-span-3"
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status_id" className="text-right">
                Status
              </Label>
              <Controller
                name="status_id"
                defaultValue={backlogStatus?.id}
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={backlogStatus?.id}>
                    <SelectTrigger id="status_id" className="col-span-3">
                      <SelectValue placeholder={backlogStatus?.name || "Select type"} />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(s => (
                        s.id && <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>


                )}
              />
            </div>
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item-labels" className="text-right">
                Labels
              </Label>
              <Input
                id="item-labels"
                className="col-span-3"
                placeholder="feature, frontend, backend (comma separated)"
              />
            </div> */}
          </div>
          <DialogFooter>
            {
              editTask == true ?
                <Button type="submit" loading={updateTaskLoading}>Save</Button>
                : <Button type="submit" loading={createTaskLoading}>Create Item</Button>

            }
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddBabklogItem