import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { SetStateAction } from "jotai"
import { Plus } from "lucide-react"
import React, { Dispatch, useState } from "react"

interface Props {
  sprints: Sprint[]
  setSprints: Dispatch<SetStateAction<Sprint[]>>
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

interface Sprint {
  id: string
  name: string
  startDate: string
  endDate: string
  status: "planning" | "active" | "completed"
  progress: number
  tasks: Task[]
}

function CreateSprintModal({ sprints, setSprints }: Props) {
  const [newSprint, setNewSprint] = useState({
    name: "",
    startDate: "",
    endDate: ""
  })
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)

  const handleCreateSprint = () => {
    if (!newSprint.name || !newSprint.startDate || !newSprint.endDate) return

    const sprint: Sprint = {
      id: (sprints.length + 1).toString(),
      name: newSprint.name,
      startDate: newSprint.startDate,
      endDate: newSprint.endDate,
      status: "planning",
      progress: 0,
      tasks: []
    }

    setSprints([sprint, ...sprints])
    setNewSprint({ name: "", startDate: "", endDate: "" })
    setIsCreateSprintOpen(false)
  }

  return (
    <Dialog open={isCreateSprintOpen} onOpenChange={setIsCreateSprintOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Sprint
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Sprint</DialogTitle>
          <DialogDescription>
            Plan a new sprint for your project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sprint-name" className="text-right">
              Name
            </Label>
            <Input
              id="sprint-name"
              value={newSprint.name}
              onChange={(e) =>
                setNewSprint({ ...newSprint, name: e.target.value })
              }
              className="col-span-3"
              placeholder="Sprint 5"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-date" className="text-right">
              Start Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={newSprint.startDate}
              onChange={(e) =>
                setNewSprint({ ...newSprint, startDate: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-date" className="text-right">
              End Date
            </Label>
            <Input
              id="end-date"
              type="date"
              value={newSprint.endDate}
              onChange={(e) =>
                setNewSprint({ ...newSprint, endDate: e.target.value })
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateSprint}>Create Sprint</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSprintModal
