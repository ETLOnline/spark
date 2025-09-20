import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { InsertTaskStatus, SelectSprint, SelectTask } from "@/src/db/schema"
import BoardTaskCard from "./BoardTaskCard"
import { useDroppable } from "@dnd-kit/core"

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

  return (
    <div
      ref={setNodeRef}
      className="w-[24%] border p-2 pb-4 rounded-xl flex-shrink-0 space-y-2"
    >
      <div className="font-medium text-sm mb-4 text-center">{status?.name}</div>
      {columnTasks.map((task) => (
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
