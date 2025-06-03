import React from "react"
import SprintTaskCard from "./SprintTaskCard"
import { AlertCircle } from "lucide-react"

interface Props {
  sprint: Sprint
  status: "todo" | "in-progress" | "done"
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

function BoardColumn({ sprint, status }: Props) {
  return (
    <div className="w-1/4 flex-shrink-0 space-y-2">
      <div className="font-medium text-sm flex items-center">
        <AlertCircle className="mr-2 h-4 w-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
      {sprint.tasks
        .filter((task) => task.status === status)
        .map((task) => (
          <SprintTaskCard task={task} key={task.id} />
        ))}
    </div>
  )
}

export default BoardColumn
