"use client"

import type React from "react"

import { useEffect, useState } from "react"

import type { Column, Task } from "./lib/types"
import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"

interface TaskDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onAddTask: (task: Omit<Task, "id">) => void
  onUpdateTask: (task: Task) => void
  editingTask: Task | null
  columns: Column[]
  activeColumn: string
}

export function TaskDialog({
  open,
  setOpen,
  onAddTask,
  onUpdateTask,
  editingTask,
  columns,
  activeColumn,
}: TaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("")

  // Reset form when dialog opens/closes or editing task changes
  useEffect(() => {
    if (open && editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description || "")
      setStatus(editingTask.status)
    } else if (open) {
      setTitle("")
      setDescription("")
      setStatus(activeColumn || (columns.length > 0 ? columns[0].id : ""))
    }
  }, [open, editingTask, columns, activeColumn])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !status) return

    const taskData = {
      title,
      description,
      status,
    }

    if (editingTask?.id) {
      onUpdateTask({
        ...taskData,
        id: editingTask.id,
      })
    } else {
      onAddTask(taskData)
    }

    setTitle("")
    setDescription("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingTask?.id ? "Edit Task" : "Add New Task"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task description"
                className="resize-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingTask?.id ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

