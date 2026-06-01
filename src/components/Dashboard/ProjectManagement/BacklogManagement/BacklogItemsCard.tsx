import React, { useEffect, useState } from "react"
import BacklogItems from "./BacklogItems"
import { useAtom, useAtomValue } from "jotai"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useParams, useRouter, useSearchParams } from "next/navigation"
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
  const [previousSearchedItem, setPreviousSearchedItem] = useState<string>("")
  const [previousFilters, setPreviousFilters] =
    useState<TaskFiltersType | null>(null)

  const projectId = useParams().id as string
  const searchParams = useSearchParams()
  const router = useRouter()

  const fatchTasks = async (resetPage: boolean = false) => {
    let page = parseInt(searchParams.get("page") || "1", 10)

    if (resetPage) {
      page = 1
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", "1")
      router.replace(`?${params.toString()}`, { scroll: false })
    }

    const res = await GetTasks({
      project_id: projectId,
      page: page,
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
    if (searchedItem !== previousSearchedItem) {
      setPreviousSearchedItem(searchedItem)
      fatchTasks(true)
    }
  }, [searchedItem])

  useEffect(() => {
    const filtersChanged =
      filters?.assignee !== previousFilters?.assignee ||
      filters?.creator !== previousFilters?.creator ||
      filters?.priority !== previousFilters?.priority ||
      filters?.type !== previousFilters?.type ||
      filters?.status !== previousFilters?.status

    if (filtersChanged && filters !== null) {
      setPreviousFilters(filters)
      fatchTasks(true)
    }
  }, [filters])

  useEffect(() => {
    const page = searchParams.get("page")
    if (page || orderList || limit) {
      fatchTasks(false)
    }
  }, [searchParams.get("page"), orderList, limit])

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
      <p className="text-sm text-muted-foreground !mt-2 mb-4">
        Manage your project backlog items
      </p>
      <div className="w-full">
        <div className="rounded-md border">
          {/* Desktop Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-3 p-4 bg-muted/50 text-sm font-medium">
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
            <div className="col-span-1 text-center truncate" title="Actions">
              Actions
            </div>
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
            <div className="pb-2 divider-y">
              {tasks &&
                canView &&
                tasks.map(
                  (task) =>
                    task.sprint_id === null && (
                      <BacklogItems key={task.id} task={task} />
                    )
                )}
              {Pagination && canView && (
                <div className="mt-4 px-2">
                  <PaginationComponent pagination={Pagination} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default BacklogItemsCard
