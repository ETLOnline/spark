"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Progress } from "@/src/components/ui/progress"
import { Clock, Plus, AlertCircle, CheckCircle2, ArrowRightCircle, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

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

const sampleSprints: Sprint[] = [
  {
    id: "1",
    name: "Sprint 4",
    startDate: "2023-05-15",
    endDate: "2023-05-28",
    status: "active",
    progress: 65,
    tasks: [
      {
        id: "t1",
        title: "Implement user authentication",
        description: "Add login, registration, and password reset functionality",
        status: "done",
        priority: "high",
        assignee: { name: "Alex Johnson", avatar: "/avatars/01.png" },
        storyPoints: 8,
      },
      {
        id: "t2",
        title: "Create product listing page",
        description: "Design and implement the product grid with filtering options",
        status: "in-progress",
        priority: "medium",
        assignee: { name: "Sarah Miller", avatar: "/avatars/02.png" },
        storyPoints: 5,
      },
      {
        id: "t3",
        title: "Integrate payment gateway",
        description: "Connect with Stripe API for payment processing",
        status: "todo",
        priority: "high",
        assignee: { name: "David Chen", avatar: "/avatars/03.png" },
        storyPoints: 13,
      },
      {
        id: "t4",
        title: "Implement shopping cart",
        description: "Add ability to add/remove items and adjust quantities",
        status: "in-progress",
        priority: "medium",
        assignee: { name: "Emma Wilson", avatar: "/avatars/04.png" },
        storyPoints: 8,
      },
      {
        id: "t5",
        title: "Add product search functionality",
        description: "Implement search with autocomplete suggestions",
        status: "todo",
        priority: "low",
        assignee: { name: "James Taylor", avatar: "/avatars/05.png" },
        storyPoints: 5,
      },
    ],
  },
  {
    id: "2",
    name: "Sprint 3",
    startDate: "2023-05-01",
    endDate: "2023-05-14",
    status: "completed",
    progress: 100,
    tasks: [
      {
        id: "t6",
        title: "Database schema design",
        description: "Create initial database models and relationships",
        status: "done",
        priority: "high",
        assignee: { name: "David Chen", avatar: "/avatars/03.png" },
        storyPoints: 8,
      },
      {
        id: "t7",
        title: "Setup CI/CD pipeline",
        description: "Configure automated testing and deployment",
        status: "done",
        priority: "medium",
        assignee: { name: "Alex Johnson", avatar: "/avatars/01.png" },
        storyPoints: 5,
      },
      {
        id: "t8",
        title: "Create basic UI components",
        description: "Develop reusable UI components based on design system",
        status: "done",
        priority: "medium",
        assignee: { name: "Sarah Miller", avatar: "/avatars/02.png" },
        storyPoints: 8,
      },
    ],
  },
]

export function SprintManagement() {
  const [sprints, setSprints] = useState<Sprint[]>(sampleSprints)
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [newSprint, setNewSprint] = useState({
    name: "",
    startDate: "",
    endDate: "",
  })
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    storyPoints: 0,
    assignee: "",
  })

  const handleCreateSprint = () => {
    if (!newSprint.name || !newSprint.startDate || !newSprint.endDate) return

    const sprint: Sprint = {
      id: (sprints.length + 1).toString(),
      name: newSprint.name,
      startDate: newSprint.startDate,
      endDate: newSprint.endDate,
      status: "planning",
      progress: 0,
      tasks: [],
    }

    setSprints([sprint, ...sprints])
    setNewSprint({ name: "", startDate: "", endDate: "" })
    setIsCreateSprintOpen(false)
  }

  const handleCreateTask = () => {
    if (!selectedSprint || !newTask.title) return

    const task: Task = {
      id: `t${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: "todo",
      priority: newTask.priority as "low" | "medium" | "high",
      assignee: { name: "Unassigned", avatar: "/avatars/placeholder.svg" },
      storyPoints: newTask.storyPoints || 0,
    }

    const updatedSprints = sprints.map((sprint) =>
      sprint.id === selectedSprint.id ? { ...sprint, tasks: [...sprint.tasks, task] } : sprint,
    )

    setSprints(updatedSprints)
    setNewTask({ title: "", description: "", priority: "medium", storyPoints: 0, assignee: "" })
    setIsCreateTaskOpen(false)
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="default">Medium</Badge>
      case "low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
      case "in-progress":
        return <ArrowRightCircle className="h-4 w-4 text-blue-500" />
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Sprint Management</h2>
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
              <DialogDescription>Plan a new sprint for your project.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sprint-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="sprint-name"
                  value={newSprint.name}
                  onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
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
                  onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
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
                  onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateSprint}>Create Sprint</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sprints.map((sprint) => (
        <Card key={sprint.id} className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle>{sprint.name}</CardTitle>
                <CardDescription>
                  {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <Badge
                  variant={
                    sprint.status === "active" ? "default" : sprint.status === "completed" ? "secondary" : "outline"
                  }
                >
                  {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
                </Badge>
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
                      <DialogDescription>Create a new task for this sprint.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-title" className="text-right">
                          Title
                        </Label>
                        <Input
                          id="task-title"
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
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
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="task-priority" className="text-right">
                          Priority
                        </Label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
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
                            setNewTask({ ...newTask, storyPoints: Number.parseInt(e.target.value) || 0 })
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
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between mb-1 text-xs">
                <span>{sprint.progress}% Complete</span>
                <span>{sprint.tasks.length} Tasks</span>
              </div>
              <Progress value={sprint.progress} className="h-2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="font-medium text-sm flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  To Do
                </div>
                {sprint.tasks
                  .filter((task) => task.status === "todo")
                  .map((task) => (
                    <Card key={task.id} className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Move to In Progress</DropdownMenuItem>
                            <DropdownMenuItem>Move to Done</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Remove from Sprint</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={task.assignee.avatar} />
                            <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{task.storyPoints} pts</span>
                        </div>
                        {getPriorityBadge(task.priority)}
                      </div>
                    </Card>
                  ))}
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm flex items-center">
                  <ArrowRightCircle className="mr-2 h-4 w-4 text-blue-500" />
                  In Progress
                </div>
                {sprint.tasks
                  .filter((task) => task.status === "in-progress")
                  .map((task) => (
                    <Card key={task.id} className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Move to To Do</DropdownMenuItem>
                            <DropdownMenuItem>Move to Done</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Remove from Sprint</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={task.assignee.avatar} />
                            <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{task.storyPoints} pts</span>
                        </div>
                        {getPriorityBadge(task.priority)}
                      </div>
                    </Card>
                  ))}
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm flex items-center">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  Done
                </div>
                {sprint.tasks
                  .filter((task) => task.status === "done")
                  .map((task) => (
                    <Card key={task.id} className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Move to To Do</DropdownMenuItem>
                            <DropdownMenuItem>Move to In Progress</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Remove from Sprint</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={task.assignee.avatar} />
                            <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{task.storyPoints} pts</span>
                        </div>
                        {getPriorityBadge(task.priority)}
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              <Clock className="inline-block mr-1 h-4 w-4" />
              {sprint.status === "active"
                ? `${Math.ceil((new Date(sprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining`
                : sprint.status === "completed"
                  ? "Completed"
                  : "Not started"}
            </div>
            <Button variant="outline" size="sm">
              Sprint Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

