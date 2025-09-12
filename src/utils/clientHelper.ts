import { CommunityDetailData } from "../db/data-access/communities/query"
import { SelectChannel, SelectSpace } from "../db/schema"

export type RawUserPerms = {
  global?: string[]
  scoped?: {
    [entityType: string]: {
      // channel | chat
      [entityId: string]: string[] // posting.create chat.create
    }
  }
}

export type UserPerms = {
  global: Set<string>
  scoped: {
    [entityType: string]: {
      [entityId: string]: Set<string>
    }
  }
}

const defaultPermissions: UserPerms = {
  global: new Set(),
  scoped: {}
}

export function transformRawPermsToSet(
  rawPerms?: RawUserPerms
): UserPerms | null {
  if (!rawPerms) return null

  const global = new Set(Array.isArray(rawPerms.global) ? rawPerms.global : [])

  const scoped: UserPerms["scoped"] = {}

  if (rawPerms.scoped) {
    for (const entityType in rawPerms.scoped) {
      scoped[entityType] = {}

      for (const entityId in rawPerms.scoped[entityType]) {
        const permissionArray = rawPerms.scoped[entityType][entityId] || []
        scoped[entityType][entityId] = new Set(permissionArray)
      }
    }
  }

  return { global, scoped }
}

export interface RawPermissionRow {
  namespace: string
  action: string
  entity_type: string | null
  entity_id: string | null
}

export function buildUserPerms(rows: RawPermissionRow[]): UserPerms {
  const global: Set<string> = new Set()
  const scoped: UserPerms["scoped"] = {}

  for (const row of rows) {
    const key = `${row.namespace}.${row.action}`

    if (!row.entity_type || !row.entity_id) {
      global.add(key)
    } else {
      if (!scoped[row.entity_type]) scoped[row.entity_type] = {}
      if (!scoped[row.entity_type][row.entity_id])
        scoped[row.entity_type][row.entity_id] = new Set()

      scoped[row.entity_type][row.entity_id].add(key)
    }
  }

  return {
    global,
    scoped: Object.keys(scoped).length ? scoped : {}
  }
}

// Entity is channel or space or community
export function isEntityUser(
  entity: SelectChannel | SelectSpace | CommunityDetailData,
  currentUserId: string
): boolean {
  return (
    entity?.users?.some(
      (u: { user_id: string }) => u.user_id === currentUserId
    ) ?? false
  )
}

export function prepareTaskEmailData(task: any, oldTask: any) {
  const assigneeName = task.assignee
    ? `${task.assignee.first_name} ${task.assignee.last_name}`.trim()
    : "Unassigned"

  const oldAssigneeName = oldTask.assignee
    ? `${oldTask.assignee.first_name} ${oldTask.assignee.last_name}`.trim()
    : "Unassigned"

  const assignorName = task.assignor
    ? `${task.assignor.first_name} ${task.assignor.last_name}`.trim()
    : "System"

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const changes: { [key: string]: { oldValue: any; newValue: any } } = {}

  // Compare fields and log changes
  if (oldTask.task_title !== task.task_title) {
    changes.task_title = {
      oldValue: oldTask.task_title,
      newValue: task.task_title
    }
  }
  if (oldTask.task_priority !== task.task_priority) {
    changes.priority = {
      oldValue: oldTask.task_priority,
      newValue: task.task_priority
    }
  }
  if (oldTask.assignee?.id !== task.assignee?.id) {
    changes.assignee = { oldValue: oldAssigneeName, newValue: assigneeName }
  }
  if (oldTask.task_type !== task.task_type) {
    changes.issue_type = {
      oldValue: oldTask.task_type,
      newValue: task.task_type
    }
  }
  if (oldTask.status?.id !== task.status?.id) {
    const oldStatus = oldTask.status ? oldTask.status.name : "N/A"
    const newStatus = task.status ? task.status.name : "N/A"
    changes.status = { oldValue: oldStatus, newValue: newStatus }
  }
  const logoUrl = getSiteLogoUrl()
  const taskUrl = createAbsoluteUrl(
    `/project/${task.project_id}/task/${task.id}`
  )

  return {
    logo_url: logoUrl,
    task_title: task.task_title || "N/A",
    task_id: task.task_num || "N/A",
    project_name: task.project_name || "N/A",
    priority: task.task_priority || "N/A",
    assignee_name: assigneeName,
    assignor_name: assignorName,
    issue_type: task.task_type || "N/A",
    description: task.description || "No description provided.",
    task_url: taskUrl,
    changes: changes
  }
}

export function createAbsoluteUrl(relativePath: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_BASE_URL is not defined in environment variables."
    )
  }

  try {
    const url = new URL(relativePath, baseUrl)
    return url.toString()
  } catch (error) {
    console.error(
      `Invalid URL creation with base: ${baseUrl} and path: ${relativePath}`
    )
    throw error
  }
}
export function getSiteLogoUrl(): string {
  const LOGO_PATH = "/logo/spark-logo-animated-themed.gif"
  return createAbsoluteUrl(LOGO_PATH)
}
