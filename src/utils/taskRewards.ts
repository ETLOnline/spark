import { SelectTask } from "@/src/db/schema"
import { ProjectStatus } from "@/src/components/Dashboard/ProjectManagement/types/projectStatus.type"

/**
 * Determines whether a task meets the completion criteria.
 *
 * Currently: task status slug must be "done".
 *
 * Future: when a `completion_definition` column is added to the task table,
 * this function will read that column and apply the configured criteria.
 * No other file needs to change — only this function.
 */
export function meetsCompletionCriteria(task: SelectTask): boolean {
  // Future hook — swap this block when completion_definition column is ready:
  // if (task.completion_definition) {
  //   return evaluateCompletionDefinition(task, task.completion_definition)
  // }
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