"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, ArrowRightCircle } from "lucide-react"
import CreateSprintModal from "./CreateSprintModal"
import SprintCard from "./SprintCard"

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  assignee: {
    name: string
    avatar: string
  }
  storyPoints: number
}

interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
  status: "planning" | "active" | "completed"
  progress: number
  tasks: Task[]
}

const sampleSprints: Sprint[] = [
  {
    id: "1",
    name: "Sprint 4",
    startDate: "2023-05-15",
    endDate: "2023-05-28",
    status: "active",
    progress: 65,
    tasks: [
      {
        id: "t1",
        title: "Implement user authentication",
        description: "Add login, registration, and password reset functionality",
        status: "done",
        priority: "high",
        assignee: { name: "Alex Johnson", avatar: "/avatars/01.png" },
        storyPoints: 8,
      },
      {
        id: "t2",
        title: "Create product listing page",
        description: "Design and implement the product grid with filtering options",
        status: "in-progress",
        priority: "medium",
        assignee: { name: "Sarah Miller", avatar: "/avatars/02.png" },
        storyPoints: 5,
      },
      {
        id: "t3",
        title: "Integrate payment gateway",
        description: "Connect with Stripe API for payment processing",
        status: "todo",
        priority: "high",
        assignee: { name: "David Chen", avatar: "/avatars/03.png" },
        storyPoints: 13,
      },
      {
        id: "t4",
        title: "Implement shopping cart",
        description: "Add ability to add/remove items and adjust quantities",
        status: "in-progress",
        priority: "medium",
        assignee: { name: "Emma Wilson", avatar: "/avatars/04.png" },
        storyPoints: 8,
      },
      {
        id: "t5",
        title: "Add product search functionality",
        description: "Implement search with autocomplete suggestions",
        status: "todo",
        priority: "low",
        assignee: { name: "James Taylor", avatar: "/avatars/05.png" },
        storyPoints: 5,
      },
    ],
  },
  {
    id: "2",
    name: "Sprint 3",
    startDate: "2023-05-01",
    endDate: "2023-05-14",
    status: "completed",
    progress: 100,
    tasks: [
      {
        id: "t6",
        title: "Database schema design",
        description: "Create initial database models and relationships",
        status: "done",
        priority: "high",
        assignee: { name: "David Chen", avatar: "/avatars/03.png" },
        storyPoints: 8,
      },
      {
        id: "t7",
        title: "Setup CI/CD pipeline",
        description: "Configure automated testing and deployment",
        status: "done",
        priority: "medium",
        assignee: { name: "Alex Johnson", avatar: "/avatars/01.png" },
        storyPoints: 5,
      },
      {
        id: "t8",
        title: "Create basic UI components",
        description: "Develop reusable UI components based on design system",
        status: "done",
        priority: "medium",
        assignee: { name: "Sarah Miller", avatar: "/avatars/02.png" },
        storyPoints: 8,
      },
    ],
  },
]

export function SprintManagement() {
  const [sprints, setSprints] = useState<Sprint[]>(sampleSprints)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
      case "in-progress":
        return <ArrowRightCircle className="h-4 w-4 text-blue-500" />
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Sprint Management</h2>
        <CreateSprintModal sprints={sprints} setSprints={setSprints} />
      </div>

      {sprints.map((sprint) => (
        <SprintCard sprint={sprint} sprints={sprints} setSprints={setSprints} key={sprint.id} />
      ))}
    </div>
  )
}

