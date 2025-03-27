"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Plus, Search, Filter, MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Checkbox } from "../../ui/checkbox"

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

const sampleBacklogItems: BacklogItem[] = [
  {
    id: "BLG-001",
    title: "Implement product recommendations",
    description: "Add a recommendation engine that suggests products based on user browsing history",
    type: "story",
    priority: "high",
    assignee: null,
    storyPoints: 13,
    labels: ["feature", "frontend", "backend"],
    createdAt: "2023-05-10T10:30:00Z",
  },
  {
    id: "BLG-002",
    title: "Fix checkout page layout on mobile",
    description: "The checkout page is not displaying correctly on mobile devices",
    type: "bug",
    priority: "high",
    assignee: { name: "Sarah Miller", avatar: "/avatars/02.png" },
    storyPoints: 3,
    labels: ["bug", "frontend", "mobile"],
    createdAt: "2023-05-12T14:45:00Z",
  },
  {
    id: "BLG-003",
    title: "Add product reviews and ratings",
    description: "Allow users to leave reviews and ratings for products",
    type: "story",
    priority: "medium",
    assignee: null,
    storyPoints: 8,
    labels: ["feature", "frontend"],
    createdAt: "2023-05-14T09:15:00Z",
  },
  {
    id: "BLG-004",
    title: "Optimize database queries",
    description: "Improve performance of product search and filtering",
    type: "task",
    priority: "medium",
    assignee: { name: "David Chen", avatar: "/avatars/03.png" },
    storyPoints: 5,
    labels: ["performance", "backend"],
    createdAt: "2023-05-15T11:20:00Z",
  },
  {
    id: "BLG-005",
    title: "Implement order tracking",
    description: "Allow users to track their orders in real-time",
    type: "story",
    priority: "low",
    assignee: null,
    storyPoints: 8,
    labels: ["feature", "frontend", "backend"],
    createdAt: "2023-05-16T15:30:00Z",
  },
  {
    id: "BLG-006",
    title: "E-commerce Platform Redesign",
    description: "Major redesign of the e-commerce platform to improve user experience",
    type: "epic",
    priority: "high",
    assignee: { name: "Alex Johnson", avatar: "/avatars/01.png" },
    storyPoints: 40,
    labels: ["design", "frontend", "ux"],
    createdAt: "2023-05-08T08:00:00Z",
  },
]

export function BacklogManagement() {
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>(sampleBacklogItems)
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
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

  const handleSelectItem = (id: string) => {
    setSelectedItems(
      selectedItems.includes(id) ? selectedItems.filter((itemId) => itemId !== id) : [...selectedItems, id],
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === backlogItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(backlogItems.map((item) => item.id))
    }
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

  const filteredItems = backlogItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.labels.some((label) => label.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Backlog</h2>
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
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search backlog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort
          </Button>
          <Select defaultValue="planning">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="sprint">Sprint Planning</SelectItem>
              <SelectItem value="refinement">Refinement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
                    <div className="flex flex-wrap gap-1 mt-1 hidden sm:flex">
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

