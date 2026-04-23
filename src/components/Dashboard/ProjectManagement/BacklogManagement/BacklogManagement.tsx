"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { Plus, Search, ArrowUpDown } from "lucide-react"
import BacklogItemsCard from "./BacklogItemsCard"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { useParams } from "next/navigation"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { projectStore } from "@/src/store/project/projectStore"
import { taskStore } from "@/src/store/tasks/taskStore"
import StatusRequiredDialog from "../StatusRequiredDialog"
import { TaskModal } from "../Task/components/TaskModal"
import { SelectTask } from "@/src/db/schema"
import { TaskFiltersType } from "../types/taskFilters.type"
import TaskFilters from "../TaskFilter/TaskFilters"
import TaskMoveDialog from "../Task/components/task-move-dialog"
import ConfirmationDialog from "../Task/components/ConfirmationDialog"
import { TaskType } from "../constants/projectManagment"

export function BacklogManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchedItem, setSearchedItem] = useState("")
  const [orderList, setOrderList] = useState("asc")
  const [limit, setLimit] = useState(10)
  const projectStatusList = useAtomValue(projectStore.projectStatusList)
  const [openDialog, setOpenDialog] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useAtom(
    taskStore.isTaskModalOpen
  )
  const [selectedTask, setSelectedTask] = useAtom(taskStore.selectedTask)
  const [tasks, setTasks] = useAtom(taskStore.BackLogTasks)
  const [appliedFilters, setAppliedFilters] = useState<TaskFiltersType | null>(
    null
  )
  const [isTaskMoveDialogOpen, setIsTaskMoveDialogOpen] = useAtom(
    taskStore.isTaskMoveDialogOpen
  )
  const [isConfirmationAlertOpen, setIsConfirmationAlertOpen] = useAtom(
    taskStore.isConfirmationAlertOpen
  )
  const taskMoveDialogAction = useAtomValue(taskStore.taskMoveDialogAction)
  const [isInitailDataLoad, setIsInitailDataLoad] = useState(false)
  const isInitialRender = useRef(true)

  const params = useParams()

  function handleSearch() {
    setSearchedItem(searchQuery)
  }

  // PERMISSIONS INITATE
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    params.id as string
  )
  const canCreateTask = permissionChecker
    ? permissionChecker?.canAccess("project.backlog.task.create")
    : false

  useEffect(() => {
    if (projectStatusList.length === 0) {
      setOpenDialog(true)
    }
  }, [projectStatusList])

  useEffect(() => {
    if (!isTaskMoveDialogOpen) {
      setSelectedTask(null)
    }
  }, [isTaskMoveDialogOpen])

  useEffect(() => {
    if (tasks.length > 0) {
      setIsInitailDataLoad(true)
    }
  }, [tasks])

  function handleFilters(filters: TaskFiltersType) {
    setAppliedFilters(filters)
    setSearchedItem(searchQuery)
  }
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    if (searchQuery === "") {
      handleSearch()
    }
  }, [searchQuery])

  if (!params.id) {
    return null
  }

  if (projectStatusList.length === 0) {
    return <StatusRequiredDialog openDialog={openDialog} />
  }

  return (
    <>
      <TaskModal
        isReady={isInitailDataLoad}
        isTaskModelOpen={isTaskModalOpen}
        setIsTaskModelOpen={setIsTaskModalOpen}
        selectedTask={selectedTask || undefined}
        onCreateComplete={(task: SelectTask) => {
          setTasks((prev) => [...prev, task])
          setSelectedTask(task)
        }}
        onUpdateComplete={(task: SelectTask) => {
          setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
          setSelectedTask(task)
        }}
        onSubTaskCreate={(task: SelectTask) => {
          if (task.task_type === TaskType.SUBTASK) return
          setTasks((prev) => [...prev, task])
        }}
      />

      <TaskMoveDialog
        isTaskMoveDialogOpen={isTaskMoveDialogOpen}
        setIsTaskMoveDialogOpen={setIsTaskMoveDialogOpen}
        tasks={selectedTask ? [selectedTask] : []}
        setTasks={setTasks}
        dialogAction={taskMoveDialogAction}
      />

      <ConfirmationDialog
        isAlertOpen={isConfirmationAlertOpen}
        setIsAlertDialogOpen={setIsConfirmationAlertOpen}
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold">Backlog</h2>
          {canCreateTask && (
            <Button
              className="w-full sm:w-auto"
              onClick={() => setIsTaskModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4">
          <div className="relative w-full xl:w-80 flex shrink-0">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-8 rounded-r-none w-full"
            />
            <Button
              className="rounded-l-none"
              variant={"secondary"}
              onClick={handleSearch}
            >
              <Search />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            <div className="flex-1 sm:flex-none">
              <TaskFilters
                projectId={params.id as string}
                onApplyFilters={handleFilters}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none h-9"
              onClick={() => setOrderList(orderList === "asc" ? "desc" : "asc")}
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>

            <Select
              value={String(limit)}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <SelectTrigger className="w-[80px] h-9 shrink-0">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <BacklogItemsCard
          limit={limit}
          orderList={orderList}
          searchedItem={searchedItem}
          filters={appliedFilters}
        />
      </div>
    </>
  )
}
