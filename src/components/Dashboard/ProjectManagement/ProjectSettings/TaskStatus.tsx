"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { AlertTriangle, ArrowBigRightDash, ArrowDown, ArrowUp, CircleHelp, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { SelectTask, SelectTaskStatus } from "@/src/db/schema"
import { CreateTaskStatusAction, DeleteTaskStatusAction, GetTaskByStatusIdAction, GetTaskSatatusAction, UpdateTaskAction, UpdateTaskStatusAction } from "@/src/server-actions/Tasks/Task"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { useParams } from "next/navigation"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { useAtom } from "jotai"
import { taskStatusesStore } from "@/src/store/taskstatuses/StatusesStore"
import { Badge } from "@/src/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import Link from "next/link"

// Default statuses that cannot be removed
const DEFAULT_STATUSES = ["Backlog", "To Do", "In Progress", "Done"];

export default function TaskStatus() {
  const [statuses, setStatuses] = useAtom(taskStatusesStore.statuses) // Default statuses as initial state
  const [newStatus, setNewStatus] = useState(""); // State to hold the new status input
  const [isSaving, setIsSaving] = useState(false); // Saving state
  const [editStatus, setEditStatus] = useState(false)
  const [removedStatus, setRemovedStatus] = useState<SelectTaskStatus[]>([])
  const [tasks, setTasks] = useState<SelectTask[]>([])
  const [isDeleteStatusModelOpen, setIsDeleteStatusModelOpen] = useState(false)
  const [newStatusId, setNewStatusId] = useState("")


  const [loading, data, error, createTaskStatus] = useServerAction(CreateTaskStatusAction);
  const [getStatusLoading, getStatusData, getStatusError, GetStatus] = useServerAction(GetTaskSatatusAction)
  const [updateStatusLoading, updateStatusData, updateStatusError, UpdateTaskStatus] = useServerAction(UpdateTaskStatusAction)
  const [tasksLoading, tasksdata, taskserror, GetTasks] = useServerAction(GetTaskByStatusIdAction)
  const [updateTaskLoading, updateTaskData, updateTaskError, UpdateTask] = useServerAction(UpdateTaskAction)


  const projectId = useParams().id as string

  useEffect(() => {
    const fetchStatuses = async () => {
      const res = await GetStatus(projectId)
      if (res?.success && res.data.length > 0) {
        const taskStatuses = res.data
        setStatuses([...taskStatuses])
        setEditStatus(true)
      } else {
        setEditStatus(false)
        setStatuses(DEFAULT_STATUSES.map((status, index) => ({
          name: status,
          project_id: projectId,
          position: index,
        })))
      }
    }
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
      fetchTasks();
      setIsDeleteStatusModelOpen(true)

    }

  }, [removedStatus])



  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStatus.trim()) {
      toast({
        title: "Error",
        description: "Status name cannot be empty",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (statuses.some((status) => status.name === newStatus.trim())) {
      toast({
        title: "Error",
        description: "Status already exists",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    // Find the index of "Done" to insert before it
    const doneIndex = statuses.findIndex((status) => status.name === "Done");
    const newStatuses = [...statuses];
    newStatuses.splice(doneIndex, 0, {
      name: newStatus.trim(),
      project_id: projectId,
      position: doneIndex,
    }); // Insert before Done

    setStatuses(newStatuses);
    setNewStatus(""); // Reset input

    toast({
      title: "Success",
      description: `Status "${newStatus.trim()}" has been added`,
      duration: 2000,
    });
  };

  // Modify the moveStatus function to prevent moving Backlog and Done
  const moveStatus = (index: number, direction: "up" | "down") => {
    const status = statuses[index];

    // Prevent moving Backlog (should always be first)
    if (status.name === "Backlog") {
      toast({
        title: "Error",
        description: "Backlog must always be the first status",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    // Prevent moving Done (should always be last)
    if (status.name === "Done") {
      toast({
        title: "Error",
        description: "Done must always be the last status",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    // Prevent moving a status before Backlog or after Done
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === statuses.length - 1) ||
      (direction === "up" && statuses[index - 1].name === "Backlog") ||
      (direction === "down" && statuses[index + 1].name === "Done")
    ) {
      return;
    }

    const newStatuses = [...statuses];
    [newStatuses[index], newStatuses[targetIndex]] = [newStatuses[targetIndex], newStatuses[index]];
    setStatuses(newStatuses);
  };

  // Remove status handler
  const handleRemoveStatus = (status: string) => {
    if (DEFAULT_STATUSES.includes(status)) {
      toast({
        title: "Error",
        description: "Default statuses cannot be removed",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    const statusRemove = statuses.find(s => s.name === status)

    if (statusRemove?.id) {
      setRemovedStatus([statusRemove as SelectTaskStatus]);

    }
  };

  // Function to save the current status configuration
  const saveStatusConfiguration = async () => {
    setIsSaving(true);

    try {
      // Simulate saving the status configuration, this would be replaced with an API call
      for (const status of statuses) {
        const payload = {
          ...status,
          position: statuses.findIndex((s) => s.name === status.name),
          project_id: projectId,
        }
        const taskStatuses = await createTaskStatus(payload);

      }


      toast({
        title: "Changes saved",
        description: "Your status configuration has been saved successfully",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save status configuration",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsSaving(false);
    }
  };


  async function handleEditStatus() {
    setIsSaving(true)
    try {
      const taskStatus = await Promise.all(
        statuses.map(async (status) => {
          if (status.id) {
            const payload = {
              ...status,
              position: statuses.findIndex(s => s.name === status.name),
              id: status.id
            }
            return await UpdateTaskStatus(payload.id, payload);
          } else {
            const payload = {
              ...status,
              position: statuses.findIndex(s => s.name === status.name),
            }
            return await createTaskStatus(payload)
          }
        }),
      )
      if (removedStatus.length > 0) {
        removedStatus.map(async (s) => {
          const deleted = await DeleteTaskStatusAction(s.id)
        })

      }

      if (tasks.length > 0) {
        for (const task of tasks) {
          const updatedTaskStatus = await UpdateTask(task.id, { ...task, status_id: newStatusId });
        }
      }


      toast({
        title: "Changes saved",
        description: "Your status configuration has been saved successfully",
        duration: 2000,
      })

    } catch {
      toast({
        title: "Error",
        description: "Failed to save status configuration",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setIsSaving(false)
    }
  }



  async function handleUpdateTaskStatus() {
    try {
      if (newStatusId) {

        setTasks(tasks.map(task => ({ ...task, status_id: newStatusId })))

        setStatuses(statuses.filter((s) => s.name !== removedStatus[0].name));

        setIsDeleteStatusModelOpen(false)
        toast({
          title: "Success",
          description: `Click save button to save the cahnges`,
          duration: 2000,
        });
      } else {
        toast({
          title: "Please reasssign the Tickets first",
          duration: 2000
        })
      }

    } catch {
      toast({
        title: "Unable to remove status",
        duration: 2000,
      })
    }
  }


  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Project Status Settings</CardTitle>
          <CardDescription>Manage the workflow statuses for your project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <Card className="border shadow-none">
              <CardHeader className="py-3">
                <CardTitle className="text-base">{editStatus ? "Edit Task Status" : "Add New Status"}</CardTitle>
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
                  Reorder or remove statuses. Default statuses cannot be removed.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md overflow-hidden border">
                  <div className="grid grid-cols-[1fr_100px] font-medium py-2 px-4 bg-muted/50 text-sm">
                    <div>Status Name</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {
                    getStatusLoading ? (
                      <div className="flex justify-center h-full w-full my-4">
                        <Loader size={LoaderSizes.lg} />
                      </div>
                    ) : (
                      statuses.length === 0 ? (
                        <div className="py-6 text-center text-muted-foreground">No statuses added yet</div>
                      ) : (
                        <div className="divide-y">
                          {statuses.map((status, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-[1fr_100px] items-center py-3 px-4 hover:bg-muted/20 transition-colors"
                            >
                              <div className="flex items-center">
                                <span className="font-medium">{status.name}</span>
                                {DEFAULT_STATUSES.includes(status.name) && (
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
                                    status.name === "Backlog" ||
                                    status.name === "Done" ||
                                    statuses[index - 1].name === "Backlog"
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
                                    status.name === "Backlog" ||
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
                                  disabled={DEFAULT_STATUSES.includes(status.name)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )
                  }
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardHeader className="py-3">
                <CardTitle className="text-base">Current Status Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        key={index}
                        className={`px-3 py-1.5 rounded-md text-sm border ${DEFAULT_STATUSES.includes(status.name)
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
          {
            editStatus ? (
              <Button onClick={handleEditStatus} disabled={isSaving} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </Button>
            ) : (
              <>
                <Link href={`/project/${projectId}/board?tab=sprints`}>
                  <Button variant={"outline"}>Go to Project</Button>
                </Link>

                <Button onClick={saveStatusConfiguration} disabled={isSaving} className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving Changes..." : "Save"}
                </Button>
              </>
            )
          }
        </CardFooter>
      </Card>


      {/* Task status reassign dialog */}

      <Dialog open={isDeleteStatusModelOpen} onOpenChange={(open) => setIsDeleteStatusModelOpen(open)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Delete Status:
              {removedStatus.length > 0 ? removedStatus[0].name : 'Unknown Status'}
            </DialogTitle>
            <DialogDescription>
              This status has {tasks.length} tickets assigned to it. Please select a new status for these
              tickets before deleting.
            </DialogDescription>
          </DialogHeader>

          {
            tasksLoading ? (
              <div className=" flex justify-center h-full w-full my-4">
                <Loader />
              </div>
            ) : (
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
                              {removedStatus.find(s => s.id === task.status_id)?.name}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Select new status for these tickets:</h3>
                    <Select value={newStatusId} onValueChange={setNewStatusId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a new status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses
                          .filter((status) => !removedStatus[0] || status.id !== removedStatus[0].id)
                          .map((status) => (
                            <SelectItem key={status.id} value={status?.id || ""}>
                              {status.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )
          }

          <DialogFooter>
            <Button variant="outline">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleUpdateTaskStatus()}>
              Reassign & Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </>
  );
}

