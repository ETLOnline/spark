"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import {
  AlertCircle,
  BarChart2,
  Bug,
  CheckCircle2,
  CircleAlert,
  Flag,
  Lightbulb,
  Rocket
} from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import {
  InsertTask,
  InsertTaskStatus,
  SelectTask,
  SelectTaskStatus
} from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateTaskAction,
  UpdateTaskAction
} from "@/src/server-actions/Tasks/Task"
import { projectStore } from "@/src/store/project/projectStore"
import { userStore } from "@/src/store/user/userStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom, useAtomValue } from "jotai"
import { useParams } from "next/navigation"
import { z } from "zod"
import { ToUpperCase } from "@/src/utils/helpers"
import { taskStore } from "@/src/store/tasks/taskStore"
import RichTextEditor from "@/src/components/common/rich-text-editor"
import {
  projectDefaultStatuses,
  projectTaskPriority,
  projectTaskTypes
} from "../constants/projectManagment"
import { DynamicIcon, IconName } from "lucide-react/dynamic"

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

  const [isTaskFormModelOpen, setIsTaskFormModelOpen] = useAtom(
    taskStore.isTaskFormModelOpen
  )
  const [tasks, setTasks] = useAtom(taskStore.tasks)
  const [selectedTask, setSelectedTask] = useAtom(taskStore.selectedTask)

  const authUser = useAtomValue(userStore.AuthUser)
  const [createTaskLoading, createTaskData, createTaskError, CreateTask] =
    useServerAction(CreateTaskAction)
  const [updateTaskLoading, updateTaskData, updateTaskError, UpdateTask] =
    useServerAction(UpdateTaskAction)

  const form = useForm({
    resolver: zodResolver(projectSchema)
  })

  const projectId = useParams().id as string
  const backlogStatus = statuses?.find((s) => s.name === "Backlog")

  useEffect(() => {
    if (!isTaskFormModelOpen) {
      form.reset({
        task_title: "",
        description: "",
        task_type: "",
        task_priority: "",
        story_points: "",
        status_id: backlogStatus?.id
      })
      form.clearErrors()
      setSelectedTask(null)
    }
  }, [isTaskFormModelOpen])

  useEffect(() => {
    if (selectedTask) {
      form.setValue("task_title", selectedTask.task_title)
      form.setValue("description", selectedTask.description)
      form.setValue("task_type", selectedTask.task_type)
      form.setValue("task_priority", selectedTask.task_priority)
      form.setValue("story_points", selectedTask.story_points)
      form.setValue("status_id", selectedTask?.status_id ?? undefined)
    } else {
      form.setValue("status_id", backlogStatus?.id)
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
      if (!statuses?.find((s) => s.id === data.status_id)) {
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
                ? { ...task, ...updatedTask.data }
                : task
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

  function StatusIcon({ status }: { status: string }) {
    const statusMap = projectDefaultStatuses.find((s) => s.name === status)
    return statusMap ? (
      <div
        className={`h-3 w-3 rounded-full`}
        style={{ backgroundColor: statusMap.iconColor }}
      />
    ) : (
      <div className="h-3 w-3 rounded-full bg-gray-500" />
    )
  }

  return (
    <form onSubmit={form.handleSubmit(taskSubmit)}>
      <div className="flex flex-col md:flex-row gap-2 ">
        {/* Main content area (left side) */}
        <div className="flex-1 px-2">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Controller
                  name="task_title"
                  defaultValue=""
                  control={form.control}
                  render={({ field }) =>
                    activeField === "title" ? (
                      <Input
                        id="task_title"
                        {...field}
                        type="text"
                        className="col-span-3 !text-lg"
                        autoFocus
                        required
                        onBlur={() => setActiveField(null)}
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

                        <span>
                          {field.value ? field.value : " Click to add title..."}
                        </span>
                      </div>
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="pl-2">Description:</Label>

              <Controller
                name="description"
                defaultValue=""
                control={form.control}
                render={({ field }) =>
                  activeField === "description" ? (
                    <RichTextEditor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  ) : (
                    <div
                      className="border-b border-dashed border-gray-300 py-2  cursor-pointer w-full hover:bg-secondary transition delay-150 duration-300 p-2"
                      onClick={() => setActiveField("description")}
                    >
                      {field.value ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: field.value ?? ""
                          }}
                        />
                      ) : (
                        <span>Click to add description...</span>
                      )}
                    </div>
                  )
                }
              />
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
                  className="w-full"
                >
                  {selectedTask ? "Update Task" : "Create task"}
                </Button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Status</Label>

                  <Controller
                    name="status_id"
                    control={form.control}
                    render={({ field }) => {
                      const selectedValue = statuses?.find(
                        (s) => s.id === field.value
                      )?.name

                      return activeField === "status" ? (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger id="status_id" className="col-span-3">
                            <SelectValue placeholder={"Select status"} />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses?.map(
                              (s) =>
                                s.id && (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                  </SelectItem>
                                )
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div
                          className="border-b border-dashed border-gray-300 py-2 cursor-pointer flex items-center gap-2"
                          onClick={() => {
                            setActiveField("status")
                            requestAnimationFrame(() => {
                              document.getElementById("status_id")?.click()
                            })
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

                          <StatusIcon status={selectedValue || ""} />
                          <span>{selectedValue}</span>
                        </div>
                      )
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Issue Type</Label>

                  <Controller
                    name="task_type"
                    defaultValue=""
                    control={form.control}
                    render={({ field }) =>
                      activeField === "issueType" ? (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="task_type" className="col-span-3">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {projectTaskTypes.map((type, index) => (
                              <SelectItem key={index} value={type.key}>
                                {type.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                              setActiveField("issueType")
                              requestAnimationFrame(() => {
                                document.getElementById("task_type")?.click()
                              })
                            }}
                          >
                            <IssueTypeIcon type={field.value} />
                            <span>
                              {field.value
                                ? ToUpperCase(field.value)
                                : "Select Type"}
                            </span>
                          </div>
                        </>
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Story Points</Label>
                  <Controller
                    name="story_points"
                    defaultValue=""
                    control={form.control}
                    render={({ field }) =>
                      activeField === "points" ? (
                        <Input
                          id="story_points"
                          type="number"
                          placeholder="Select Points"
                          {...field}
                          className="col-span-3"
                        />
                      ) : (
                        <div
                          className="border-b border-dashed border-gray-300 py-2 cursor-pointer flex items-center gap-2"
                          onClick={() => {
                            setActiveField("points")
                            requestAnimationFrame(() => {
                              document.getElementById("story_points")?.focus()
                            })
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
                          <BarChart2 className="h-5 w-5 text-gray-500" />
                          <span>{field.value || "Select Points"}</span>
                        </div>
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>

                  <Controller
                    name="task_priority"
                    defaultValue=""
                    control={form.control}
                    render={({ field }) =>
                      activeField === "priority" ? (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="task_priority"
                            className="col-span-3"
                          >
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {projectTaskPriority.map((priority, index) => (
                              <SelectItem key={index} value={priority.key}>
                                {priority.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                              setActiveField("priority")
                              requestAnimationFrame(() => {
                                document
                                  .getElementById("task_priority")
                                  ?.click()
                              })
                            }}
                          >
                            <PriorityIcon priority={field.value} />
                            <span>
                              {field.value
                                ? ToUpperCase(field.value)
                                : "Select Priority"}
                            </span>
                          </div>
                        </>
                      )
                    }
                  />
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
    </form>
  )
}
