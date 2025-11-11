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
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import moment from "moment"
import Loader from "@/src/components/common/Loader/Loader"
import { SelectSprint, SelectTask } from "@/src/db/schema"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { Button } from "@/src/components/ui/button"
import SprintTasks from "./SprintTasks"
import SprintContextMenu from "./SprintContextMenu"
import { GetSprintTasksAction } from "@/src/server-actions/Tasks/Task"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { ToUpperCase } from "@/src/utils/helpers"
import { TaskFiltersType } from "../types/taskFilters.type"
import TaskFilters from "../TaskFilter/TaskFilters"

interface Props {
  sprint: SelectSprint
  tasks: SelectTask[]
  setTasks?: Dispatch<SetStateAction<SelectTask[]>>
  setSelectedTask?: Dispatch<SetStateAction<SelectTask | null>>
  isTaskModalOpen?: boolean
  setIsTaskModalOpen?: Dispatch<SetStateAction<boolean>>
  setSprintId?: Dispatch<SetStateAction<string>>
  getTaskLoading?: boolean
  selectedTask?: SelectTask
  isSprintCompleted?: boolean
}

export default function SprintCardPage({
  sprint,
  setSprintId,
  tasks,
  setSelectedTask,

  isTaskModalOpen,
  setIsTaskModalOpen,
  setTasks,
  getTaskLoading,
  isSprintCompleted
}: Props) {
  const [filteredTasks, setFilteredTasks] = useState<SelectTask[]>([])
  const [isSprintContextMenuOpen, setIsSprintContextMenuOpen] = useState(false)
  const [getFilteredTaskLoading, , , GetTasks] =
    useServerAction(GetSprintTasksAction)
  const [filters, setFilters] = useState<TaskFiltersType | null>(null)

  const projectId = useParams().id as string

  const fetchTasks = async () => {
    if (filters === null) return
    const tasks = await GetTasks({
      project_id: projectId,
      sprint_id: sprint.id,
      priority: filters?.priority,
      type: filters?.type,
      status: filters?.status,
      assignee: filters?.assignee
    })
    if (tasks?.success && tasks.data) {
      setFilteredTasks(tasks.data.tasks)
    }
  }

  useEffect(() => {
    if (filters) {
      fetchTasks()
    }
  }, [
    projectId,
    filters?.assignee,
    filters?.priority,
    filters?.type,
    filters?.status
  ])

  useEffect(() => {
    if (!sprint.id) return

    if (filters && tasks?.length > 0) {
      const filtered = tasks.filter((t) => {
        return (
          t?.sprint_id === sprint.id &&
          (!filters.priority?.length ||
            filters.priority.includes(t.task_priority)) &&
          (!filters.type?.length || filters.type.includes(t.task_type)) &&
          (!filters.status?.length ||
            filters.status.includes(t.status_id || "")) &&
          (!filters.assignee?.length ||
            filters.assignee.includes(t.assign_to || ""))
        )
      })

      setFilteredTasks(filtered)
    } else if (tasks?.length > 0) {
      setFilteredTasks(tasks.filter((t) => t?.sprint_id === sprint.id))
    }
  }, [tasks, sprint.id, filters])

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

  function HandleTaskFilters(filters: TaskFiltersType) {
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

              {canCreateTask &&
                (!isSprintCompleted ? (
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setIsTaskModalOpen?.(true)
                      setSprintId?.(sprint.id ?? "")
                    }}
                  >
                    Add Task
                  </Button>
                ) : null)}

              <SprintContextMenu
                sprintTasks={filteredTasks}
                sprint={sprint}
                isSprintContextMenuOpen={isSprintContextMenuOpen}
                setIsSprintContextMenuOpen={setIsSprintContextMenuOpen}
                isSprintCompleted={isSprintCompleted}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Simple Task List */}

          <div className="grid grid-cols-1 ">
            <div className="grid grid-cols-12 p-4  border-t text-sm font-medium bg-muted/50">
              <div className="col-span-1">Type</div>
              <div className="col-span-1">ID</div>
              <div className="col-span-3">Title</div>
              <div className="col-span-1 text-center">Parent</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1 text-center">priority</div>
              <div className="col-span-1 text-center">Points</div>
              <div className="col-span-1 text-center">Assignee</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
            {getTaskLoading || getFilteredTaskLoading ? (
              <div className="flex justify-center h-full w-full my-4">
                <Loader size={LoaderSizes.lg} />
              </div>
            ) : filteredTasks.length > 0 ? (
              canViewTask &&
              filteredTasks.map((task) => (
                <SprintTasks
                  key={task.id}
                  task={task}
                  currSprint={sprint}
                  setIsTaskModelOpen={setIsTaskModalOpen}
                  setTasks={setTasks}
                  isSprintCompleted={isSprintCompleted}
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
