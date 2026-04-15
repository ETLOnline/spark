import { SelectTask } from "@/src/db/schema"
import { ProjectStatus } from "@/src/components/Dashboard/ProjectManagement/types/projectStatus.type"

/**
 * Determines whether a task meets the completion criteria.
 *
 * Logic:
 * 1. Check if task's status has `defination_of_completion = true` in tasks_status table
 *    → If yes, task is complete
 * 2. Fallback: Check if status slug is "done"
 *    → If yes, task is complete
 * 3. Otherwise: Not complete
 *
 * This allows projects to configure which statuses count as "completion"
 */
export function meetsCompletionCriteria(task: SelectTask): boolean {
  
  if (task.status?.defination_of_completion === true) {
    return true
  }

  return task.status?.status_slug === ProjectStatus.Done
}

/**
 * Returns all user IDs who should receive a TaskCompletion reward.
 *
 * Currently: the assignee and the tester (tested_by) both get rewarded.
 * Deduplicates in case the same person holds both roles.
 *
 * Future: the completion_definition column may specify a different set
 * of recipients. Only this function needs to change.
 */
export function getTaskCompletionRecipients(task: SelectTask): string[] {
  const recipients: string[] = []
  if (task.assign_to) recipients.push(task.assign_to)
  if (task.tested_by) recipients.push(task.tested_by)
  return [...new Set(recipients)]
}