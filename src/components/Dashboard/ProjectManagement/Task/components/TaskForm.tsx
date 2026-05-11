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
  CircleAlert,
  Flag,
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
import "@/src/components/common/Tiptap/RichEditorFormat.css"
import Tiptap from "@/src/components/common/Tiptap/TiptapRichEditor"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { MultiSelectOption } from "@/src/components/ui/multi-select"
import { useParams } from "next/navigation"
import { GetProjectUsersAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { userStore } from "@/src/store/user/userStore"
import { useAtomValue } from "jotai"
import { TaskComment } from "./task-comment"
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import AddSubTask from "./AddSubTask"
import VerificationPanel from "./VerificationPanel"
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
import UserSelector from "./UserSelector"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useDebouncedCallback } from "use-debounce"
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
  verificationStatus?: {
    status: string
    verification_id: number
    feedback: string | null
  } | null
  onVerificationStatusChange?: (newStatus: string, newFeedback: string) => void
}

const projectSchema = z.object({
  task_title: z
    .string()
    .min(1, "Required")
    .max(150, "Title is too long")
    .refine(
      (value) => value.trim().length > 0,
      "Title cannot be empty or whitespace"
    ),
  description: z.string().optional(),
  task_type: z.string().min(1, "Required"),
  task_priority: z.string().min(1, "Required"),
  story_points: z
    .union([z.number(), z.string()])
    .refine((value) => {
      const num = Number(value)
      return !isNaN(num) && num <= 100
    }, "Story points cannot be more than 100")
    .transform((value) => value.toString()),

  status_id: z.string().optional(),
  assign_to: z.string().optional(),
  assign_by: z.string().optional(),
  parent_task_id: z.string().optional(),
  tested_by: z.string().optional()
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
  setRefetchComments,
  verificationStatus,
  onVerificationStatusChange
}: Props) {
  const [activeField, setActiveField] = useState<string | null>(null)

  const [defaultUsers, setDefaultUsers] = useState<(SelectUser | null)[]>([])
  const [searchedUsers, setSearchedUsers] = useState<(SelectUser | null)[]>([])
  const [userSearch, setUserSearch] = useState("")
  const usersList = userSearch ? searchedUsers : defaultUsers
  const [assignee, setAssignee] = useState<SelectUser | null>(null)
  const [assignor, setAssignor] = useState<SelectUser | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [subTasks, setSubTasks] = useState<SelectTask[]>(
    (selectedTask?.subTasks as SelectTask[]) ?? []
  )
  const [searchParentTask, setSearchParentTask] = useState("")
  const [parentTasks, setParentTasks] = useState<SelectTask[]>([])
  const [getSubTaskTaskLoading, setGetSubTaskTaskLoading] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const authUser = useAtomValue(userStore.AuthUser)
  const [tester, setTester] = useState<SelectUser | null>(null)
  const form = useForm({
    resolver: zodResolver(projectSchema)
  })
  const errors = form.formState.errors
  const toDoStatus = statuses?.find((s) => s.name === "To Do")
  const [getUserLoading, , , GetProjectUsers] = useServerAction(
    GetProjectUsersAction
  )

  const params = useParams<{ id: string }>()
  const projectId = params?.id

  const userOptions: MultiSelectOption[] = [
    { label: "Unassigned", value: "" },
    ...usersList
      .filter((user) => user !== null)
      .map((user) => ({
        label: (user?.first_name ?? "") + " " + (user?.last_name ?? ""),
        value: user?.unique_id ?? ""
      }))
  ]

  useEffect(() => {
    if (setIsChanged) setIsChanged(form.formState.isDirty)
  }, [form.formState.isDirty])

  useEffect(() => {
    if (!projectId || !isTaskModelOpen) return

    const res = async () => {
      try {
        const res = await GetProjectUsers(projectId, 10, "")
        if (res?.success && res?.data) {
          setDefaultUsers(res.data.map((u) => u.user) ?? [])
        }
      } catch (error) {
        console.error("Error fetching project users:", error)
      }
    }

    res()
  }, [projectId, isTaskModelOpen, selectedTask?.id])

  const fetchSearchedUsers = useDebouncedCallback(async (search: string) => {
    if (!projectId || !search) return
    try {
      const res = await GetProjectUsers(projectId, 10, search)
      if (res?.success && res?.data) {
        setSearchedUsers(res.data.map((u) => u.user) ?? [])
      }
    } catch (error) {
      console.error("Error fetching searched users:", error)
    }
  }, 250)

  useEffect(() => {
    if (!userSearch) {
      fetchSearchedUsers.cancel()
      setSearchedUsers([])
      return
    }
    fetchSearchedUsers(userSearch)
  }, [userSearch])

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
        : defaultUsers.find((u) => u?.unique_id === selectedTask?.assign_to)
      const taskAssignor = selectedTask?.assignor
        ? selectedTask?.assignor
        : defaultUsers.find((u) => u?.unique_id === selectedTask?.assign_by)

      const testedBy = selectedTask?.testedBy
        ? selectedTask?.testedBy
        : defaultUsers.find((u) => u?.unique_id === selectedTask?.tested_by)

      if (taskAssignee) {
        setAssignee(taskAssignee)
        form.setValue("assign_to", taskAssignee.unique_id)
      } else {
        setAssignee(null)
        form.setValue("assign_to", "")
      }

      if (taskAssignor) {
        setAssignor(taskAssignor)
        form.setValue("assign_by", taskAssignor.unique_id)
      } else {
        // If no assignor, default to current user
        const currentUser = defaultUsers.find(
          (u) => u?.unique_id === authUser?.unique_id
        )
        if (currentUser) {
          setAssignor(currentUser)
          form.setValue("assign_by", currentUser.unique_id)
        }
      }

      if (testedBy) {
        setTester(testedBy)
        form.setValue("tested_by", testedBy.unique_id)
      }
    }

    LoadUsersFromTask()
  }, [selectedTask, defaultUsers])

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
      parent_id: selectedTask?.id
    })
    if (res.success && res.data) {
      setSubTasks(res.data.tasks)
    }
    setGetSubTaskTaskLoading(false)
  }

  useEffect(() => {
    if (selectedTask?.subTasks) {
      setSubTasks(selectedTask.subTasks as SelectTask[])
    }
  }, [selectedTask?.id])

  const findUser = (val: string) =>
    defaultUsers.find((u) => u?.unique_id === val) ||
    searchedUsers.find((u) => u?.unique_id === val) ||
    null

  const handleAssigneeChange = (val: string, field: any) => {
    field.onChange(val)
    setAssignee(findUser(val))
    setActiveField(null)
  }

  const handleAssignorChange = (val: string, field: any) => {
    field.onChange(val)
    setAssignor(findUser(val))
    setActiveField(null)
  }

  const handleTesterChange = (val: string, field: any) => {
    field.onChange(val)
    setTester(findUser(val))
    setActiveField(null)
  }

  const isEditable = isAllowedAction && !isSprintCompleted

  const handleOnBlur = () => {
    setUserSearch("")
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        {/* Main content area (left side) */}
        <ScrollArea className="h-auto lg:h-[80vh] col-span-1 lg:col-span-9 w-full">
          <div className="px-2 sm:px-4">
            <div className="space-y-6">
              {/* Task title */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Controller
                    name="task_title"
                    defaultValue=""
                    control={form.control}
                    render={({ field }) => {
                      const isContainSpace = field.value.includes(" ")

                      return activeField === "title" ? (
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
                          className="border-b border-dashed border-gray-300 py-2 text-lg sm:text-xl cursor-pointer w-full hover:bg-secondary transition delay-150 duration-300 p-2 break-words"
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

                          <span
                            className={`${isContainSpace ? "break-words" : "break-all"}`}
                          >
                            {field.value
                              ? field.value
                              : " Click to add title..."}
                          </span>
                        </div>
                      )
                    }}
                  />
                </div>
              </div>

              {/* Task description */}
              <div className="space-y-2">
                <Label className="pl-2 text-lg sm:text-xl font-semibold">
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
                        entity="tasks"
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

              {/* Mobile/Tablet submit button — shown when sidebar stacks below */}
              {isEditable && (
                <div className="lg:hidden pl-2">
                  <Button
                    type="submit"
                    form="task-form"
                    loading={loading}
                    variant={"outline"}
                    className="w-full bg-primary text-black"
                    disabled={loading}
                  >
                    {selectedTask ? "Update Task" : "Create Task"}
                  </Button>
                </div>
              )}

              {/* Subtasks */}
              <div className="space-y-2 flex flex-col pl-2">
                <Label className="text-lg sm:text-xl font-semibold">
                  Subtasks
                </Label>

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

              {/* Verification Panel — board only */}
              {verificationStatus && (
                <VerificationPanel
                  verificationStatus={verificationStatus}
                  onStatusChange={onVerificationStatusChange}
                  isAssignee={
                    !!selectedTask?.assign_to &&
                    selectedTask.assign_to === authUser?.unique_id
                  }
                />
              )}

              {/* Comments */}
              {selectedTask && (
                <div className="space-y-4 pl-2 pb-4">
                  <h2 className="text-base sm:text-lg font-semibold">
                    Comments
                  </h2>
                  <TaskComment
                    taskId={selectedTask.id}
                    isSprintCompleted={isSprintCompleted}
                    refetchComments={refetchComments}
                    setRefetchComments={setRefetchComments}
                    projectUsers={defaultUsers.filter((user) => user !== null)}
                    isOpen={isTaskModelOpen}
                  />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Sidebar (right side) */}
        <form
          id="task-form"
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault()
          }}
          className="col-span-1 lg:col-span-3 w-full"
        >
          <ScrollArea className="h-[80vh] max-h-[60vh] lg:max-h-none w-full">
            <div className="w-full lg:w-56">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-end gap-4 mb-2">
                    {isEditable && (
                      <Button
                        loading={loading}
                        variant={"outline"}
                        className="w-full bg-primary text-black"
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
                              <SelectContent className="max-h-[220px] overflow-auto">
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
                    <Controller
                      name="assign_to"
                      control={form.control}
                      render={({ field }) => (
                        <UserSelector
                          label="Select Assignee"
                          value={field.value}
                          user={assignee}
                          options={userOptions}
                          activeField={activeField}
                          fieldKey="assignTo"
                          setActiveField={setActiveField}
                          disabled={!isEditable}
                          placeholder="Unassigned"
                          onChange={(val) => handleAssigneeChange(val, field)}
                          onQueryChange={setUserSearch}
                          loading={getUserLoading}
                          handleOnBlur={handleOnBlur}
                        />
                      )}
                    />

                    {/* Assign By */}
                    <Controller
                      name="assign_by"
                      control={form.control}
                      render={({ field }) => (
                        <UserSelector
                          label="Assigned By"
                          value={field.value}
                          user={assignor}
                          options={userOptions.filter(
                            (opt) => opt.value !== ""
                          )}
                          activeField={activeField}
                          fieldKey="assignBy"
                          setActiveField={setActiveField}
                          disabled={!isEditable}
                          onChange={(val) => handleAssignorChange(val, field)}
                          onQueryChange={setUserSearch}
                          loading={getUserLoading}
                          handleOnBlur={handleOnBlur}
                        />
                      )}
                    />
                    {/* Tested By */}
                    <Controller
                      name="tested_by"
                      control={form.control}
                      render={({ field }) => (
                        <UserSelector
                          label="Tested By"
                          value={field.value}
                          user={tester}
                          options={userOptions}
                          activeField={activeField}
                          fieldKey="testedBy"
                          setActiveField={setActiveField}
                          disabled={!isEditable}
                          placeholder="Select Tester"
                          onChange={(val) => handleTesterChange(val, field)}
                          onQueryChange={setUserSearch}
                          loading={getUserLoading}
                          handleOnBlur={handleOnBlur}
                        />
                      )}
                    />

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

                    {/* Task Creator */}
                    <div className="space-y-2">
                      <Label>Creator</Label>
                      {selectedTask ? (
                        <Link
                          href={`/profile/${selectedTask?.creator?.unique_id}`}
                          target="_blank"
                          className="flex flex-row gap-2 items-center  hover:cursor-pointer"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                selectedTask?.creator?.profile_url ||
                                "/placeholder.svg"
                              }
                              alt={selectedTask?.creator?.first_name}
                            />
                            <AvatarFallback className="text-xs">
                              {selectedTask?.creator?.first_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {selectedTask?.creator?.first_name}{" "}
                            {selectedTask?.creator?.last_name}
                          </span>
                        </Link>
                      ) : (
                        <div className="flex flex-row gap-2 items-center text-muted-foreground">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>?</AvatarFallback>
                          </Avatar>
                          <span>No creator</span>
                        </div>
                      )}
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
                                <div className="flex flex-col items-center gap-2 w-full">
                                  <div
                                    className="flex items-center gap-2 rounded-md border p-2 cursor-pointer w-full overflow-hidden"
                                    onClick={() => {
                                      if (!isEditable || isTaskEpic) return
                                      setActiveField("parent")
                                      setPopoverOpen(true)
                                    }}
                                  >
                                    <IssueTypeIcon
                                      type={shownParent.task_type}
                                    />

                                    <div className="flex-1 min-w-0 overflow-hidden">
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
