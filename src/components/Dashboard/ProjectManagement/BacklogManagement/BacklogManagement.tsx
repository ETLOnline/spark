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
import { Checkbox } from "@/src/components/ui/checkbox"
import AddBabklogItem from "./AddBabklogItem"
import BacklogItemsCard from "./BacklogItemsCard"


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
        <AddBabklogItem backlogItems={backlogItems} setBacklogItems={setBacklogItems} />
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

      <BacklogItemsCard backlogItems={backlogItems} />

    </div>
  )
}

