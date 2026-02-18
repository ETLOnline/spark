"use client"

import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { useParams } from "next/navigation"
import { SelectTask } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  DeleteSprintAction,
  GetSprintAction,
  UpdateSprintAction
} from "@/src/server-actions/Sprint/sprint"
import Loader from "@/src/components/common/Loader/Loader"
import {
  GetTaskByIdsAction,
  UpdateTaskAction,
  UpdateTasksSprintAction
} from "@/src/server-actions/Tasks/Task"
import { useAtom, useSetAtom } from "jotai"
import { taskStore } from "@/src/store/tasks/taskStore"
import { toast } from "@/src/hooks/use-toast"
import { sprintStore } from "@/src/store/sprint/sprintsStore"
import { SprintStatus } from "../../constants/projectManagment"

interface Props {
  isTaskMoveDialogOpen: boolean
  setIsTaskMoveDialogOpen: Dispatch<SetStateAction<boolean>>
  tasks: SelectTask[]
  currSprintId?: string
  setTasks?: Dispatch<SetStateAction<SelectTask[]>>
  dialogAction: string
}

export default function TaskMoveDialog({
  isTaskMoveDialogOpen,
  setIsTaskMoveDialogOpen,
  tasks,
  currSprintId,
  setTasks,
  dialogAction
}: Props) {
  const [selectedSprint, setSelectedSprint] = useState("")
  const [sprintList, setSprintList] = useAtom(sprintStore.sprints)
  const [getSprintLoading, , , GetSprints] = useServerAction(GetSprintAction)
  const [updateTaskloading, , , UpdateTask] = useServerAction(
    UpdateTasksSprintAction
  )
  const [getTaskByIdsLoading, , , GetTaskById] =
    useServerAction(GetTaskByIdsAction)
  const [updateSprintLoading, , , UpdateSprint] =
    useServerAction(UpdateSprintAction)
  const [deleteSprintLoading, , , DeleteSprint] =
    useServerAction(DeleteSprintAction)

  const isLoading =
    getTaskByIdsLoading ||
    updateTaskloading ||
    updateSprintLoading ||
    deleteSprintLoading

  const setShouldRefetchTasks = useSetAtom(taskStore.shouldRefetchTasks)

  const projectId = useParams().id as string

  const filteredSprints = sprintList.filter((s) => s.id !== currSprintId)

  useEffect(() => {
    const fetchSprints = async () => {
      const Sprints = await GetSprints({
        projectId: projectId,
        status: [SprintStatus.ACTIVE, SprintStatus.UPCOMING]
      })
      if (Sprints?.success && Sprints.data) {
        setSprintList(Sprints.data.sprints)
      }
    }
    fetchSprints()
  }, [projectId])

  const handleMoveTask = async () => {
    if (isLoading) return

    const res = await GetTaskById(tasks.map((task) => task.id))
    if (!res?.success || !res.data) return

    const task_ids = res.data.flatMap((task) => [
      task.id,
      ...(task.subTasks?.map((sub) => sub.id) || [])
    ])

    if (selectedSprint) {
      const updatedTask = await UpdateTask(
        task_ids,
        selectedSprint,
        currSprintId
      )
      if (updatedTask?.success && updatedTask.data) {
        if (setTasks) {
          setTasks((prevTasks) =>
            prevTasks.map((t) => {
              const updated = updatedTask.data.find((ut) => ut?.id === t.id)
              return updated ? updated : t
            })
          )
        }
        setIsTaskMoveDialogOpen(false)
        setShouldRefetchTasks(true)
        toast({
          title: `Task successfully moved to ${sprintList.find((s) => s.id === selectedSprint)?.title}`,
          duration: 2000
        })
      }
    }
  }

  const handleEndSprint = async () => {
    if (isLoading) return
    if (!selectedSprint || !currSprintId) return

    const task_ids = tasks.flatMap((task) => [
      task.id,
      ...(task.subTasks?.map((sub) => sub.id) || [])
    ])

    const updatedTask = await UpdateTask(task_ids, selectedSprint)
    if (!updatedTask?.success || !updatedTask.data) return

    if (setTasks) {
      setTasks((prevTasks) =>
        prevTasks.map((t) => {
          const updated = updatedTask.data.find((ut) => ut?.id === t.id)
          return updated ? updated : t
        })
      )
    }

    toast({
      title: `Tasks successfully moved to ${sprintList.find((s) => s.id === selectedSprint)?.title}`,
      duration: 2000
    })

    const res = await UpdateSprint(currSprintId, { sprint_status: "closed" })
    if (res?.success && res.data) {
      setSprintList((prev) => prev.filter((s) => s.id !== res.data.id))
      setIsTaskMoveDialogOpen(false)
    }
  }

  const handleDeleteSprint = async () => {
    if (isLoading) return
    if (!selectedSprint || !currSprintId) return

    const task_ids = tasks.flatMap((task) => [
      task.id,
      ...(task.subTasks?.map((sub) => sub.id) || [])
    ])

    const updatedTask = await UpdateTask(task_ids, selectedSprint)
    if (!updatedTask?.success || !updatedTask.data) return

    if (setTasks) {
      setTasks((prevTasks) =>
        prevTasks.map((t) => {
          const updated = updatedTask.data.find((ut) => ut?.id === t.id)
          return updated ? updated : t
        })
      )
    }

    toast({
      title: `Tasks successfully moved to ${sprintList.find((s) => s.id === selectedSprint)?.title}`,
      duration: 2000
    })

    const deletedSprint = await DeleteSprint(currSprintId)

    if (deletedSprint?.success) {
      setSprintList((prev) => prev.filter((s) => s.id !== currSprintId))
      setIsTaskMoveDialogOpen(false)
    }
  }

  return (
    <Dialog
      open={isTaskMoveDialogOpen}
      onOpenChange={(open) => {
        if (isLoading) return
        setIsTaskMoveDialogOpen(open)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {dialogAction === "moveTask"
              ? "Move Task to Sprint"
              : dialogAction === "endSprint"
                ? "Move Incomplete Tasks Before Ending Sprint"
                : "Move Tasks Before Deleting Sprint"}
          </DialogTitle>
          <DialogDescription>
            {dialogAction === "moveTask"
              ? " Select the sprint where you want to move this task."
              : dialogAction === "endSprint"
                ? "Some tasks in this sprint are not yet completed. To close the sprint, move these tasks to another sprint."
                : "This sprint contains tasks. To delete it, first move these tasks to another sprint."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedSprint} onValueChange={setSelectedSprint}>
            <div className="space-y-3">
              {getSprintLoading ? (
                <div className="flex items-center justify-center">
                  <Loader />
                </div>
              ) : filteredSprints.length > 0 ? (
                filteredSprints.map((sprint) => (
                  <div key={sprint.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={sprint.id} id={sprint.id} />
                    <Label
                      htmlFor={sprint.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between p-3 border rounded-lg ">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sprint.title}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {sprint.start_date} - {sprint.end_date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground">
                  No sprints available. Please create a sprint first.
                </div>
              )}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsTaskMoveDialogOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleMoveTask}
            loading={isLoading}
            disabled={!selectedSprint || isLoading}
          >
            {dialogAction === "moveTask" ? "Move Task" : "Move Only"}
          </Button>

          {dialogAction === "endSprint" || dialogAction === "deleteSprint" ? (
            <Button
              onClick={
                dialogAction === "endSprint"
                  ? handleEndSprint
                  : handleDeleteSprint
              }
              loading={isLoading}
              disabled={!selectedSprint || isLoading}
            >
              Move Task &{" "}
              {dialogAction === "endSprint" ? "End Sprint" : "Delete Sprint"}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
