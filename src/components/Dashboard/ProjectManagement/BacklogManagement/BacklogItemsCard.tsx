import React, { useEffect, useState } from "react"
import BacklogItems from "./BacklogItems"
import { useAtom, useAtomValue } from "jotai"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useParams, useSearchParams } from "next/navigation"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import PaginationComponent from "@/src/components/common/Pagination"
import { taskStore } from "@/src/store/tasks/taskStore"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { GetBacklogTasksAction } from "@/src/server-actions/Tasks/Task"
import { TaskFiltersType } from "../types/taskFilters.type"
import { SelectTask } from "@/src/db/schema"
import { userStore } from "@/src/store/user/userStore"
import { projectStore } from "@/src/store/project/projectStore"
import { TaskType } from "../constants/projectManagment"

interface Props {
  searchedItem: string
  orderList: string
  limit: number
  filters: TaskFiltersType | null
}

function BacklogItemsCard({ searchedItem, orderList, limit, filters }: Props) {
  const [tasks, setTasks] = useAtom(taskStore.BackLogTasks)
  const [Pagination, setPagination] = useState<PaginationType>()
  const [tasksLoading, tasksData, tasksError, GetTasks] = useServerAction(
    GetBacklogTasksAction
  )
  const pusherChannel = useAtomValue(projectStore.pusherChannel)
  const authUser = useAtomValue(userStore.AuthUser)
  const [searchParamsPage, setSearchParamsPage] = useState<string | null>(null)

  const projectId = useParams().id as string
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("page")) {
      setSearchParamsPage(searchParams.get("page"))
    }
  }, [searchParams])

  const fatchTasks = async () => {
    const page = parseInt(searchParams.get("page") || "1", 10)
    const res = await GetTasks({
      project_id: projectId,
      page: page ? page : 1,
      limit: limit,
      searchedItem,
      orderList,
      assignee: filters?.assignee,
      creator: filters?.creator,
      priority: filters?.priority,
      type: filters?.type,
      status: filters?.status,
      excludedTypes: [TaskType.SUBTASK]
    })
    if (res?.success && res.data) {
      const tasks = res?.data
      setTasks(tasks?.tasks)
      setPagination(tasks.pagination)
    }
  }

  useEffect(() => {
    if (searchedItem || orderList) fatchTasks()
  }, [searchedItem, orderList, searchParamsPage, limit])

  useEffect(() => {
    if (filters) fatchTasks()
  }, [
    filters?.assignee,
    filters?.priority,
    filters?.type,
    filters?.status,
    filters?.creator
  ])

  useEffect(() => {
    if (!pusherChannel || !authUser) return

    pusherChannel.bind("task-add", (task: SelectTask) => {
      if (authUser?.unique_id === task.created_by) return
      setTasks((prev) => [...prev, task])
    })

    pusherChannel.bind("task-update", (updatedTask: SelectTask) => {
      if (authUser?.unique_id === updatedTask.assign_by) return
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      )
    })

    pusherChannel.bind("task-delete", (deletedTask: SelectTask) => {
      if (authUser?.unique_id === deletedTask.assign_by) return
      setTasks((prev) => prev.filter((t) => t.id !== deletedTask.id))
    })

    return () => {
      pusherChannel.unbind_all()
    }
  }, [pusherChannel, authUser?.unique_id])

  // PERMISSIONS INITATE
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    projectId
  )
  const canView = permissionChecker
    ? permissionChecker?.canAccess("project.backlog.task.view")
    : false

  return (
    <>
      <h2 className="font-semibold leading-none tracking-tight">
        Backlog Items
      </h2>
      <p className="text-sm text-muted-foreground !mt-2">
        Manage your project backlog items
      </p>
      <div className="w-full overflow-x-auto">
        <div className="rounded-md border">
          <div className="grid grid-cols-12 gap-3 p-4 bg-muted/50 text-sm font-medium">
            <div className="col-span-1">Type</div>
            <div className="col-span-1 text-left">ID</div>
            <div className="col-span-3 text-left">Title</div>
            <div className="col-span-1 text-center">Parent</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-center">Priority</div>
            <div className="col-span-1 text-center">Points</div>
            <div className="col-span-1 text-center">Assignee</div>
            <div className="col-span-1 text-center">Option</div>
          </div>
          {tasksLoading ? (
            <div className="flex justify-center h-full w-full my-4">
              <Loader size={LoaderSizes.lg} />
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground my-4">
              No backlog items found
            </div>
          ) : (
            <div className="pb-2">
              {tasks &&
                canView &&
                tasks.map(
                  (task) =>
                    task.sprint_id === null && (
                      <BacklogItems key={task.id} task={task} />
                    )
                )}
              {Pagination && canView && (
                <PaginationComponent pagination={Pagination} />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default BacklogItemsCard
