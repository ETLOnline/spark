"use client"
import type React from "react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
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
  ArrowRight,
  BarChart2,
  Boxes,
  CircleAlert,
  Flag,
  MoreHorizontal,
  Search
} from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { InsertTaskStatus, SelectTask, SelectUser } from "@/src/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ToUpperCase } from "@/src/utils/helpers"
import {
  projectDefaultStatuses,
  projectTaskPriority,
  projectTaskTypes,
  TaskType
} from "../../constants/projectManagment"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import "@/src/components/common/RichEditorFormat.css"
import Tiptap from "@/src/components/common/TiptapRichEditor"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import MultiSelect, {
  MultiSelectOption
} from "@/src/components/ui/multi-select"
import { useParams } from "next/navigation"
import { GetProjectUsersAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { userStore } from "@/src/store/user/userStore"
import { useAtomValue } from "jotai"
import { TaskComment } from "./task-comment"
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import AddSubTask from "./AddSubTask"
import "./TaskFormStyle.css"
import Link from "next/link"
import SubTask from "./SubTask"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/src/components/ui/popover"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/src/components/ui/command"
import { getChildTypes, getParentTypes } from "../utils/helper"
import { GetLinkedTasksAction } from "@/src/server-actions/Tasks/Task"
import Loader from "@/src/components/common/Loader/Loader"
interface Props {
  onSubmit: (task: any) => void
  statuses?: InsertTaskStatus[]
  isTaskModelOpen?: boolean
  selectedTask?: SelectTask
  loading?: boolean
  setIsChanged?: Dispatch<SetStateAction<boolean>>
  onSubTaskCreate?: (task: SelectTask) => void
  isSprintCompleted?: boolean
  refetchComments?: boolean
  setRefetchComments?: Dispatch<SetStateAction<boolean>>
}

const projectSchema = z.object({
  task_title: z.string().min(1, "Required").max(150, "Title is too long"),
  description: z.string().optional(),
  task_type: z.string().min(1, "Required"),
  task_priority: z.string().min(1, "Required"),
  story_points: z
    .number()
    .max(100, "Story points cannot be more than 100")
    .transform((value) => value.toString())
    .optional(),
  status_id: z.string().optional(),
  assign_to: z.string().optional(),
  assign_by: z.string().optional(),
  parent_task_id: z.string().optional()
})

export default function TaskForm({
  statuses,
  isTaskModelOpen,
  selectedTask,
  onSubmit,
  loading = false,
  setIsChanged,
  onSubTaskCreate,
  isSprintCompleted,
  refetchComments,
  setRefetchComments
}: Props) {
  const [activeField, setActiveField] = useState<string | null>(null)
  const [usersList, setUsersList] = useState<(SelectUser | null)[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState<MultiSelectOption[]>(
    []
  )
  const [selectedAssignor, setSelectedAssignor] = useState<MultiSelectOption[]>(
    []
  )
  const [assignee, setAssignee] = useState<SelectUser | null>(null)
  const [assignor, setAssignor] = useState<SelectUser | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [subTasks, setSubTasks] = useState<SelectTask[]>([])
  const [searchParentTask, setSearchParentTask] = useState("")
  const [parentTasks, setParentTasks] = useState<SelectTask[]>([])
  const [getSubTaskTaskLoading, setGetSubTaskTaskLoading] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const authUser = useAtomValue(userStore.AuthUser)
  const form = useForm({
    resolver: zodResolver(projectSchema)
  })
  const errors = form.formState.errors
  const toDoStatus = statuses?.find((s) => s.name === "To Do")

  const params = useParams<{ id: string }>()
  const projectId = params?.id

  const assigneeOptions: MultiSelectOption[] = [
    {
      label: "Unassigned",
      value: ""
    },
    ...usersList.map((user) => ({
      label: (user?.first_name ?? "") + " " + (user?.last_name ?? ""),
      value: user?.unique_id ?? ""
    }))
  ]

  const assignorOptions: MultiSelectOption[] = usersList.map((user) => ({
    label: (user?.first_name ?? "") + " " + (user?.last_name ?? ""),
    value: user?.unique_id ?? ""
  }))

  useEffect(() => {
    if (setIsChanged) setIsChanged(form.formState.isDirty)
  }, [form.formState.isDirty])

  useEffect(() => {
    const fetchProjectUsers = async () => {
      const projectUsersResult = await GetProjectUsersAction(projectId)

      if (projectUsersResult.success && projectUsersResult.data) {
        setUsersList(projectUsersResult.data.map((u) => u.user) ?? [])
      }
    }

    fetchProjectUsers()
  }, [])

  useEffect(() => {
    if (!isTaskModelOpen) {
      form.reset({
        task_title: "",
        description: "",
        task_type: "",
        task_priority: "",
        story_points: "",
        status_id: toDoStatus?.id,
        assign_to: ""
      })
      form.clearErrors()
    }
  }, [isTaskModelOpen])

  useEffect(() => {
    if (selectedTask) {
      form.setValue("task_title", selectedTask.task_title)
      form.setValue("description", selectedTask.description)
      form.setValue("task_type", selectedTask.task_type)
      form.setValue("task_priority", selectedTask.task_priority)
      form.setValue("story_points", selectedTask.story_points)
      form.setValue("status_id", selectedTask?.status_id ?? undefined)
      form.setValue("parent_task_id", selectedTask?.parent_task_id ?? undefined)
    } else {
      form.setValue("status_id", toDoStatus?.id)
    }
  }, [selectedTask])

  useEffect(() => {
    const getSelectedUsers = async () => {
      const assign_to = usersList.find(
        (u) => u?.unique_id === selectedAssignee?.[0]?.value
      )
      const assign_by = usersList.find(
        (u) => u?.unique_id === selectedAssignor?.[0]?.value
      )

      if (selectedAssignee?.[0]?.value === "") {
        setAssignee(null)
        form.setValue("assign_to", "")
      } else if (assign_to) {
        setAssignee(assign_to)
        form.setValue("assign_to", assign_to.unique_id)
      }

      if (selectedAssignor?.[0]?.value === "") {
        setAssignor(null)
        form.setValue("assign_by", "")
      } else if (assign_by) {
        setAssignor(assign_by)
        form.setValue("assign_by", assign_by.unique_id)
      }
    }

    getSelectedUsers()
  }, [selectedAssignee, selectedAssignor])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // find the closest wrapper from the clicked element
      const wrapper = target.closest(
        ".tiptap-image-wrapper"
      ) as HTMLElement | null

      if (wrapper) {
        const img = wrapper.querySelector("img")
        if (img) {
          const src = img.getAttribute("src")
          if (src) {
            setPreviewImage(src)
          }
        }
      }
    }

    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick)
    }
  }, [form.watch("description")])

  useEffect(() => {
    if (!previewImage) return

    setIsPreviewDialogOpen(true)
  }, [previewImage])

  useEffect(() => {
    if (!isPreviewDialogOpen) setPreviewImage(null)
  }, [isPreviewDialogOpen])

  useEffect(() => {
    const LoadUsersFromTask = async () => {
      const taskAssignee = selectedTask?.assignee
        ? selectedTask?.assignee
        : usersList.find((u) => u?.unique_id === selectedTask?.assign_to)
      const taskAssignor = selectedTask?.assignor
        ? selectedTask?.assignor
        : usersList.find((u) => u?.unique_id === selectedTask?.assign_by)

      if (taskAssignee) {
        setAssignee(taskAssignee)
        setSelectedAssignee([
          {
            label: `${taskAssignee.first_name} ${taskAssignee.last_name}`,
            value: taskAssignee.unique_id
          }
        ])
        form.setValue("assign_to", taskAssignee.unique_id)
      } else {
        setAssignee(null)
        setSelectedAssignee([
          {
            label: "Unassigned",
            value: ""
          }
        ])
        form.setValue("assign_to", "")
      }

      if (taskAssignor) {
        setAssignor(taskAssignor)
        setSelectedAssignor([
          {
            label: `${taskAssignor.first_name} ${taskAssignor.last_name}`,
            value: taskAssignor.unique_id
          }
        ])
        form.setValue("assign_by", taskAssignor.unique_id)
      } else {
        // If no assignor, default to current user
        const currentUser = usersList.find(
          (u) => u?.unique_id === authUser?.unique_id
        )
        if (currentUser) {
          setAssignor(currentUser)
          setSelectedAssignor([
            {
              label: `${currentUser.first_name} ${currentUser.last_name}`,
              value: currentUser.unique_id
            }
          ])
          form.setValue("assign_by", currentUser.unique_id)
        }
      }
    }

    LoadUsersFromTask()
  }, [selectedTask])

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

  // PERMISSIONS INITATE
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    projectId
  )
  const canCreateTaskBacklog = permissionChecker
    ? permissionChecker?.canAccess("project.backlog.task.create")
    : false
  const canUpdateTaskBackLog = permissionChecker
    ? permissionChecker?.canAccess("project.backlog.task.udpate")
    : false
  const canCreateTask = permissionChecker
    ? permissionChecker?.canAccess("project.task.create")
    : false
  const canUpdateTask = permissionChecker
    ? permissionChecker?.canAccess("project.task.udpate")
    : false

  const isAllowedAction =
    canCreateTaskBacklog ||
    canUpdateTaskBackLog ||
    canCreateTask ||
    canUpdateTask

  const isTaskEpic =
    selectedTask?.task_type === TaskType.EPIC ||
    form.watch("task_type") === TaskType.EPIC

  const handleSearchParent = async () => {
    const type = getParentTypes(
      selectedTask?.task_type || form.watch("task_type")
    )

    const selectedTaskSprintId = selectedTask?.sprint_id ?? undefined

    if (type.length === 0 || !searchParentTask) return

    const res = await GetLinkedTasksAction({
      project_id: projectId,
      type: type.map((t) => t.key),
      searchedItem: searchParentTask,
      sprint_id: selectedTaskSprintId
    })

    if (res.success && res.data) {
      setParentTasks(res.data.tasks)
    }
  }

  const getSubTasks = async () => {
    if (!selectedTask) return
    setGetSubTaskTaskLoading(true)
    const res = await GetLinkedTasksAction({
      project_id: projectId,
      sprint_id: selectedTask.sprint_id || undefined,
      parent_id: selectedTask?.id
    })
    if (res.success && res.data) {
      setSubTasks(res.data.tasks)
    }
    setGetSubTaskTaskLoading(false)
  }

  useEffect(() => {
    if (!selectedTask) return

    getSubTasks()
  }, [selectedTask])

  const handleChangeInAssignTo = (newselected: MultiSelectOption[]) => {
    if (newselected.length === 0) {
      setSelectedAssignee([
        {
          label: "Unassigned",
          value: ""
        }
      ])
    } else {
      const latestSelected = newselected?.[newselected.length - 1]
      setSelectedAssignee(latestSelected ? [latestSelected] : [])
    }
  }

  const isEditable = isAllowedAction && !isSprintCompleted

  return (
    <>
      <div className="grid grid-cols-12 gap-2 ">
        {/* Main content area (left side) */}
        <ScrollArea className="h-[80vh] col-span-12 md:col-span-9">
          <div className="flex-1 px-4">
            <div className="space-y-6">
              {/* Task title */}
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
                          disabled={!isEditable}
                          onBlur={() => setActiveField(null)}
                        />
                      ) : (
                        <div
                          className="border-b border-dashed border-gray-300 py-2 text-xl cursor-pointer w-full hover:bg-secondary transition delay-150 duration-300 p-2"
                          onClick={() => setActiveField("title")}
                        >
                          <div>
                            {errors.task_title && (
                              <span className="text-red-500 text-sm flex items-center gap-2 mb-1">
                                <CircleAlert size={16} />
                                {String(errors.task_title.message)}
                              </span>
                            )}
                          </div>

                          <span>
                            {field.value
                              ? field.value
                              : " Click to add title..."}
                          </span>
                        </div>
                      )
                    }
                  />
                </div>
              </div>

              {/* Task description */}
              <div className="space-y-2">
                <Label className="pl-2 text-xl font-semibold">
                  Description
                </Label>

                <Controller
                  name="description"
                  defaultValue=""
                  control={form.control}
                  render={({ field }) =>
                    activeField === "description" ? (
                      <Tiptap
                        value={field.value}
                        onChange={field.onChange}
                        image_uploading={true}
                        editable={isEditable}
                        limit={2000}
                      />
                    ) : (
                      <div
                        className="rich-editor py-2  cursor-pointer w-full hover:bg-card rounded transition delay-150 duration-300 p-4"
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

              {/* Subtasks */}
              <div className="space-y-2 flex flex-col pl-2">
                <Label className="text-xl font-semibold">Subtasks</Label>

                {/* Subtask list */}
                <div className="space-y-2 border rounded-md p-2">
                  {getSubTaskTaskLoading ? (
                    <div className="flex justify-center items-center ">
                      <Loader />
                    </div>
                  ) : subTasks?.length && subTasks?.length > 0 ? (
                    subTasks
                      ?.filter((subtask) => subtask.deleted_at === null)
                      .map((subtask) => (
                        <SubTask
                          key={subtask.id}
                          subtask={subtask}
                          isAllowedAction={isEditable}
                          projectId={projectId}
                          statuses={statuses}
                          setSubTasks={setSubTasks}
                        />
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No subtasks added yet
                    </p>
                  )}
                </div>

                {/* Add Subtask Button or Input */}
                <AddSubTask
                  selectedTask={selectedTask}
                  toDoStatusId={toDoStatus?.id}
                  setSubTasks={setSubTasks}
                  isAllowedAction={isEditable}
                  onSubTaskCreate={onSubTaskCreate}
                />
              </div>

              {/* Comments */}
              {selectedTask && (
                <div className="space-y-4 pl-2">
                  <h2 className="text-lg  font-semibold">Comments</h2>
                  <TaskComment
                    taskId={selectedTask.id}
                    isSprintCompleted={isSprintCompleted}
                    refetchComments={refetchComments}
                    setRefetchComments={setRefetchComments}
                  />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Sidebar (right side) */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault()
          }}
          className="col-span-12 md:col-span-3"
        >
          <ScrollArea className="h-[80vh] ">
            <div className="w-full md:w-56">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-end gap-4 mb-2">
                    {isEditable && (
                      <Button
                        loading={loading}
                        variant={"outline"}
                        className="w-full"
                        disabled={loading}
                      >
                        {selectedTask ? "Update Task" : "Create Task"}
                      </Button>
                    )}
                  </div>

                  {/* status */}
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
                              disabled={!isEditable}
                            >
                              <SelectTrigger
                                id="status_id"
                                className="col-span-3"
                              >
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
                              className=" py-2 cursor-pointer flex items-center gap-2"
                              onClick={() => {
                                setActiveField("status")
                                requestAnimationFrame(() => {
                                  document.getElementById("status_id")?.click()
                                })
                              }}
                            >
                              <div>
                                {errors.status_id && (
                                  <span className="text-red-500 text-sm flex items-center gap-2">
                                    <CircleAlert size={16} />
                                    {String(errors.status_id.message)}
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

                    {/* Assign To */}
                    <div className="space-y-2">
                      <Label>Assign To</Label>
                      <Controller
                        name="assign_to"
                        control={form.control}
                        render={({ field }) =>
                          activeField === "assignTo" ? (
                            <MultiSelect
                              options={assigneeOptions}
                              selected={selectedAssignee}
                              disabled={!isEditable}
                              onChange={(newselected) => {
                                handleChangeInAssignTo(newselected)
                              }}
                              placeholder="Select Assignee"
                            />
                          ) : (
                            <div
                              className=" py-2 cursor-pointer flex items-center gap-2"
                              onClick={() => {
                                setActiveField("assignTo")
                                requestAnimationFrame(() => {
                                  document.getElementById("assign_to")?.click()
                                })
                              }}
                            >
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={
                                    assignee?.profile_url || "/placeholder.svg"
                                  }
                                  alt={assignee?.first_name}
                                />
                                <AvatarFallback className="text-xs">
                                  {assignee?.first_name[0]}
                                  {assignee?.last_name[0]}
                                </AvatarFallback>
                              </Avatar>

                              <span>
                                {assignee
                                  ? assignee.first_name +
                                    " " +
                                    assignee.last_name
                                  : "Unassigned"}
                              </span>
                            </div>
                          )
                        }
                      />
                    </div>

                    {/* Assign By */}
                    <div className="space-y-2">
                      <Label>Assigned By</Label>
                      <Controller
                        name="assign_by"
                        control={form.control}
                        render={({ field }) =>
                          activeField === "assignBy" ? (
                            <MultiSelect
                              options={assignorOptions}
                              selected={selectedAssignor}
                              disabled={!isEditable}
                              onChange={(newselected) => {
                                const latestSelected =
                                  newselected?.[newselected.length - 1]
                                setSelectedAssignor(
                                  latestSelected ? [latestSelected] : []
                                )
                              }}
                              placeholder="Select Assignor"
                            />
                          ) : (
                            <div
                              className=" py-2 cursor-pointer flex items-center gap-2"
                              onClick={() => {
                                setActiveField("assignBy")
                                requestAnimationFrame(() => {
                                  document.getElementById("assign_to")?.click()
                                })
                              }}
                            >
                              <Avatar className="h-5 w-5">
                                <AvatarImage
                                  src={
                                    assignor?.profile_url || "/placeholder.svg"
                                  }
                                  alt={assignor?.first_name}
                                />
                                <AvatarFallback className="text-xs">
                                  {assignor?.first_name[0]}
                                  {assignor?.last_name[0]}
                                </AvatarFallback>
                              </Avatar>

                              <span>
                                {assignor
                                  ? assignor.first_name +
                                    " " +
                                    assignor.last_name
                                  : "Select Assignor"}
                              </span>
                            </div>
                          )
                        }
                      />
                    </div>

                    {/* Priority */}
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
                              disabled={!isEditable}
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
                                {errors.task_priority && (
                                  <span className="text-red-500 text-sm flex items-center gap-2">
                                    <CircleAlert size={16} />
                                    {String(errors.task_priority.message)}
                                  </span>
                                )}
                              </div>

                              <div
                                className=" py-2 cursor-pointer flex items-center gap-2"
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

                    {/* Issue Type */}
                    <div className="space-y-2">
                      <Label>Issue Type</Label>

                      <Controller
                        name="task_type"
                        defaultValue=""
                        control={form.control}
                        render={({ field }) => {
                          const parentTask = selectedTask?.parentTask
                          const childTasks = selectedTask?.subTasks

                          const validTypes = parentTask?.task_type
                            ? getChildTypes(parentTask.task_type)
                            : childTasks?.[0]?.task_type
                              ? getParentTypes(childTasks[0].task_type)
                              : projectTaskTypes.filter(
                                  (t) => t.key !== TaskType.SUBTASK
                                )

                          return activeField === "issueType" ? (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={!isEditable}
                            >
                              <SelectTrigger
                                id="task_type"
                                className="col-span-3"
                              >
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {validTypes.map((type, index) => (
                                  <SelectItem key={index} value={type.key}>
                                    {type.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <>
                              <div>
                                {errors.task_type && (
                                  <span className="text-red-500 text-sm flex items-center gap-2">
                                    <CircleAlert size={16} />
                                    {String(errors.task_type.message)}
                                  </span>
                                )}
                              </div>

                              <div
                                className=" py-2 cursor-pointer flex items-center gap-2"
                                onClick={() => {
                                  setActiveField("issueType")
                                  requestAnimationFrame(() => {
                                    document
                                      .getElementById("task_type")
                                      ?.click()
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
                        }}
                      />
                    </div>

                    {/* Story Points */}
                    {/* Story Points */}
                    <div className="space-y-2">
                      <Label>Story Points</Label>
                      <Controller
                        name="story_points"
                        defaultValue=""
                        control={form.control}
                        render={({ field }) => (
                          <div>
                            {activeField === "points" ? (
                              <Input
                                {...field}
                                id="story_points"
                                type="number"
                                min={0}
                                disabled={!isEditable}
                                placeholder="Select Points"
                                max={100}
                                onBlur={() => setActiveField(null)}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10)
                                  field.onChange(isNaN(val) ? "" : val)
                                }}
                              />
                            ) : (
                              <div
                                className="py-2 cursor-pointer flex items-center gap-2"
                                onClick={() => setActiveField("points")}
                              >
                                <BarChart2 className="h-5 w-5 text-gray-500" />
                                <span>{field.value || "Select Points"}</span>
                              </div>
                            )}
                            {errors.story_points && (
                              <span className="text-red-500 text-sm flex items-center gap-2 mt-1">
                                <CircleAlert size={16} />
                                {String(errors.story_points.message)}
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    {/* Parent Task Selector */}
                    <div className="space-y-2">
                      <Label>Parent</Label>
                      <Controller
                        name="parent_task_id"
                        defaultValue=""
                        control={form.control}
                        render={({ field }) => {
                          const parentTask = selectedTask?.parentTask

                          const selectedParentTask = parentTasks.find(
                            (task) => task.id === field.value
                          )

                          const shownParent =
                            field.value === ""
                              ? null
                              : selectedParentTask || parentTask

                          return (
                            <>
                              {shownParent ? (
                                <div className="flex flex-col items-center gap-2">
                                  <div
                                    className="flex items-center gap-2 rounded-md border p-2 cursor-pointer"
                                    onClick={() => {
                                      if (!isEditable || isTaskEpic) return
                                      setActiveField("parent")
                                      setPopoverOpen(true)
                                    }}
                                  >
                                    <IssueTypeIcon
                                      type={shownParent.task_type}
                                    />

                                    <div className="flex-1 min-w-0">
                                      <span
                                        className="block text-sm font-medium truncate"
                                        title={`${shownParent.task_num} - ${shownParent.task_title}`}
                                      >
                                        {shownParent.task_num} -{" "}
                                        {shownParent.task_title}
                                      </span>
                                    </div>
                                  </div>

                                  <Link
                                    href={`/project/${shownParent.project_id}/task/${shownParent.id}`}
                                  >
                                    <Button
                                      type="button"
                                      size={"sm"}
                                      variant="outline"
                                      className="w-full justify-start"
                                    >
                                      Go to Parent Task
                                      <ArrowRight className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-start"
                                  disabled={!isEditable || isTaskEpic}
                                  onClick={() => {
                                    setActiveField("parent")
                                    setPopoverOpen(true)
                                  }}
                                >
                                  Select Parent Task
                                </Button>
                              )}

                              {activeField === "parent" ? (
                                <Popover
                                  open={popoverOpen}
                                  onOpenChange={setPopoverOpen}
                                >
                                  <PopoverTrigger asChild>
                                    <div />
                                  </PopoverTrigger>

                                  <PopoverContent className="w-[250px] p-0">
                                    <Command shouldFilter={false}>
                                      <div className="flex items-center p-2">
                                        <CommandInput
                                          placeholder="Search..."
                                          value={searchParentTask}
                                          onValueChange={setSearchParentTask}
                                        />
                                        <Button
                                          onClick={handleSearchParent}
                                          size="icon"
                                          variant="ghost"
                                        >
                                          <Search className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      <CommandGroup>
                                        {shownParent ? (
                                          <CommandItem
                                            onSelect={() => {
                                              field.onChange("")
                                              setActiveField(null)
                                              setPopoverOpen(false)
                                            }}
                                          >
                                            Remove Parent
                                          </CommandItem>
                                        ) : null}

                                        {parentTasks.length > 0 ? (
                                          parentTasks.map((option) => (
                                            <CommandItem
                                              key={option.id}
                                              onSelect={() => {
                                                field.onChange(option.id)
                                                setActiveField(null)
                                                setPopoverOpen(false)
                                              }}
                                            >
                                              {`${option.task_num} - ${option.task_title}`}
                                            </CommandItem>
                                          ))
                                        ) : (
                                          <CommandItem disabled>
                                            No results found.
                                          </CommandItem>
                                        )}
                                      </CommandGroup>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              ) : null}
                            </>
                          )
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </form>
      </div>

      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-auto w-full h-auto">
          <DialogTitle>Preview</DialogTitle>
          <img
            src={previewImage || "dummy.png"}
            alt="Preview Image"
            className="w-full h-full"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
