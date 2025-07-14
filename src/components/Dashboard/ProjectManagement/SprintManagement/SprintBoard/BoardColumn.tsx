import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { InsertTaskStatus, SelectSprint, SelectTask } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetSprintTasksAction } from "@/src/server-actions/Tasks/Task"
import BoardTaskCard from "./BoardTaskCard"
interface Props {
  sprint?: SelectSprint
  status?: InsertTaskStatus
  tasks: SelectTask[]
  onTaskClick: (task: SelectTask) => void
  setTasks: Dispatch<SetStateAction<SelectTask[]>>
}

function BoardColumn({ sprint, status, tasks, onTaskClick, setTasks }: Props) {
  return (
    <div className="w-[24%] bg-muted/70 p-2 rounded-xl flex-shrink-0 space-y-2">
      <div className="font-medium text-sm flex items-center">
        <AlertCircle className="mr-2 h-4 w-4" />
        {status?.name}
      </div>
      {tasks
        .filter((t) => t.status_id === status?.id)
        .map((task) => (
          <BoardTaskCard
            task={task}
            key={task.id}
            onClick={onTaskClick}
            setTasks={setTasks}
          />
        ))}

      {/* task modal */}
    </div>
  )
}

export default BoardColumn
