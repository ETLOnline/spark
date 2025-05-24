import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Checkbox } from '@/src/components/ui/checkbox'
import React, { useEffect, useState } from 'react'
import BacklogItems from './BacklogItems'
import { useAtom } from 'jotai'
import { projectStore } from '@/src/store/project/projectStore'
import { useServerAction } from '@/src/hooks/useServerAction'
import { GetTasksAction } from '@/src/server-actions/Tasks/Task'
import { useParams, useSearchParams } from 'next/navigation'
import Loader from '@/src/components/common/Loader/Loader'
import { LoaderSizes } from '@/src/components/common/types/loader-types'
import { PaginationType } from '@/src/components/common/types/pagination.type'
import PaginationComponent from '@/src/components/common/Pagination'
import { taskStore } from '@/src/store/tasks/taskStore'


interface Props {
  backlogItems: BacklogItem[]
  searchedItem: string
  orderList: string
  limit: number
}


interface BacklogItem {
  id: string
  title: string
  description: string
  type: "story" | "bug" | "task" | "epic"
  priority: "low" | "medium" | "high"
  assignee: {
    name: string
    avatar: string
  } | null
  storyPoints: number
  labels: string[]
  createdAt: string
}


function BacklogItemsCard({ backlogItems, searchedItem, orderList, limit }: Props) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [tasks, setTasks] = useAtom(taskStore.tasks)
  const [Pagination, setPagination] = useState<PaginationType>()
  const [tasksLoading, tasksData, tasksError, GetTasks] = useServerAction(GetTasksAction)

  const projectId = useParams().id as string
  const searchParams = useSearchParams()

  useEffect(() => {
    const fatchTasks = async () => {
      const page = parseInt(searchParams.get('page') || '1', 10)
      const res = await GetTasks({ project_id: projectId, page: page ? page : 1, limit: limit, searchedItem, orderList })
      if (res?.success && res.data) {
        const tasks = res?.data
        setTasks(tasks?.tasks)
        setPagination(tasks.pagination)
      }
    }
    fatchTasks()
  }, [projectId, searchParams, searchedItem, orderList, limit])



  const handleSelectAll = () => {
    if (selectedItems.length === backlogItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(backlogItems.map((item) => item.id))
    }
  }

  return (
    <>
      <h2 className='font-semibold leading-none tracking-tight'>Backlog Items</h2 >
      <p className='text-sm text-muted-foreground !mt-2'>Manage your project backlog items</p>
      <div className='w-full overflow-x-auto'>
        <div className="rounded-md border">
          <div className="grid grid-cols-12 gap-2 p-4 bg-muted/50 text-sm font-medium">
            <div className="col-span-1">
              <Checkbox
                checked={selectedItems.length === backlogItems.length && backlogItems.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </div>
            <div className="col-span-1">ID</div>
            <div className="col-span-3">Title</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-3 flex justify-around items-center">
              status
              <div>Priority</div>
            </div>
            <div className="col-span-1">Points</div>
            <div className="col-span-1">Assignee</div>
            <div className="col-span-1"></div>
          </div>
          {
            tasksLoading ? (
              <div className="flex justify-center h-full w-full my-4">
                <Loader size={LoaderSizes.lg} />
              </div>
            ) : (
              tasks.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground my-4">No backlog items found</div>
              ) : (
                <div className='pb-2'>
                  {tasks && tasks.map((task) => (
                    <BacklogItems
                      key={task.id}
                      task={task}
                      selectedItems={selectedItems}
                      setSelectedItems={setSelectedItems}
                    />
                  ))}
                  {
                    Pagination &&
                    <PaginationComponent pagination={Pagination} />
                  }

                </div>
              )
            )
          }
        </div>
      </div>
    </>
  )
}

export default BacklogItemsCard