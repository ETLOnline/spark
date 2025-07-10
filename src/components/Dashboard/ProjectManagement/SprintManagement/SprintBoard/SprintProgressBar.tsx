import { Progress } from "@/src/components/ui/progress"
import { InsertTaskStatus, SelectTask, SelectTaskStatus } from "@/src/db/schema"
import React from "react"

interface Props {
  tasks: SelectTask[]
  statuses: InsertTaskStatus[]
}

function SprintProgressBar({ tasks, statuses }: Props) {
  const Done = statuses.find((status) => status.name === "Done")

  const compeletedTasks = tasks.filter((task) => task.status_id === Done?.id)

  let percentage

  if (compeletedTasks.length === 0) {
    percentage = 0
  } else {
    percentage = (compeletedTasks.length / tasks.length) * 100
  }

  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1 text-xs">
        <span>{Math.round(percentage)}% Complete</span>
        <span>{tasks.length} Tasks</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
}

export default SprintProgressBar
