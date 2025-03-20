"use client"

import type React from "react"

import { useEffect, useState } from "react"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Column } from "./lib/types"

interface ColumnDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onAddColumn: (title: string) => void
  onUpdateColumn: (column: Column) => void
  editingColumn: Column | null
}

export function ColumnDialog({ open, setOpen, onAddColumn, onUpdateColumn, editingColumn }: ColumnDialogProps) {
  const [title, setTitle] = useState("")

  useEffect(() => {
    if (open && editingColumn) {
      setTitle(editingColumn.title)
    } else if (open) {
      setTitle("")
    }
  }, [open, editingColumn])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    if (editingColumn) {
      onUpdateColumn({
        ...editingColumn,
        title: title,
      })
    } else {
      onAddColumn(title)
    }

    setTitle("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingColumn ? "Edit Column" : "Add New Column"}</DialogTitle>
            <DialogDescription>
              {editingColumn ? "Update the column title." : "Create a new column for your board."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Column title"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingColumn ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

