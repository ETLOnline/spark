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
  const taskMoveDialogAction = useAtomValue(taskStore.taskMoveDialogAction)
  const isInitialRender = useRef(true)
  const params = useParams()
  const projectId = params.id as string

  function handleSearch() {
    setSearchedItem(searchQuery)
  }

  // PERMISSIONS INITATE
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    projectId
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
    if (!isTaskModalOpen) {
      setSelectedTask(null)
    }
  }, [isTaskModalOpen])

  useEffect(() => {
    if (!isTaskMoveDialogOpen) {
      setSelectedTask(null)
    }
  }, [isTaskMoveDialogOpen])

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

  return projectStatusList.length > 0 ? (
    <>
      <TaskModal
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
      />

      <TaskMoveDialog
        isTaskMoveDialogOpen={isTaskMoveDialogOpen}
        setIsTaskMoveDialogOpen={setIsTaskMoveDialogOpen}
        task_ids={selectedTask?.id ? [selectedTask.id] : []}
        setTasks={setTasks}
        dialogAction={taskMoveDialogAction}
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold">Backlog</h2>
          {canCreateTask && (
            <Button onClick={() => setIsTaskModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="relative w-full sm:w-64 flex">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-8 rounded-r-none"
            />
            <Button
              className="rounded-l-none"
              variant={"secondary"}
              onClick={handleSearch}
            >
              <Search />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <TaskFilters projectId={projectId} onApplyFilters={handleFilters} />

            <Button
              variant="outline"
              size="sm"
              onClick={() => setOrderList(orderList === "asc" ? "desc" : "asc")}
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>

            <Select
              value={String(limit)}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <SelectTrigger className="w-20">
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
  ) : (
    <StatusRequiredDialog openDialog={openDialog} />
  )
}
