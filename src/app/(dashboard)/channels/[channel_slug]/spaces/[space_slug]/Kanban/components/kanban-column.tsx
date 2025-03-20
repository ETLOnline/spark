"use client"

import { useDroppable } from "@dnd-kit/core"
import { Plus } from "lucide-react"

import type { Column, Task } from "./lib/types"
import { TaskCard } from "./task-card"
import { Button } from "@/src/components/ui/button"
import { cn } from "./lib/utils"

interface KanbanColumnProps {
  column: Column
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
}

export function KanbanColumn({ column, onAddTask, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-[500px] flex-col rounded-lg border bg-card p-4 text-card-foreground shadow-sm",
        isOver && "border-primary/50 bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{column.title}</h3>
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">{column.tasks.length}</span>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={() => onEditTask(task)} onDelete={() => onDeleteTask(task.id)} />
        ))}
      </div>

      <Button variant="ghost" className="mt-2 justify-start text-muted-foreground" onClick={onAddTask}>
        <Plus className="mr-2 h-4 w-4" />
        Add Task
      </Button>
    </div>
  )
}

