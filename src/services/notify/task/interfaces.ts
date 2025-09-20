import { SelectUser } from "@/src/db/schema"

// Status interface
export interface TaskStatus {
  id: string
  name: string
}

// Task interface (for both current and old task)
export interface Task {
  id: string
  task_num: string
  task_title: string
  task_priority: string
  task_type: string
  description?: string
  project_id: string
  project_name: string
  assignee?: SelectUser
  assignor?: SelectUser
  status?: TaskStatus
}

// Change tracking interface
export interface TaskChange {
  oldValue: any
  newValue: any
}

// Changes object interface
export interface TaskChanges {
  task_title?: TaskChange
  priority?: TaskChange
  assignee?: TaskChange
  issue_type?: TaskChange
  status?: TaskChange
}

// Return type interface for the function
export interface TaskEmailData {
  logo_url: string
  task_title: string
  task_id: string
  project_name: string
  priority: string
  assignee_name: string
  assignor_name: string
  issue_type: string
  description: string
  task_url: string
  changes: TaskChanges
}
