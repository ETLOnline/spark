"use client"

import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  AlertCircle,
  Settings
} from "lucide-react"
import BacklogItemsCard from "./BacklogItemsCard"
import { useAtomValue, useSetAtom } from "jotai"
import { projectStore } from "@/src/store/project/projectStore"
import { taskStore } from "@/src/store/tasks/taskStore"
import StatusRequiredDialog from "../StatusRequiredDialog"
import TaskModal from "../components/TaskModal"

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
    description:
      "Add a recommendation engine that suggests products based on user browsing history",
    type: "story",
    priority: "high",
    assignee: null,
    storyPoints: 13,
    labels: ["feature", "frontend", "backend"],
    createdAt: "2023-05-10T10:30:00Z"
  },
  {
    id: "BLG-002",
    title: "Fix checkout page layout on mobile",
    description:
      "The checkout page is not displaying correctly on mobile devices",
    type: "bug",
    priority: "high",
    assignee: { name: "Sarah Miller", avatar: "/avatars/02.png" },
    storyPoints: 3,
    labels: ["bug", "frontend", "mobile"],
    createdAt: "2023-05-12T14:45:00Z"
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
    createdAt: "2023-05-14T09:15:00Z"
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
    createdAt: "2023-05-15T11:20:00Z"
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
    createdAt: "2023-05-16T15:30:00Z"
  },
  {
    id: "BLG-006",
    title: "E-commerce Platform Redesign",
    description:
      "Major redesign of the e-commerce platform to improve user experience",
    type: "epic",
    priority: "high",
    assignee: { name: "Alex Johnson", avatar: "/avatars/01.png" },
    storyPoints: 40,
    labels: ["design", "frontend", "ux"],
    createdAt: "2023-05-08T08:00:00Z"
  }
]

export function BacklogManagement() {
  const [backlogItems, setBacklogItems] =
    useState<BacklogItem[]>(sampleBacklogItems)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchedItem, setSearchedItem] = useState("")
  const [orderList, setOrderList] = useState("asc")
  const [limit, setLimit] = useState(10)
  const projectStatusList = useAtomValue(projectStore.projectStatusList)
  const [openDialog, setOpenDialog] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  function handleSearch() {
    if (searchQuery) {
      setSearchedItem(searchQuery)
    }
  }

  useEffect(() => {
    if (projectStatusList.length === 0) {
      setOpenDialog(true)
    }
  }, [projectStatusList])

  return projectStatusList.length > 0 ? (
    <>
      <TaskModal
        isTaskModelOpen={isTaskModalOpen}
        setIsTaskModelOpen={setIsTaskModalOpen}
      />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold">Backlog</h2>
          <Button onClick={() => setIsTaskModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="relative w-full sm:w-64 flex">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search backlog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          backlogItems={backlogItems}
        />
      </div>
    </>
  ) : (
    <StatusRequiredDialog openDialog={openDialog} />
  )
}
