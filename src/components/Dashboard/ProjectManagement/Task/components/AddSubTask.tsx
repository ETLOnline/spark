import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { SelectTask } from "@/src/db/schema"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { CreateTaskAction } from "@/src/server-actions/Tasks/Task"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { TaskPriority } from "../../constants/projectManagment"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { getChildTypes } from "../../utils/helper"

interface Props {
  selectedTask?: SelectTask
  toDoStatusId?: string
  setSubTasks: Dispatch<SetStateAction<SelectTask[]>>
  isAllowedAction?: boolean
  onSubTaskCreate?: (task: SelectTask) => void
}

const subTaskSchema = z.object({
  task_title: z.string().min(1, "Title Required"),
  task_type: z.string().min(1, "Type Required")
})

function AddSubTask({
  selectedTask,
  toDoStatusId,
  setSubTasks,
  isAllowedAction,
  onSubTaskCreate
}: Props) {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)
  const [addSubTaskLoading, , , addSubTask] = useServerAction(CreateTaskAction)
  const authUser = useAtomValue(userStore.AuthUser)

  const subTaskForm = useForm({
    resolver: zodResolver(subTaskSchema)
  })

  const handleCreateSubTask = async (data: any) => {
    try {
      const payload = {
        ...data,
        parent_task_id: selectedTask?.id,
        project_id: selectedTask?.project_id,
        sprint_id: selectedTask?.sprint_id,
        created_by: authUser?.unique_id,
        description: "",
        task_priority: TaskPriority.MEDIUM,
        story_points: 0,
        status_id: toDoStatusId,
        assign_to: null,
        assign_by: authUser?.unique_id
      }

      const res = await addSubTask(payload)
      if (res?.success && res?.data) {
        onSubTaskCreate?.(res.data as SelectTask)

        setSubTasks((prev) => [...prev, res.data as SelectTask])

        toast({
          title: "Subtask created",
          description: "Your new subtask has been added successfully."
        })

        setIsAddingSubtask(false)
        subTaskForm.reset()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const subTaskType = getChildTypes(selectedTask?.task_type || "")

  const error = subTaskForm.formState.errors

  const canAddSubTask = subTaskType?.length > 0

  useEffect(() => {
    if (!isAddingSubtask) {
      subTaskForm.reset()
    }
  }, [isAddingSubtask])

  useEffect(() => {
    setIsAddingSubtask(false)
  }, [selectedTask])

  return (
    <form onSubmit={subTaskForm.handleSubmit(handleCreateSubTask)}>
      <div className="mt-2">
        {isAddingSubtask ? (
          <div>
            <div className="space-y-2">
              <div className="relative flex items-center">
                <Controller
                  name="task_title"
                  defaultValue=""
                  control={subTaskForm.control}
                  render={({ field }) => (
                    <Input
                      id="task_title"
                      {...field}
                      type="text"
                      placeholder="Enter subtask title"
                      className="pr-24"
                    />
                  )}
                />

                <div className="absolute right-1">
                  <Controller
                    name="task_type"
                    defaultValue=""
                    control={subTaskForm.control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-8 w-15 border-none shadow-none focus:ring-0">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {subTaskType?.map((t) => (
                            <SelectItem key={t.key} value={t.key}>
                              <div className="flex items-center">
                                <DynamicIcon
                                  name={t.icon as IconName}
                                  className="mr-2 h-4 w-4"
                                  style={{ color: t.iconColor }}
                                />
                                {t.title}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center gap-2">
                <div className="text-red-500 text-sm text-left flex flex-col gap-1">
                  <span>{error.task_title?.message}</span>
                  <span>{error.task_type?.message}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={"outline"}
                    size="sm"
                    onClick={() => setIsAddingSubtask(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" loading={addSubTaskLoading}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingSubtask(true)}
            disabled={!canAddSubTask || !isAllowedAction}
          >
            + Add Subtask
          </Button>
        )}
      </div>
    </form>
  )
}

export default AddSubTask
