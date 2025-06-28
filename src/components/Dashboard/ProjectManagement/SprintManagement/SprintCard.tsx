"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import moment from "moment"
import { taskStore } from "@/src/store/tasks/taskStore"
import Loader from "@/src/components/common/Loader/Loader"
import { SelectSprint, SelectTask } from "@/src/db/schema"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { Button } from "@/src/components/ui/button"
import SprintTasks from "./SprintTasks"
import SprintContextMenu from "./SprintContextMenu"
import { SprintStatus } from "../constants/projectManagment"
import { GetSprintTasksAction } from "@/src/server-actions/Tasks/Task"
import { TaskModal } from "../Task/components/TaskModal"

interface Props {
  sprint: SelectSprint
}

export default function SprintCardPage({ sprint }: Props) {
  const [tasks, setTasks] = useState<SelectTask[]>([])
  const [isSprintContextMenuOpen, setIsSprintContextMenuOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<SelectTask | null>(null)
  const [getTaskLoading, , , GetTasks] = useServerAction(GetSprintTasksAction)

  const projectId = useParams().id as string

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await GetTasks({
        project_id: projectId,
        sprint_id: sprint.id
      })
      if (tasks?.success && tasks.data) {
        setTasks(tasks.data.tasks)
      }
    }
    fetchTasks()
  }, [projectId])

  useEffect(() => {
    if (!isTaskModalOpen) {
      setSelectedTask(null)
    }
  }, [isTaskModalOpen])

  function handleSprintStatus(sprint: SelectSprint) {
    let status
    if (moment().isBefore(moment(sprint.start_date))) {
      status = "Upcoming"
    } else if (moment().isAfter(moment(sprint.end_date))) {
      status = "Ended"
    } else {
      status = "Active"
    }
    const SprintStatuses = SprintStatus.find((s) => s.title === status)
    return SprintStatuses ? (
      <Badge
        variant={
          SprintStatuses.badgeVariants as
            | "outline"
            | "default"
            | "secondary"
            | "destructive"
            | null
            | undefined
        }
      >
        {SprintStatuses.title}
      </Badge>
    ) : null
  }

  return (
    <>
      <Card className="w-full overflow-hidden">
        <CardHeader className="bg-muted/50 rounded-t-lg p-4">
          <div className="flex items-center justify-between">
            <div className="">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg font-bold">
                  {sprint.title}
                </CardTitle>
                {handleSprintStatus(sprint)}
                <CardDescription>
                  <span>{`${moment(sprint.start_date).format("L")} - ${moment(sprint.end_date).format("L")}`}</span>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={"outline"}
                onClick={() => {
                  setIsTaskModalOpen(true)
                }}
              >
                Add Task
              </Button>

              <TaskModal
                isTaskModelOpen={isTaskModalOpen}
                setIsTaskModelOpen={setIsTaskModalOpen}
                sprintId={sprint.id ?? undefined}
                selectedTask={selectedTask ?? undefined}
                onCreateComplete={(task) => {
                  setSelectedTask(task)
                  setTasks((prevTasks) => [...prevTasks, task])
                }}
                onUpdateComplete={(task) => {
                  setSelectedTask(task)
                  setTasks((prevTasks) =>
                    prevTasks.map((t) => {
                      if (t.id === task.id) {
                        return task
                      }
                      return t
                    })
                  )
                }}
              />

              <SprintContextMenu
                sprintTasks={tasks}
                sprint={sprint}
                isSprintContextMenuOpen={isSprintContextMenuOpen}
                setIsSprintContextMenuOpen={setIsSprintContextMenuOpen}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Simple Task List */}

          <div className="grid grid-cols-1 ">
            {getTaskLoading ? (
              <div className="flex justify-center h-full w-full my-4">
                <Loader size={LoaderSizes.lg} />
              </div>
            ) : tasks.length > 0 ? (
              tasks.map((task) => (
                <SprintTasks
                  key={task.id}
                  task={task}
                  currSprint={sprint}
                  setIsTaskModelOpen={setIsTaskModalOpen}
                  setTasks={setTasks}
                  setSelectedTask={setSelectedTask}
                />
              ))
            ) : (
              <div className="flex justify-center h-full w-full my-4">
                <span className="text-muted-foreground">
                  No tasks assigned to this sprint.
                </span>
              </div>
            )}
          </div>

          {/* Progress Summary */}
          {/* <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Progress: {sprint.tasks.filter((task) => task.completed).length}/{sprint.tasks.length} completed
                  </span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(sprint.tasks.filter((task) => task.completed).length / sprint.tasks.length) * 100}%`,
                      }}
                    />
                  </div>
                </div> */}
        </CardContent>
      </Card>
    </>
  )
}
