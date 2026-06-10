import { SelectTask } from "@/src/db/schema"
import { projectTaskTypes, TaskType } from "../constants/projectManagment"
import { TaskFiltersType } from "../types/taskFilters.type"

export function getChildTypes(parentTypeKey: string) {
  const parentType = projectTaskTypes.find((t) => t.key === parentTypeKey)
  return projectTaskTypes.filter((t) =>
    parentType?.acceptedChildTypes.includes(t.key)
  )
}

export function getParentTypes(childTypeKey: string) {
  return projectTaskTypes.filter((t) =>
    t.acceptedChildTypes.includes(childTypeKey as TaskType)
  )
}

export const filterTasks = (
  tasks: SelectTask[],
  sprintId: string,
  filters: TaskFiltersType | null
) => {
  return tasks.filter((t) => {
    return (
      t?.sprint_id === sprintId &&
      (!filters?.priority?.length ||
        filters.priority.includes(t.task_priority)) &&
      (!filters?.type?.length || filters.type.includes(t.task_type)) &&
      (!filters?.status?.length ||
        filters.status.includes(t.status_id || "")) &&
      (!filters?.assignee?.length ||
        filters.assignee.includes(t.assign_to || "")) &&
      (!filters?.creator?.length ||
        filters.creator.includes(t.created_by || ""))
    )
  })
}
