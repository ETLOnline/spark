import { projectTaskTypes, TaskType } from "../../constants/projectManagment"

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
