"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import {
  AlertTriangle,
  ArrowBigRightDash,
  ArrowDown,
  ArrowUp,
  CircleHelp,
  Plus,
  Save,
  Trash2
} from "lucide-react"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { SelectTask, SelectTaskStatus } from "@/src/db/schema"
import {
  CreateTaskStatusAction,
  DeleteTaskStatusAction,
  GetTasksByStatusIdAction,
  GetTaskStatusAction,
  UpdateTaskAction,
  UpdateTaskStatusAction
} from "@/src/server-actions/Tasks/Task"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/src/components/ui/table"
import { useParams } from "next/navigation"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { useAtom } from "jotai"
import { Badge } from "@/src/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import Link from "next/link"
import { projectStore } from "@/src/store/project/projectStore"
import { projectDefaultStatuses } from "../constants/projectManagment"

export default function TaskStatus() {
  const [statuses, setStatuses] = useAtom(projectStore.projectStatusList) // Default statuses as initial state
  const [newStatus, setNewStatus] = useState("") // State to hold the new status input
  const [isSaving, setIsSaving] = useState(false) // Saving state
  const [editStatus, setEditStatus] = useState(false)
  const [removedStatus, setRemovedStatus] = useState<SelectTaskStatus[]>([])
  const [tasks, setTasks] = useState<SelectTask[]>([])
  const [isDeleteStatusModelOpen, setIsDeleteStatusModelOpen] = useState(false)
  const [newStatusId, setNewStatusId] = useState("")
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] =
    useState(false)
  const [isChangesSaved, setIsChangesSaved] = useState(false)

  const [createLoading, data, error, createTaskStatus] = useServerAction(
    CreateTaskStatusAction
  )
  const [getStatusLoading, getStatusData, getStatusError, GetStatus] =
    useServerAction(GetTaskStatusAction)
  const [
    updateStatusLoading,
    updateStatusData,
    updateStatusError,
    UpdateTaskStatus
  ] = useServerAction(UpdateTaskStatusAction)
  const [tasksLoading, tasksdata, taskserror, GetTasks] = useServerAction(
    GetTasksByStatusIdAction
  )
  const [updateTaskLoading, updateTaskData, updateTaskError, UpdateTask] =
    useServerAction(UpdateTaskAction)
  const [deleteStatusLoading, deleteData, deleteError, DeleteStatus] =
    useServerAction(DeleteTaskStatusAction)

  const projectId = useParams().id as string

  useEffect(() => {
    fetchStatuses()
  }, [projectId])

  useEffect(() => {
    if (removedStatus.length > 0) {
      const fetchTasks = async () => {
        for (const status of removedStatus) {
          const getTasks = await GetTasks(status.id)

          if (getTasks?.success && getTasks.data) {
            setTasks(getTasks.data)
          }
        }
      }
      fetchTasks()
      if (!showUnsavedChangesDialog) {
        setIsDeleteStatusModelOpen(true)
      }
    }
  }, [removedStatus])

  const fetchStatuses = async () => {
    const res = await GetStatus(projectId)
    if (res?.success && res.data.length > 0) {
      const taskStatuses = res.data
      setStatuses([...taskStatuses])
      setEditStatus(true)
    } else {
      setEditStatus(false)
      setStatuses(
        projectDefaultStatuses.map((status) => ({
          name: status.name || "",
          project_id: projectId,
          position: status.position || 0
        }))
      )
    }
    setIsChangesSaved(false)
  }

  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newStatus.trim()) {
      toast({
        title: "Error",
        description: "Status name cannot be empty",
        variant: "destructive",
        duration: 2000
      })
      return
    }

    if (
      statuses.some(
        (status) => status.name.toLowerCase() === newStatus.trim().toLowerCase()
      )
    ) {
      toast({
        title: "Error",
        description: "Status already exists",
        variant: "destructive",
        duration: 2000
      })
      return
    }
    // Find the index of "Done" to insert before it
    const doneIndex = statuses.findIndex((status) => status.name === "Done")
    const newStatuses = [...statuses]
    newStatuses.splice(doneIndex, 0, {
      name: newStatus.trim(),
      project_id: projectId,
      position: doneIndex
    }) // Insert before Done

    setStatuses(newStatuses)
    setNewStatus("") // Reset input

    setIsChangesSaved(true)

    toast({
      title: "Success",
      description: `Status "${newStatus.trim()}" has been added`,
      duration: 2000
    })
  }

  // Modify the moveStatus function to prevent moving To Do and Done
  const moveStatus = (index: number, direction: "up" | "down") => {
    const status = statuses[index]

    // Prevent moving To Do (should always be first)
    if (status.name === "To Do") {
      toast({
        title: "Error",
        description: "To Do must always be the first status",
        variant: "destructive",
        duration: 2000
      })
      return
    }

    // Prevent moving Done (should always be last)
    if (status.name === "Done") {
      toast({
        title: "Error",
        description: "Done must always be the last status",
        variant: "destructive",
        duration: 2000
      })
      return
    }

    // Prevent moving a status before To Do or after Done
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === statuses.length - 1) ||
      (direction === "up" && statuses[index - 1].name === "To Do") ||
      (direction === "down" && statuses[index + 1].name === "Done")
    ) {
      return
    }

    const newStatuses = [...statuses]
    ;[newStatuses[index], newStatuses[targetIndex]] = [
      newStatuses[targetIndex],
      newStatuses[index]
    ]
    setStatuses(newStatuses)
  }

  const hasUnsavedChanges = () => {
    return statuses.some((s) => !s.id)
  }

  // Remove status handler
  const handleRemoveStatus = (status: string) => {
    if (hasUnsavedChanges()) {
      setShowUnsavedChangesDialog(true)
    }
    if (
      projectDefaultStatuses.some(
        (defaultStatus) => defaultStatus.name === status
      )
    ) {
      toast({
        title: "Error",
        description: "Default statuses cannot be removed",
        variant: "destructive",
        duration: 2000
      })
      return
    }

    if (!isChangesSaved) {
      const statusRemove = statuses.find((s) => s.name === status)
      if (statusRemove?.id) {
        setRemovedStatus([statusRemove as SelectTaskStatus])
      }
    }
  }

  // Function to save the current status configuration
  const saveStatusConfiguration = async () => {
    setIsSaving(true)
    try {
      // Simulate saving the status configuration, this would be replaced with an API call
      const res = await Promise.all(
        statuses.map(async (status) => {
          const payload = {
            ...status,
            position: statuses.findIndex((s) => s.name === status.name),
            project_id: projectId
          }
          return await createTaskStatus(payload)
        })
      )
      setStatuses(
        res
          .filter(
            (r) =>
              r &&
              r.success &&
              Array.isArray(r.data) &&
              r.data &&
              r.data.length > 0
          )
          .map((r) => (r && r.data ? r.data[0] : undefined))
          .filter((status) => status !== undefined)
      )
      toast({
        title: "Changes saved",
        description: "Your status configuration has been saved successfully",
        duration: 2000
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save status configuration",
        variant: "destructive",
        duration: 2000
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleEditStatus() {
    setIsSaving(true)
    try {
      const taskStatus = await Promise.all(
        statuses.map(async (status) => {
          if (status.id) {
            const payload = {
              ...status,
              position: statuses.findIndex((s) => s.name === status.name),
              id: status.id
            }
            await UpdateTaskStatus(payload.id, payload)
          } else {
            const payload = {
              ...status,
              position: statuses.findIndex((s) => s.name === status.name)
            }
            const AddedStatus = await createTaskStatus(payload)
            if (AddedStatus?.success && AddedStatus.data) {
              fetchStatuses()
            }
          }
        })
      )

      toast({
        title: "Changes saved",
        description: "Your status configuration has been saved successfully",
        duration: 2000
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to save status configuration",
        variant: "destructive",
        duration: 2000
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateTaskStatus() {
    try {
      if (tasks.length === 0) {
        if (removedStatus.length > 0) {
          const deleted = await Promise.all(
            removedStatus.map(async (s) => {
              return await DeleteStatus(s.id)
            })
          )
          setStatuses(statuses.filter((s) => s.name !== removedStatus[0].name))
          setIsDeleteStatusModelOpen(false)
          fetchStatuses()
          toast({
            title: "Status deleted",
            duration: 2000
          })
        }
      } else if (newStatusId) {
        for (const task of tasks) {
          const updatedTaskStatus = await UpdateTask(task.id, {
            ...task,
            status_id: newStatusId
          })
        }

        if (removedStatus.length > 0) {
          removedStatus.map(async (s) => {
            const deleted = await DeleteStatus(s.id)
          })
        }
        setStatuses(statuses.filter((s) => s.name !== removedStatus[0].name))

        setIsDeleteStatusModelOpen(false)
        fetchStatuses()
        toast({
          title: "Status deleted",
          duration: 2000
        })
      } else {
        toast({
          title: "Please reassign the task first",
          duration: 2000
        })
      }
    } catch {
      toast({
        title: "Unable to remove status",
        duration: 2000
      })
    }
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Project Status Settings</CardTitle>
          <CardDescription>
            Manage the workflow statuses for your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Card className="border shadow-none">
              <CardHeader className="py-3">
                <CardTitle className="text-base">
                  {editStatus ? "Edit Task Status" : "Add New Status"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddStatus} className="flex gap-2">
                  <Input
                    placeholder="Enter status name..."
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button type="submit" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader className="py-3">
                <CardTitle className="text-base">Manage Statuses</CardTitle>
                <CardDescription className="text-xs">
                  Reorder or remove statuses. Default statuses cannot be
                  removed.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md overflow-hidden border">
                  <div className="grid grid-cols-[1fr_100px] font-medium py-2 px-4 bg-muted/50 text-sm">
                    <div>Status Name</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {getStatusLoading ? (
                    <div className="flex justify-center h-full w-full my-4">
                      <Loader size={LoaderSizes.lg} />
                    </div>
                  ) : statuses.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                      No statuses added yet
                    </div>
                  ) : (
                    <div className="divide-y">
                      {statuses.map((status, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-[1fr_100px] items-center py-3 px-4 hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center">
                            <span className="font-medium">{status.name}</span>
                            {projectDefaultStatuses.some(
                              (defaultStatus) =>
                                defaultStatus.name === status.name
                            ) && (
                              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => moveStatus(index, "up")}
                              disabled={
                                index === 0 ||
                                status.name === "To Do" ||
                                status.name === "Done" ||
                                statuses[index - 1].name === "To Do"
                              }
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                              <span className="sr-only">Move up</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => moveStatus(index, "down")}
                              disabled={
                                index === statuses.length - 1 ||
                                status.name === "To Do" ||
                                status.name === "Done" ||
                                statuses[index + 1].name === "Done"
                              }
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                              <span className="sr-only">Move down</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleRemoveStatus(status.name)}
                              disabled={projectDefaultStatuses.some(
                                (defaultStatus) =>
                                  defaultStatus.name === status.name
                              )}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader className="py-3">
                <CardTitle className="text-base">
                  Current Status Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        key={index}
                        className={`px-3 py-1.5 rounded-md text-sm border ${
                          projectDefaultStatuses.some(
                            (defaultStatus) =>
                              defaultStatus.name === status.name
                          )
                            ? "bg-primary/5 border-primary/20"
                            : "bg-muted"
                        }`}
                      >
                        {index + 1}. {status.name}
                      </div>
                      {index !== statuses.length - 1 && (
                        <ArrowBigRightDash className="w-6 h-6 ml-2 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-2 gap-2">
          <Link href={`/project/${projectId}/board?tab=sprints`}>
            <Button variant={"outline"}>Go to Project</Button>
          </Link>
          {editStatus ? (
            <Button
              loading={createLoading || updateStatusLoading}
              onClick={handleEditStatus}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          ) : (
            <Button
              loading={createLoading}
              onClick={saveStatusConfiguration}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Task status reassign dialog */}

      <Dialog
        open={isDeleteStatusModelOpen}
        onOpenChange={(open) => setIsDeleteStatusModelOpen(open)}
      >
        {tasksLoading ? (
          <div className=" flex justify-center h-full w-full my-4">
            <Loader />
          </div>
        ) : (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Delete Status:
                {removedStatus.length > 0
                  ? removedStatus[0].name
                  : "Unknown Status"}
              </DialogTitle>
              <DialogDescription>
                This status has {tasks.length} tickets assigned to it. Please
                select a new status for these tickets before deleting.
              </DialogDescription>
            </DialogHeader>
            {tasks.length > 0 ? (
              <>
                <div className="max-h-[300px] overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Current Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>#{task.task_num}</TableCell>
                          <TableCell>{task.task_title}</TableCell>
                          <TableCell className="text-center">
                            <CircleHelp />
                          </TableCell>
                          <TableCell>
                            <Badge variant={"secondary"}>
                              {
                                removedStatus.find(
                                  (s) => s.id === task.status_id
                                )?.name
                              }
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">
                      Select new status for these tickets:
                    </h3>
                    <Select value={newStatusId} onValueChange={setNewStatusId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a new status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses
                          .filter(
                            (status) =>
                              !removedStatus[0] ||
                              status.id !== removedStatus[0].id
                          )
                          .map((status) => (
                            <SelectItem
                              key={status.id}
                              value={status?.id || ""}
                            >
                              {status.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            ) : null}

            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleUpdateTaskStatus()
                }}
                loading={deleteStatusLoading}
              >
                {tasks.length > 0 ? "Reassign & Delete" : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* UnsavedChanges Dialog */}

      <Dialog
        open={showUnsavedChangesDialog}
        onOpenChange={(open) => setShowUnsavedChangesDialog(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Unsaved Changes
            </DialogTitle>
            <DialogDescription>
              You have unsaved status changes. Please save them before removing
              or modifying statuses.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnsavedChangesDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowUnsavedChangesDialog(false)
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
