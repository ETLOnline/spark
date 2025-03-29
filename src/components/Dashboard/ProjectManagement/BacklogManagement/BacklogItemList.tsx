import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Checkbox } from '@/src/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/src/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import React, { Dispatch, SetStateAction, useState } from 'react'

interface Props {
  item: BacklogItem
  selectedItems: string[]
  setSelectedItems: Dispatch<SetStateAction<string[]>>
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

function BacklogItemList({ item, selectedItems, setSelectedItems }: Props) {


  const handleSelectItem = (id: string) => {
    setSelectedItems(
      selectedItems.includes(id) ? selectedItems.filter((itemId) => itemId !== id) : [...selectedItems, id],
    )
  }


  const getTypeLabel = (type: string) => {
    switch (type) {
      case "story":
        return (
          <Badge variant="default" className="bg-blue-500">
            Story
          </Badge>
        )
      case "bug":
        return <Badge variant="destructive">Bug</Badge>
      case "task":
        return <Badge variant="secondary">Task</Badge>
      case "epic":
        return (
          <Badge variant="default" className="bg-purple-500">
            Epic
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            High
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div key={item.id} className="grid grid-cols-12 gap-2 p-4 border-t items-center">
      <div className="col-span-1">
        <Checkbox
          checked={selectedItems.includes(item.id)}
          onCheckedChange={() => handleSelectItem(item.id)}
        />
      </div>
      <div className="col-span-1 text-sm font-medium">{item.id}</div>
      <div className="col-span-3 sm:col-span-4">
        <div className="font-medium">{item.title}</div>
        <div className="text-xs text-muted-foreground hidden sm:block">{item.description}</div>
        <div className="flex flex-wrap gap-1 mt-1  sm:flex">
          {item.labels.map((label, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {label}
            </Badge>
          ))}
        </div>
      </div>
      <div className="col-span-2 hidden md:block">{getTypeLabel(item.type)}</div>
      <div className="col-span-2 hidden sm:block">{getPriorityLabel(item.priority)}</div>
      <div className="col-span-1 hidden lg:block">{item.storyPoints}</div>
      <div className="col-span-2 sm:col-span-1">
        {item.assignee ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={item.assignee.avatar} />
            <AvatarFallback>{item.assignee.name[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <Badge variant="outline" className="text-xs">
            Unassigned
          </Badge>
        )}
      </div>
      <div className="col-span-1 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Assign</DropdownMenuItem>
            <DropdownMenuItem>Add to Sprint</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default BacklogItemList