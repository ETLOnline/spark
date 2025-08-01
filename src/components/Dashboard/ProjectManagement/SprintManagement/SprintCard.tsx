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
import Loader from "@/src/components/common/Loader/Loader"
import { SelectSprint, SelectTask } from "@/src/db/schema"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { Button } from "@/src/components/ui/button"
import SprintTasks from "./SprintTasks"
import SprintContextMenu from "./SprintContextMenu"
import { TaskModal } from "../Task/components/TaskModal"
import { GetSprintTasksAction } from "@/src/server-actions/Tasks/Task"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { ToUpperCase } from "@/src/utils/helpers"
import TaskFilters from "../BacklogManagement/TaskFilters"

interface Props {
  sprint: SelectSprint
}

export default function SprintCardPage({ sprint }: Props) {
  const [tasks, setTasks] = useState<SelectTask[]>([])
  const [isSprintContextMenuOpen, setIsSprintContextMenuOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<SelectTask | null>(null)
  const [getTaskLoading, , , GetTasks] = useServerAction(GetSprintTasksAction)
  const [filters, setFilters] = useState<{
    assignee?: string[]
    priority?: string[]
    type?: string[]
    status?: string[]
  }>({})

  const projectId = useParams().id as string

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await GetTasks({
        project_id: projectId,
        sprint_id: sprint.id,
        priority: filters.priority,
        type: filters.type,
        status: filters.status,
        assignee: filters.assignee
      })
      if (tasks?.success && tasks.data) {
        setTasks(tasks.data.tasks)
      }
    }
    fetchTasks()
  }, [
    projectId,
    filters.assignee,
    filters.priority,
    filters.type,
    filters.status
  ])

  useEffect(() => {
    if (!isTaskModalOpen) {
      setSelectedTask(null)
    }
  }, [isTaskModalOpen])

  // PERMISSIONS INITATE
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    projectId
  )
  const canCreateTask = permissionChecker
    ? permissionChecker?.canAccess("project.task.create")
    : false
  const canViewTask = permissionChecker
    ? permissionChecker?.canAccess("project.task.view")
    : false

  function HandleTaskFilters(filters: {
    assignee?: string[]
    priority?: string[]
    type?: string[]
    status?: string[]
  }) {
    setFilters(filters)
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
                <Badge>{ToUpperCase(sprint.sprint_status || "")}</Badge>
                <CardDescription>
                  {`${moment(sprint.start_date).format("L")} - ${moment(sprint.end_date).format("L")}`}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TaskFilters
                projectId={projectId}
                onApplyFilters={HandleTaskFilters}
              />

              {canCreateTask && (
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setIsTaskModalOpen(true)
                  }}
                >
                  Add Task
                </Button>
              )}

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
              canViewTask &&
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
