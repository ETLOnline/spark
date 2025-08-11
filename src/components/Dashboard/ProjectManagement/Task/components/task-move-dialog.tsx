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
import { GetSprintAction } from "@/src/server-actions/Sprint/sprint"
import Loader from "@/src/components/common/Loader/Loader"
import { UpdateTaskAction } from "@/src/server-actions/Tasks/Task"
import { useAtom, useSetAtom } from "jotai"
import { taskStore } from "@/src/store/tasks/taskStore"
import { toast } from "@/src/hooks/use-toast"
import { sprintStore } from "@/src/store/sprint/sprintsStore"

interface Props {
  isTaskMoveDialogOpen: boolean
  setIsTaskMoveDialogOpen: Dispatch<SetStateAction<boolean>>
  task_id: string
  currSprintId?: string
  setTasks?: Dispatch<SetStateAction<SelectTask[]>>
}

export default function TaskMoveDialog({
  isTaskMoveDialogOpen,
  setIsTaskMoveDialogOpen,
  task_id,
  currSprintId,
  setTasks
}: Props) {
  const [selectedSprint, setSelectedSprint] = useState("")
  const [sprintList, setSprintList] = useAtom(sprintStore.sprints)
  const [getSprintLoading, , , GetSprints] = useServerAction(GetSprintAction)
  const [updateTaskloading, , , UpdateTask] = useServerAction(UpdateTaskAction)
  const setShouldRefetchTasks = useSetAtom(taskStore.shouldRefetchTasks)

  const projectId = useParams().id as string

  const filteredSprints = sprintList.filter((s) => s.id !== currSprintId)

  useEffect(() => {
    const fetchSprints = async () => {
      const Sprints = await GetSprints(projectId)
      if (Sprints?.success && Sprints.data) {
        setSprintList(Sprints.data)
      }
    }
    fetchSprints()
  }, [projectId])

  const handleMoveTask = async () => {
    if (selectedSprint) {
      const updatedTask = await UpdateTask(task_id, {
        sprint_id: selectedSprint
      })
      if (updatedTask?.success && updatedTask.data) {
        if (setTasks) {
          setTasks((prevTask) =>
            prevTask.filter((task) => task.id !== updatedTask?.data?.id)
          )
        }
        setShouldRefetchTasks(true)
        toast({
          title: `Task successfully moved to ${sprintList.find((s) => s.id === selectedSprint)?.title}`,
          duration: 2000
        })
      }
    }
  }

  return (
    <Dialog
      open={isTaskMoveDialogOpen}
      onOpenChange={(open) => setIsTaskMoveDialogOpen(open)}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Move Task to Sprint</DialogTitle>
          <DialogDescription>
            Select the sprint where you want to move this task.
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
          >
            Cancel
          </Button>
          <Button
            onClick={handleMoveTask}
            loading={updateTaskloading}
            disabled={!selectedSprint}
          >
            Move Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
