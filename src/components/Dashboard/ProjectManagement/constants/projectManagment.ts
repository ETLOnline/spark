import { InsertTaskStatus, SelectTask } from "@/src/db/schema"
import { ProjectStatus } from "../types/projectStatus.type"

export enum TaskType {
  STORY = "story",
  BUG = "bug",
  TASK = "task",
  EPIC = "epic",
  SUBTASK = "subtask",
  SPIKE = "spike",
  FEATURE = "feature"
}

export enum TaskPriority {
  LOWEST = "lowest",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  HIGHEST = "highest"
}

export enum SprintStatus {
  UPCOMING = "upcomming",
  ACTIVE = "active",
  ENDED = "ended"
}

export const projectTaskTypes = [
  {
    key: TaskType.STORY,
    title: "Story",
    icon: "book-open-text",
    iconColor: "#22c55e",
    badgeVariant: "default",
    acceptedChildTypes: [TaskType.SUBTASK]
  },
  {
    key: TaskType.BUG,
    title: "Bug",
    icon: "bug",
    iconColor: "#ef4444",
    badgeVariant: "destructive",
    acceptedChildTypes: []
  },
  {
    key: TaskType.TASK,
    title: "Task",
    icon: "square-check",
    iconColor: "#3b82f6",
    badgeVariant: "secondary",
    acceptedChildTypes: [TaskType.SUBTASK]
  },
  {
    key: TaskType.EPIC,
    title: "Epic",
    icon: "layers",
    iconColor: "#a855f7",
    badgeVariant: "default",
    acceptedChildTypes: [TaskType.STORY, TaskType.TASK, TaskType.BUG]
  },
  {
    key: TaskType.SUBTASK,
    title: "Subtask",
    icon: "list-minus",
    iconColor: "#3b82f6",
    badgeVariant: "secondary",
    acceptedChildTypes: []
  },
  {
    key: TaskType.FEATURE,
    title: "Feature",
    icon: "sparkles",
    iconColor: "#3b82f6",
    badgeVariant: "secondary",
    acceptedChildTypes: [TaskType.STORY, TaskType.TASK, TaskType.BUG]
  },
  {
    key: TaskType.SPIKE,
    title: "Spike",
    icon: "zap",
    iconColor: "#ef4444",
    badgeVariant: "destructive",
    acceptedChildTypes: []
  }
]

export const projectTaskPriority = [
  {
    key: TaskPriority.LOWEST,
    title: "Lowest",
    icon: "chevrons-down",
    iconColor: "#22c55e", // green-500
    badgeBorderColor: "#22c55e",
    badgeTextColor: "#22c55e"
  },
  {
    key: TaskPriority.LOW,
    title: "Low",
    icon: "chevron-down",
    iconColor: "#22c55e", // green-500
    badgeBorderColor: "#22c55e",
    badgeTextColor: "#22c55e"
  },
  {
    key: TaskPriority.MEDIUM,
    title: "Medium",
    icon: "equal",
    iconColor: "#eab308", // yellow-500
    badgeBorderColor: "#eab308",
    badgeTextColor: "#eab308"
  },
  {
    key: TaskPriority.HIGH,
    title: "High",
    icon: "chevron-up",
    iconColor: "#ef4444", // red-500
    badgeBorderColor: "#ef4444",
    badgeTextColor: "#ef4444"
  },
  {
    key: TaskPriority.HIGHEST,
    title: "Highest",
    icon: "chevrons-up",
    iconColor: "#ef4444", // red-500
    badgeBorderColor: "#ef4444",
    badgeTextColor: "#ef4444"
  }
]

interface InsertTaskStatusEx extends InsertTaskStatus {
  iconColor: string
}

export const projectDefaultStatuses: Partial<InsertTaskStatusEx>[] = [
  {
    name: "To Do",
    status_slug: ProjectStatus.ToDo,
    position: 1,
    iconColor: "#3b82f6"
  },
  {
    name: "In Progress",
    status_slug: ProjectStatus.InProgress,
    position: 2,
    iconColor: "#eab308"
  },
  {
    name: "Done",
    status_slug: ProjectStatus.Done,
    position: 3,
    iconColor: "#22c55e"
  }
]

export const ProjectManagementPages = [
  {
    key: "overview",
    title: "Overview",
    icon: "picture-in-picture-2"
  },
  {
    key: "details",
    title: "About Project",
    icon: "info"
  },
  {
    key: "sprint",
    title: "Sprint",
    icon: "chart-gantt"
  },
  {
    key: "board",
    title: "Board",
    icon: "square-kanban"
  },
  {
    key: "backlog",
    title: "Backlog",
    icon: "list-todo"
  },
  // For future use
  // {
  //   key: "files",
  //   title: "Files",
  //   icon: "files"
  // },
  {
    key: "teams",
    title: "Teams",
    icon: "users"
  },
  {
    key: "settings",
    title: "Settings",
    icon: "settings"
  }
]

export const sprintStatuses = [
  {
    key: SprintStatus.UPCOMING,
    title: "Upcoming",
    badgeVariants: "outline"
  },
  {
    key: SprintStatus.ACTIVE,
    title: "Active",
    badgeVariants: "default"
  },
  {
    key: SprintStatus.ENDED,
    title: "Ended",
    badgeVariants: "secondary"
  }
]

const fieldsToCompare: (keyof SelectTask)[] = [
  "task_title",
  "status",
  "task_priority",
  "assignee",
  "assignor",
  "task_type",
  "story_points"
]

export const TaskHistory = (oldTask: SelectTask, newTask: SelectTask) => {
  const changes: { key: string; old: any; new: any }[] = []

  const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)

  fieldsToCompare.forEach((key) => {
    if (!isEqual(oldTask[key], newTask[key])) {
      if (key === "assignee" || key === "assignor") {
        changes.push({
          key,
          old: `${oldTask[key]?.first_name ?? ""} ${oldTask[key]?.last_name ?? ""}`,
          new: `${newTask[key]?.first_name ?? ""} ${newTask[key]?.last_name ?? ""}`
        })
      } else if (key === "status") {
        changes.push({
          key,
          old: oldTask[key]?.name ?? "",
          new: newTask[key]?.name ?? ""
        })
      } else {
        changes.push({
          key,
          old: oldTask[key],
          new: newTask[key]
        })
      }
    }
  })

  return changes
}
