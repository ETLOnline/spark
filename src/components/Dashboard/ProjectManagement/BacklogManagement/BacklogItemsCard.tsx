import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Checkbox } from '@/src/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/src/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import React, { useState } from 'react'
import BacklogItemList from './BacklogItemList'


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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Backlog Items</CardTitle>
          <CardDescription>Manage your project backlog items</CardDescription>
        </CardHeader>
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
              <div className="col-span-3 sm:col-span-4">Title</div>
              <div className="col-span-2 hidden md:block">Type</div>
              <div className="col-span-2 hidden sm:block">Priority</div>
              <div className="col-span-1 hidden lg:block">Points</div>
              <div className="col-span-2 sm:col-span-1">Assignee</div>
              <div className="col-span-1"></div>
            </div>
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No backlog items found</div>
            ) : (
              filteredItems.map((item) => (
                <BacklogItemList key={item.id} item={item} selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default BacklogItemsCard