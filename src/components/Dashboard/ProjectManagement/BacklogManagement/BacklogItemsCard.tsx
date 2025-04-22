import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Checkbox } from '@/src/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/src/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import BacklogItems from './BacklogItems'
import { useAtom, useAtomValue } from 'jotai'
import { projectStore } from '@/src/store/project/projectStore'
import { useServerAction } from '@/src/hooks/useServerAction'
import { GetTaskAction } from '@/src/server-actions/Tasks/Task'
import { useParams } from 'next/navigation'
import Loader from '@/src/components/common/Loader/Loader'
import { LoaderSizes } from '@/src/components/common/types/loader-types'


interface Props {
  backlogItems: BacklogItem[]
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


function BacklogItemsCard({ backlogItems }: Props) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [tasks, setTasks] = useAtom(projectStore.tasks)
  const [tasksLoading, tasksData, tasksError, GetTask] = useServerAction(GetTaskAction)

  const projectId = useParams().id as string
  useEffect(() => {
    GetTask(projectId)
  }, [projectId])

  useEffect(() => {
    if (tasksData?.data !== null) {
      setTasks(tasksData?.data ?? [])
    }
  }, [tasksData])



  const handleSelectAll = () => {
    if (selectedItems.length === backlogItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(backlogItems.map((item) => item.id))
    }
  }

  const filteredItems = backlogItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.labels.some((label) => label.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <>
      <div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Backlog Items</CardTitle>
            <CardDescription>Manage your project backlog items</CardDescription>
          </CardHeader>
          <div className='w-full overflow-x-auto'>
            <CardContent>
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
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Priority</div>
                  <div className="col-span-1">Points</div>
                  <div className="col-span-1">Assignee</div>
                  <div className="col-span-1"></div>
                </div>
                {
                  tasksLoading ?
                    <div className="flex justify-center h-full w-full my-4">
                      <Loader size={LoaderSizes.lg} />
                    </div>
                    : (
                      tasks.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground my-4">No backlog items found</div>
                      ) : (
                        tasks.map((task) => (
                          <BacklogItems key={task.id} task={task} selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
                        ))
                      )
                    )}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </>
  )
}

export default BacklogItemsCard