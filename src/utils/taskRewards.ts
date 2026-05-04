import { SelectTask } from "@/src/db/schema"
import { ProjectStatus } from "@/src/components/Dashboard/ProjectManagement/types/projectStatus.type"

export function meetsCompletionCriteria(task: SelectTask): boolean {
  if (task.status?.defination_of_completion === true) {
    return true
  }

  return task.status?.status_slug === ProjectStatus.Done
}

export function getTaskCompletionRecipients(task: SelectTask): string[] {
  const recipients: string[] = []
  if (task.assign_to) recipients.push(task.assign_to)
  else if (task.created_by) recipients.push(task.created_by)
  return [...new Set(recipients)]
}
