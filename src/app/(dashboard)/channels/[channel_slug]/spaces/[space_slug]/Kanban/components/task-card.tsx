"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Pencil, Trash2 } from "lucide-react"

import type { Task } from "./lib/types"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { cn } from "./lib/utils"

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn("cursor-grab border shadow-sm hover:border-primary/50 hover:shadow-md z-10 ", isDragging && "opacity-50")}
    >
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <CardDescription className="text-xs mb-2">{task.description}</CardDescription>
        <div className="flex justify-end gap-1 mt-2">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
            <Pencil className="h-3 w-3" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

