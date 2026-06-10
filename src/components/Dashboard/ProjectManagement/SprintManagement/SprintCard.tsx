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
import { TaskType } from "../constants/projectManagment"
import { filterTasks } from "../utils/helper"

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
      assignee: filters?.assignee,
      creator: filters?.creator,
      excludedTypes: [TaskType.SUBTASK]
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
    filters?.status,
    filters?.creator
  ])

  useEffect(() => {
    if (!sprint.id || !tasks?.length) return

    const filtered = filterTasks(tasks, sprint.id, filters)

    setFilteredTasks(filtered)
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
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* Left Side: Title & Info */}
            <div className="flex justify-between items-start xl:items-center gap-4 w-full xl:w-auto">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-lg font-bold">
                    {sprint.title}
                  </CardTitle>
                  <Badge>{ToUpperCase(sprint.sprint_status || "")}</Badge>
                </div>
                <CardDescription className="text-sm">
                  {`${moment(sprint.start_date).format("L")} - ${moment(sprint.end_date).format("L")}`}
                </CardDescription>
              </div>

              {/* Mobile Context Menu (Visible only on small screens) */}
              <div className="block xl:hidden shrink-0 mt-1">
                <SprintContextMenu
                  sprintTasks={filteredTasks}
                  sprint={sprint}
                  isSprintContextMenuOpen={isSprintContextMenuOpen}
                  setIsSprintContextMenuOpen={setIsSprintContextMenuOpen}
                  isSprintCompleted={isSprintCompleted}
                />
              </div>
            </div>

            {/* Right Side: Actions & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
              <div className="w-full sm:w-auto flex-1 sm:flex-none">
                <TaskFilters
                  projectId={projectId}
                  onApplyFilters={HandleTaskFilters}
                />
              </div>

              {canCreateTask && !isSprintCompleted && (
                <Button
                  variant={"outline"}
                  className="w-full sm:w-auto shrink-0"
                  onClick={() => {
                    setIsTaskModalOpen?.(true)
                    setSprintId?.(sprint.id ?? "")
                  }}
                >
                  Add Task
                </Button>
              )}

              {/* Desktop Context Menu */}
              <div className="hidden xl:block shrink-0">
                <SprintContextMenu
                  sprintTasks={filteredTasks}
                  sprint={sprint}
                  isSprintContextMenuOpen={isSprintContextMenuOpen}
                  setIsSprintContextMenuOpen={setIsSprintContextMenuOpen}
                  isSprintCompleted={isSprintCompleted}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Simple Task List */}

          <div className="grid grid-cols-1">
            <div className="hidden md:grid md:grid-cols-12 p-4 border-t text-sm font-medium bg-muted/50">
              <div className="col-span-1 truncate" title="Type">
                Type
              </div>
              <div className="col-span-1 text-left truncate" title="ID">
                ID
              </div>
              <div className="col-span-3 text-left truncate" title="Title">
                Title
              </div>
              <div className="col-span-1 text-center truncate" title="Parent">
                Parent
              </div>
              <div className="col-span-2 text-center truncate" title="Status">
                Status
              </div>
              <div className="col-span-1 text-center truncate" title="Priority">
                Priority
              </div>
              <div className="col-span-1 text-center truncate" title="Points">
                Points
              </div>
              <div className="col-span-1 text-center truncate" title="Assignee">
                Assignee
              </div>
              <div className="col-span-1 text-center truncate" title="Action">
                Action
              </div>
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
                <span className="text-muted-foreground text-sm">
                  No tasks assigned to this sprint.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
