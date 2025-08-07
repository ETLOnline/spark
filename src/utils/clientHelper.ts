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

export function prepareTaskEmailData(task: any) {
  const assigneeName = task.assignee
    ? `${task.assignee.first_name} ${task.assignee.last_name}`.trim()
    : "Unassigned"

  const assignorName = task.assignor
    ? `${task.assignor.first_name} ${task.assignor.last_name}`.trim()
    : "System"

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  return {
    task_title: task.task_title || "N/A",
    task_id: task.task_num || "N/A",
    project_name: task.project_name || "N/A",
    priority: task.task_priority || "N/A",
    assignee_name: assigneeName,
    assignor_name: assignorName,
    issue_type: task.task_type || "N/A",
    description: task.description || "No description provided.",
    task_url: `${baseUrl}/project/${task.project_id}/task/${task.id}`
  }
}
