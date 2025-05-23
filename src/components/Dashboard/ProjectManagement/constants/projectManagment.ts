import { InsertTaskStatus } from "@/src/db/schema"
  
export const projectTaskTypes = [
  {
    key: "story",
    title: "Story",
    icon: "lightbulb",
    iconColor: "#22c55e",
    badgeVariant: "default",
  },
  {
    key: "bug",
    title: "Bug",
    icon: "bug",
    iconColor: "#ef4444",
    badgeVariant: "destructive",
  },
  {
    key: "task",
    title: "Task",
    icon: "circle-check",
    iconColor: "#3b82f6",
    badgeVariant: "secondary",
  },
  {
    key: "epic",
    title: "Epic",
    icon: "rocket",
    iconColor: "#a855f7",
    badgeVariant: "default"
  }
]

    
  export const projectTaskPriority = [
    {
      key:"lowest",
      title: "Lowest",
      icon: "flag",
      iconColor: "#6b7280",
      badgeBorderColor: "#6b7280",
      badgeTextColor: "#6b7280"
    },
    {
      key:"low",
      title: "Low",
      icon: "flag",
      iconColor: "#22c55e",
      badgeBorderColor: "#22c55e",
      badgeTextColor: "#22c55e"
    },
    {
      key: "medium",
      title: "Medium",
      icon: "flag",
      iconColor: "#eab308",
      badgeBorderColor: "#eab308",
      badgeTextColor: "#eab308"
    },
    {
      key: "high",
      title: "High",
      icon: "flag",
      iconColor: "#f97316",
      badgeBorderColor: "#f97316",
      badgeTextColor: "#f97316"
    },
    {
      key: "highest",
      title: "Highest",
      icon: "flag",
      iconColor: "#dc2626",
      badgeBorderColor: "#dc2626",
      badgeTextColor: "#dc2626"
    }
  ]

interface InsertTaskStatusEx extends InsertTaskStatus {
  iconColor: string
}


export const projectDefaultStatuses : Partial<InsertTaskStatusEx>[]  = [
  {
    name: "Backlog",
    status_slug: "backlog",
    position: 0,
    iconColor: "#3a3c40",
  },
  {
    name: "To Do",
    status_slug: "to-do",
    position: 1,
    iconColor: "#3b82f6",
  },
  {
    name: "In Progress",
    status_slug: "in-progress",
    position: 2,
    iconColor: "#eab308",
  },
  {
    name: "Done",
    status_slug: "done",
    position: 3,
    iconColor: "#22c55e",
  },

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
    key: "files",
    link: "/files",
    title: "Files",
    icon: "files"
  },
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
  },
]