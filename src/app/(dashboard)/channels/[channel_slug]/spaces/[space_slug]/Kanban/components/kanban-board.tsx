"use client"

import { useEffect, useState } from "react"
import { DndContext, type DragEndEvent, closestCorners } from "@dnd-kit/core"
import { PlusCircle } from "lucide-react"

import type { Column, Task } from "./lib/types"
import { Button } from "@/src/components/ui/button"
import { KanbanColumn } from "./kanban-column"
import { TaskDialog } from "./task-dialog"

const defaultColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      {
        id: "task-1",
        title: "Research competitors",
        description: "Look into what similar products are doing in the market",
        status: "todo",
      },
      {
        id: "task-2",
        title: "Create wireframes",
        description: "Design initial wireframes for the new feature",
        status: "todo",
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [
      {
        id: "task-3",
        title: "Implement authentication",
        description: "Add user login and registration functionality",
        status: "in-progress",
      },
      {
        id: "task-4",
        title: "Write documentation",
        description: "Document the API endpoints for the team",
        status: "in-progress",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    tasks: [
      {
        id: "task-5",
        title: "Fix navigation bug",
        description: "Resolve the issue with the dropdown menu",
        status: "done",
      },
    ],
  },
]

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([])
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeColumn, setActiveColumn] = useState<string>("")

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedColumns = localStorage.getItem("kanbanColumns")
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns))
      } catch (e) {
        console.error("Failed to parse saved columns", e)
        setColumns(defaultColumns)
      }
    } else {
      setColumns(defaultColumns)
    }
  }, [])

  // Save to localStorage whenever columns change
  useEffect(() => {
    if (columns.length > 0) {
      localStorage.setItem("kanbanColumns", JSON.stringify(columns))
    }
  }, [columns])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the task being dragged
    let activeTask: Task | null = null
    let activeColumnId = ""

    for (const column of columns) {
      const task = column.tasks.find((t) => t.id === activeId)
      if (task) {
        activeTask = task
        activeColumnId = column.id
        break
      }
    }

    if (!activeTask) return

    // If dropped over a column
    if (columns.some((col) => col.id === overId)) {
      // Move task to new column
      setColumns((prev) => {
        return prev.map((column) => {
          // Remove from source column
          if (column.id === activeColumnId) {
            return {
              ...column,
              tasks: column.tasks.filter((t) => t.id !== activeId),
            }
          }

          // Add to destination column
          if (column.id === overId) {
            const updatedTask = { ...activeTask!, status: overId }
            return {
              ...column,
              tasks: [...column.tasks, updatedTask],
            }
          }

          return column
        })
      })
    }
  }

  function addNewTask(task: Omit<Task, "id">) {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
    }

    setColumns((prev) => {
      return prev.map((column) => {
        if (column.id === task.status) {
          return {
            ...column,
            tasks: [...column.tasks, newTask],
          }
        }
        return column
      })
    })

    setTaskDialogOpen(false)
  }

  function updateTask(updatedTask: Task) {
    setColumns((prev) => {
      return prev.map((column) => {
        // If task status changed, remove from old column
        if (column.id !== updatedTask.status && column.tasks.some((t) => t.id === updatedTask.id)) {
          return {
            ...column,
            tasks: column.tasks.filter((t) => t.id !== updatedTask.id),
          }
        }

        // If this is the new status column, add or update the task
        if (column.id === updatedTask.status) {
          const taskExists = column.tasks.some((t) => t.id === updatedTask.id)

          if (taskExists) {
            return {
              ...column,
              tasks: column.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
            }
          } else {
            return {
              ...column,
              tasks: [...column.tasks, updatedTask],
            }
          }
        }

        return column
      })
    })

    setEditingTask(null)
    setTaskDialogOpen(false)
  }

  function deleteTask(taskId: string) {
    setColumns((prev) => {
      return prev.map((column) => {
        return {
          ...column,
          tasks: column.tasks.filter((t) => t.id !== taskId),
        }
      })
    })
  }

  function handleAddTask(columnId: string) {
    setActiveColumn(columnId)
    setEditingTask(null)
    setTaskDialogOpen(true)
  }

  function handleEditTask(task: Task) {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => handleAddTask("todo")} variant="default">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onAddTask={() => handleAddTask(column.id)}
              onEditTask={handleEditTask}
              onDeleteTask={deleteTask}
            />
          ))}
        </div>
      </DndContext>

      <TaskDialog
        open={taskDialogOpen}
        setOpen={setTaskDialogOpen}
        onAddTask={addNewTask}
        onUpdateTask={updateTask}
        editingTask={editingTask}
        columns={columns}
        activeColumn={activeColumn}
      />
    </div>
  )
}

