"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { AlertCircle, BarChart2, Bug, CheckCircle2, CircleAlert, Flag, Lightbulb, Rocket } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { InsertTask, InsertTaskStatus, SelectTask, SelectTaskStatus } from '@/src/db/schema'
import { toast } from '@/src/hooks/use-toast'
import { useServerAction } from '@/src/hooks/useServerAction'
import { CreateTaskAction, UpdateTaskAction } from '@/src/server-actions/Tasks/Task'
import { projectStore } from '@/src/store/project/projectStore'
import { userStore } from '@/src/store/user/userStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom, useAtomValue } from 'jotai'
import { useParams } from 'next/navigation'
import { z } from 'zod'
import { ToUpperCase } from "@/src/utils/helpers"
import { taskStore } from "@/src/store/tasks/taskStore"
import RichTextEditor from "@/src/components/common/rich-text-editor"

interface Props {
  statuses?: InsertTaskStatus[]
}

const projectSchema = z.object({
  task_title: z.string().min(1, "Required").max(50, "Title is too long"),
  description: z.string().optional(),
  task_type: z.string().min(1, "Required"),
  task_priority: z.string().min(1, "Required"),
  story_points: z.string().optional(),
  status_id: z.string().optional()
})

export default function TaskForm({ statuses }: Props) {
  const [activeField, setActiveField] = useState<string | null>(null)


  const [isTaskFormModelOpen, setIsTaskFormModelOpen] = useAtom(taskStore.isTaskFormModelOpen)
  const [tasks, setTasks] = useAtom(taskStore.tasks)
  const [selectedTask, setSelectedTask] = useAtom(taskStore.selectedTask)

  const authUser = useAtomValue(userStore.AuthUser)
  const [createTaskLoading, createTaskData, createTaskError, CreateTask] = useServerAction(CreateTaskAction)
  const [updateTaskLoading, updateTaskData, updateTaskError, UpdateTask] = useServerAction(UpdateTaskAction)

  const form = useForm({
    resolver: zodResolver(projectSchema)
  })

  const projectId = useParams().id as string
  const backlogStatus = statuses?.find(s => s.name === "Backlog")

  const descriptionInputRef = useRef<any>(null);

  useEffect(() => {
    if (activeField === "description" && descriptionInputRef.current?.focus) {
      descriptionInputRef.current.focus();
    }
  }, [activeField]);



  useEffect(() => {
    if (!isTaskFormModelOpen) {
      form.reset(
        {
          task_title: "",
          description: "",
          task_type: "",
          task_priority: "",
          story_points: "",
          status_id: backlogStatus?.id
        }
      )
      form.clearErrors()
      setSelectedTask(null)
    }
  }, [isTaskFormModelOpen])

  useEffect(() => {
    if (selectedTask) {
      const status = statuses?.find(s => s.id === selectedTask.status_id)
      form.setValue("task_title", selectedTask.task_title)
      form.setValue("description", selectedTask.description)
      form.setValue("task_type", selectedTask.task_type)
      form.setValue("task_priority", selectedTask.task_priority)
      form.setValue("story_points", selectedTask.story_points)
      form.setValue("status_id", status?.name)
    }
  }, [selectedTask])

  const error = form.formState.errors

  function taskSubmit(data: any) {
    if (!selectedTask) {
      if (!data.status_id) {
        data.status_id = backlogStatus?.id
      }
      handleCreateTask(data)
    } else {
      if (!statuses?.find(s => s.id === data.status_id)) {
        data.status_id = selectedTask.status_id
      }
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
          setSelectedTask(task.data)
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
          setSelectedTask(updatedTask?.data)
          toast({
            title: "Task Updated successfully"
          })
        }
      }
    } catch {
      toast({
        title: "Unable to Update Task",
        variant: "destructive"
      })
    }
  }


  function IssueTypeIcon({ type }: { type: string }) {
    switch (type) {
      case "bug":
        return <Bug className="h-5 w-5 text-red-500" />
      case "task":
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />
      case "story":
        return <Lightbulb className="h-5 w-5 text-green-500" />
      case "epic":
        return <Rocket className="h-5 w-5 text-purple-500" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  function PriorityIcon({ priority }: { priority: string }) {
    switch (priority) {
      case "highest":
        return <Flag className="h-4 w-4 text-red-600" />
      case "high":
        return <Flag className="h-4 w-4 text-orange-500" />
      case "medium":
        return <Flag className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Flag className="h-4 w-4 text-blue-500" />
      case "lowest":
        return <Flag className="h-4 w-4 text-gray-500" />
      default:
        return <Flag className="h-4 w-4 text-yellow-500" />
    }
  }

  function StatusIcon({ status }: { status: string }) {
    switch (status) {
      case "backlog":
        return <div className="h-3 w-3 rounded-full bg-gray-500" />
      case "todo":
        return <div className="h-3 w-3 rounded-full bg-blue-500" />
      case "in-progress":
        return <div className="h-3 w-3 rounded-full bg-yellow-500" />
      case "in-review":
        return <div className="h-3 w-3 rounded-full bg-purple-500" />
      case "done":
        return <div className="h-3 w-3 rounded-full bg-green-500" />
      case "blocked":
        return <div className="h-3 w-3 rounded-full bg-red-500" />
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-500" />
    }
  }


  return (
    <form onSubmit={form.handleSubmit(taskSubmit)}>
      <div className="flex flex-col md:flex-row gap-2 ">
        {/* Main content area (left side) */}
        <div className="flex-1 px-2">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                {/* <IssueTypeIcon type={issueType} /> */}
                {activeField === "title" ? (
                  <Controller
                    name="task_title"
                    defaultValue=""
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="task_title"
                        {...field}
                        type="text"
                        className="col-span-3 !text-lg"
                        autoFocus
                        required
                        onBlur={() => setActiveField(null)}
                      />
                    )}
                  />
                ) : (
                  <div
                    className="border-b border-dashed border-gray-300 py-2 text-xl cursor-pointer w-full hover:bg-secondary transition delay-150 duration-300 p-2"
                    onClick={() => setActiveField("title")}
                  >
                    <div>
                      {error.task_title && (
                        <span className="text-red-500 text-sm flex items-center gap-2 mb-1">
                          <CircleAlert size={16} />
                          {String(error.task_title.message)}
                        </span>
                      )}
                    </div>
                    {(selectedTask?.task_title ?? form.watch("task_title"))
                      ? (selectedTask?.task_title ?? form.watch("task_title"))
                      : "Click to add title..."}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="pl-2">Description:</Label>
              {activeField === "description" ? (
                <Controller
                  name="description"
                  defaultValue=""
                  control={form.control}
                  render={({ field }) => (
                    <RichTextEditor {...field} value={field.value ?? ""} />
                  )}
                />
              ) : (
                <div
                  className="border-b border-dashed border-gray-300 py-2  cursor-pointer w-full hover:bg-secondary transition delay-150 duration-300 p-2"
                  onClick={() => setActiveField("description")
                  }>

                  {(selectedTask?.description ?? form.watch("description")) ? (
                    <div dangerouslySetInnerHTML={{ __html: selectedTask?.description ?? form.watch("description") }} />
                  ) : (
                    "Click to add description..."
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (right side) */}
        <div className="w-auto md:w-56">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-end gap-4 mb-2">
                <Button
                  loading={createTaskLoading || updateTaskLoading}
                  variant={"outline"}
                  className="w-full">
                  {selectedTask ? "Update Task" : "Create task"}
                </Button>
              </div>
              <div className="space-y-6">

                <div className="space-y-2">
                  <Label>Status</Label>
                  {activeField === "status" ? (
                    <Controller
                      name="status_id"
                      defaultValue={backlogStatus?.id}
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={selectedTask?.status_id ? selectedTask?.status_id : backlogStatus?.id}>
                          <SelectTrigger id="status_id" className="col-span-3">
                            <SelectValue placeholder={statuses?.find(s => s.id === (selectedTask?.status_id ?? form.watch("status_id")))?.name || "Select type"} />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses?.map(s => (
                              s.id && <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : (
                    <div
                      className="border-b border-dashed border-gray-300 py-2 cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setActiveField("status");
                        requestAnimationFrame(() => {
                          document.getElementById("status_id")?.click();
                        });
                      }}
                    >
                      <div>
                        {error.status_id && (
                          <span className="text-red-500 text-sm flex items-center gap-2">
                            <CircleAlert size={16} />
                            {String(error.status_id.message)}
                          </span>
                        )}
                      </div>

                      <StatusIcon status={statuses?.find((s) => s.id === selectedTask?.id)?.name || ""} />
                      <span>
                        {
                          (statuses?.find(s => s.id === (selectedTask?.status_id ?? form.watch("status_id")))?.name) ||
                          backlogStatus?.name
                        }
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Issue Type</Label>

                  {activeField === "issueType" ?
                    (
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
                    ) : (
                      <>
                        <div>
                          {error.task_type && (
                            <span className="text-red-500 text-sm flex items-center gap-2">
                              <CircleAlert size={16} />
                              {String(error.task_type.message)}
                            </span>
                          )}
                        </div>

                        <div
                          className="border-b border-dashed border-gray-300 py-2 cursor-pointer flex items-center gap-2"
                          onClick={() => {
                            setActiveField("issueType");
                            requestAnimationFrame(() => {
                              document.getElementById("task_type")?.click();
                            });
                          }}

                        >
                          <IssueTypeIcon type={selectedTask?.task_type || form.watch("task_type")} />
                          <span>
                            {(selectedTask?.task_type ?? form.watch("task_type") ? ToUpperCase(selectedTask?.task_type ?? form.watch("task_type")) : "Select Type")}
                          </span>
                        </div>
                      </>
                    )}
                </div>

                <div className="space-y-2">
                  <Label>Story Points</Label>
                  {activeField === "points" ? (
                    <Controller
                      name="story_points"
                      defaultValue=""
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="story_points"
                          type='number'
                          placeholder="Select Points"
                          {...field}
                          className="col-span-3"
                        />
                      )}
                    />
                  ) : (
                    <div
                      className="border-b border-dashed border-gray-300 py-2 cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setActiveField("points");
                        requestAnimationFrame(() => {
                          document.getElementById("story_points")?.focus();
                        });
                      }}

                    >

                      <div>
                        {error.story_points && (
                          <span className="text-red-500 text-sm flex items-center gap-2">
                            <CircleAlert size={16} />
                            {String(error.story_points.message)}
                          </span>
                        )}
                      </div>
                      <BarChart2 className="h-4 w-4 text-gray-500" />
                      <span>{selectedTask?.story_points
                        || form.watch("story_points")
                        || "Select Points"}</span>
                    </div>
                  )}
                </div>


                <div className="space-y-2">
                  <Label>Priority</Label>
                  {activeField === "priority" ? (
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
                  ) : (
                    <>
                      <div>
                        {error.task_priority && (
                          <span className="text-red-500 text-sm flex items-center gap-2">
                            <CircleAlert size={16} />
                            {String(error.task_priority.message)}
                          </span>
                        )}
                      </div>

                      <div
                        className="border-b border-dashed border-gray-300 py-2 cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          setActiveField("priority");
                          requestAnimationFrame(() => {
                            document.getElementById("task_priority")?.click();
                          });
                        }}

                      >
                        <PriorityIcon priority={selectedTask?.task_priority || form.watch("task_priority")} />
                        <span>
                          {
                            (selectedTask?.task_priority ?? form.watch("task_priority")
                              ? ToUpperCase(selectedTask?.task_priority ?? form.watch("task_priority"))
                              : "Select Priority")
                          }
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* <div className="space-y-2">
                  <Label>Assignee</Label>
                  {activeField === "assignee" ? (
                    <Select
                      value={assignee?.toString() || ""}
                      onValueChange={(value) => {
                        setAssignee(value === "unassigned" ? null : Number.parseInt(value))
                        setActiveField(null)
                      }}
                      onOpenChange={(open) => {
                        if (!open) setActiveField(null)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback>{user.initials}</AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div
                      className="border-b border-dashed border-gray-300 py-2 cursor-pointer flex items-center gap-2"
                      onClick={() => setActiveField("assignee")}
                    >
                      {assignee ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={users.find((u) => u.id === assignee)?.avatar || "/placeholder.svg"}
                              alt={users.find((u) => u.id === assignee)?.name || "User"}
                            />
                            <AvatarFallback>{users.find((u) => u.id === assignee)?.initials || "??"}</AvatarFallback>
                          </Avatar>
                          <span>{users.find((u) => u.id === assignee)?.name}</span>
                        </>
                      ) : (
                        "Unassigned"
                      )}
                    </div>
                  )}
                </div> */}

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form >
  )
}




