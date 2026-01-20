import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { InsertTaskStatus, SelectSprint, SelectTask } from "@/src/db/schema"
import BoardTaskCard from "./BoardTaskCard"
import { useDroppable } from "@dnd-kit/core"
import { TaskType } from "../../constants/projectManagment"
import { Badge } from "@/src/components/ui/badge"

interface Props {
  sprint?: SelectSprint
  status?: InsertTaskStatus
  tasks: SelectTask[]
  onTaskClick: (task: SelectTask) => void
  setTasks: Dispatch<SetStateAction<SelectTask[]>>
}

function BoardColumn({ sprint, status, tasks, onTaskClick, setTasks }: Props) {
  const { setNodeRef } = useDroppable({
    id: status?.id || "",
    data: { statusId: status?.id }
  })

  const columnTasks = tasks.filter((t) => t.status_id === status?.id)

  const filteredTasks = columnTasks.filter((task) =>
    task.parentTask && task.parentTask.task_type !== TaskType.EPIC
      ? task.parentTask?.status_id !== task.status_id
      : true
  )

  const taskCount = filteredTasks.length

  return (
    <div
      ref={setNodeRef}
      className="w-[33%] bg-muted/50 p-2 pb-4 rounded-xl flex-shrink-0 space-y-2"
    >
      <div className="flex flex-row gap-2 items-center p-2">
        <div className="font-medium text- text-center">{status?.name}</div>
        {taskCount === 0 ? null : (
          <div className="text-xs text-center bg-primary rounded  px-2 py-0.5 text-black">
            {taskCount}
          </div>
        )}
      </div>
      {filteredTasks.map((task) => (
        <BoardTaskCard
          task={task}
          key={task.id}
          onClick={onTaskClick}
          setTasks={setTasks}
          taskList={tasks}
        />
      ))}

      {/* task modal */}
    </div>
  )
}

export default BoardColumn
