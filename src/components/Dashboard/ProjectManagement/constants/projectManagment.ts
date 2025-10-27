import { InsertTaskStatus } from "@/src/db/schema"

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
    status_slug: "to-do",
    position: 1,
    iconColor: "#3b82f6"
  },
  {
    name: "In Progress",
    status_slug: "in-progress",
    position: 2,
    iconColor: "#eab308"
  },
  {
    name: "Done",
    status_slug: "done",
    position: 3,
    iconColor: "#22c55e"
  }
]

export const ProjectManagementPages = [
  {
    key: "overview",
    link: "/overview",
    title: "Overview",
    icon: "picture-in-picture-2"
  },
  {
    key: "sprint",
    link: "/sprint",
    title: "Sprint",
    icon: "chart-gantt"
  },
  {
    key: "board",
    link: "/board",
    title: "Board",
    icon: "square-kanban"
  },
  {
    key: "backlog",
    link: "/backlog",
    title: "Backlog",
    icon: "list-todo"
  },
  // For future use
  // {
  //   key: "files",
  //   link: "/files",
  //   title: "Files",
  //   icon: "files"
  // },
  {
    key: "teams",
    link: "/teams",
    title: "Teams",
    icon: "users"
  },
  {
    key: "settings",
    link: "/settings",
    title: "Settings",
    icon: "settings"
  }
]

export const SprintStatus = [
  {
    key: "upcomming",
    title: "Upcoming",
    badgeVariants: "outline"
  },
  {
    key: "active",
    title: "Active",
    badgeVariants: "default"
  },
  {
    key: "ended",
    title: "Ended",
    badgeVariants: "secondary"
  }
]
