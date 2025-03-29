import { Button } from '@/src/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Textarea } from '@/src/components/ui/textarea'
import { Plus } from 'lucide-react'
import React, { Dispatch, SetStateAction, useState } from 'react'


interface Props {
  backlogItems: BacklogItem[]
  setBacklogItems: Dispatch<SetStateAction<BacklogItem[]>>
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





function AddBabklogItem({ backlogItems, setBacklogItems }: Props) {
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    type: "story",
    priority: "medium",
    storyPoints: 0,
    labels: "",
  })

  const handleCreateItem = () => {
    if (!newItem.title) return

    const item: BacklogItem = {
      id: `BLG-${(backlogItems.length + 1).toString().padStart(3, "0")}`,
      title: newItem.title,
      description: newItem.description,
      type: newItem.type as "story" | "bug" | "task" | "epic",
      priority: newItem.priority as "low" | "medium" | "high",
      assignee: null,
      storyPoints: newItem.storyPoints || 0,
      labels: newItem.labels ? newItem.labels.split(",").map((label) => label.trim()) : [],
      createdAt: new Date().toISOString(),
    }

    setBacklogItems([...backlogItems, item])
    setNewItem({
      title: "",
      description: "",
      type: "story",
      priority: "medium",
      storyPoints: 0,
      labels: "",
    })
    setIsCreateItemOpen(false)
  }

  return (
    <Dialog open={isCreateItemOpen} onOpenChange={setIsCreateItemOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Backlog Item</DialogTitle>
          <DialogDescription>Add a new item to your project backlog.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="item-title" className="text-right">
              Title
            </Label>
            <Input
              id="item-title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="item-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="item-description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="item-type" className="text-right">
              Type
            </Label>
            <Select value={newItem.type} onValueChange={(value) => setNewItem({ ...newItem, type: value })}>
              <SelectTrigger id="item-type" className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="item-priority" className="text-right">
              Priority
            </Label>
            <Select value={newItem.priority} onValueChange={(value) => setNewItem({ ...newItem, priority: value })}>
              <SelectTrigger id="item-priority" className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="story-points" className="text-right">
              Story Points
            </Label>
            <Input
              id="story-points"
              type="number"
              min="0"
              value={newItem.storyPoints}
              onChange={(e) => setNewItem({ ...newItem, storyPoints: Number.parseInt(e.target.value) || 0 })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="item-labels" className="text-right">
              Labels
            </Label>
            <Input
              id="item-labels"
              value={newItem.labels}
              onChange={(e) => setNewItem({ ...newItem, labels: e.target.value })}
              className="col-span-3"
              placeholder="feature, frontend, backend (comma separated)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateItem}>Create Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddBabklogItem