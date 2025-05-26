import React, { Dispatch, SetStateAction, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Plus } from "lucide-react"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"

interface Props {
  sprint: Sprint
  sprints: Sprint[]
  setSprints: Dispatch<SetStateAction<Sprint[]>>
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

function AddSprintTask({ sprint, sprints, setSprints }: Props) {
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    storyPoints: 0,
    assignee: ""
  })

  const handleCreateTask = () => {
    if (!selectedSprint || !newTask.title) return

    const task: Task = {
      id: `t${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: "todo",
      priority: newTask.priority as "low" | "medium" | "high",
      assignee: { name: "Unassigned", avatar: "/avatars/placeholder.svg" },
      storyPoints: newTask.storyPoints || 0
    }

    const updatedSprints = sprints.map((sprint) =>
      sprint.id === selectedSprint.id
        ? { ...sprint, tasks: [...sprint.tasks, task] }
        : sprint
    )

    setSprints(updatedSprints)
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      storyPoints: 0,
      assignee: ""
    })
    setIsCreateTaskOpen(false)
  }

  return (
    <Dialog
      open={isCreateTaskOpen && selectedSprint?.id === sprint.id}
      onOpenChange={(open) => {
        setIsCreateTaskOpen(open)
        if (open) setSelectedSprint(sprint)
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-3 w-3" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Task to {sprint.name}</DialogTitle>
          <DialogDescription>
            Create a new task for this sprint.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-title" className="text-right">
              Title
            </Label>
            <Input
              id="task-title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="task-description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-priority" className="text-right">
              Priority
            </Label>
            <Select
              value={newTask.priority}
              onValueChange={(value) =>
                setNewTask({ ...newTask, priority: value })
              }
            >
              <SelectTrigger id="task-priority" className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="story-points" className="text-right">
              Story Points
            </Label>
            <Input
              id="story-points"
              type="number"
              min="0"
              value={newTask.storyPoints}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  storyPoints: Number.parseInt(e.target.value) || 0
                })
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateTask}>Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddSprintTask
