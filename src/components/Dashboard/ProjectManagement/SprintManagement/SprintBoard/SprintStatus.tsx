import { Clock } from "lucide-react"
import React from "react"

interface Props {
  sprint?: Sprint
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

function SprintStatus({ sprint }: Props) {
  return (
    <div className="text-sm text-muted-foreground">
      <Clock className="inline-block mr-1 h-4 w-4" />
      {"completed"}
    </div>
  )
}

export default SprintStatus
