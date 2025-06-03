import { Progress } from "@/src/components/ui/progress"
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

function SprintProgressBar({ sprint }: Props) {
  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1 text-xs">
        <span>{10}% Complete</span>
        <span>{12} Tasks</span>
      </div>
      <Progress value={50} className="h-2" />
    </div>
  )
}

export default SprintProgressBar
